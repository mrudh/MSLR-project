const express = require('express')
const cors = require('cors')
const VoterModel = require('./models/Voters')
const bcrypt = require('bcrypt')
const SccCodeModel = require('./models/SccCode');
const ReferendumModel = require('./models/Referendum');
const VoterHistory = require('./models/VoterHistory');
const {authenticateJWT, requireEC, requireVoter} = require('./middleware/Auth');
require("dotenv").config();
const connectDB = require("./config/db");
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET missing in environment");
const Counter = require('./models/Counter');


const app = express()
app.use(express.json())
app.use(cors())


connectDB().catch((err) => {
  console.error("MongoDB connection error:", err.message);
  process.exit(1);
});


function toMSLRReferendum(refDoc) {
  const ref = refDoc.toObject ? refDoc.toObject() : refDoc;
  return {
    referendum_id:String(ref.referendum_id),
    status:ref.status || "",
    referendum_title:String(ref.title || ""),
    referendum_desc:String(ref.description || ""),
    referendum_options: {
      options:(ref.options || []).map((opt) => ({
        [String(opt.option_id)]: "option "+ opt.option_id + " - "+ opt.text,
        votes: String(opt.votesCount ?? 0),
      })),
    },
  };
}

app.get('/mslr/referendums', async (req, res) => {
  try {
    const { status } = req.query;
    if (!status || !['open', 'closed'].includes(status)) {
      return res.status(400).json({
        error: "Query param 'status' must be 'open' or 'closed'.",
      });
    }

    const refs = await ReferendumModel.find({status}).sort({referendum_id:1});

    return res.json({
      Referendums: refs.map(toMSLRReferendum),
    });
  } catch (err) {
    console.error('Error in GET /mslr/referendums:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

app.get('/mslr/referendum/:id', async (req, res) => {
  try {
    const numericId = Number(req.params.id);
    if (Number.isNaN(numericId)) {
      return res.status(400).json({error: 'Referendum id must be a number.'});
    }

    const status = (req.query.status || '').toLowerCase().trim();

    if (status && !['open', 'closed'].includes(status)) {
      return res.status(400).json({
        error: "Query param 'status' must be 'open' or 'closed'.",
      });
    }

    const filter = { referendum_id: numericId };
    if (status) filter.status = status;

    const ref = await ReferendumModel.findOne(filter);
    if (!ref) {
      return res.status(404).json({error: 'Referendum not found.'});
    }
    return res.json(toMSLRReferendum(ref));
  } catch (err) {
    console.error('Error in GET /mslr/referendum/:id:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

app.post('/register', async (req, res) => {
  try {
    const { name, email, password, dob, sccCode } = req.body;
    const errors = {};
    let stdScc;

    if (!name || name.trim() === '') {
      errors.name = 'Name is required.';
    }

    if (!email || email.trim() === '') {
      errors.email = 'Email is required.';
    } else {
        const existingVoter = await VoterModel.findOne({ email });
        if (existingVoter) {
            errors.email = 'This email is already registered.';
        }
    }

    if (!password || password.trim() === '') {
        errors.password = 'Password is required.';
    }


    if (!dob) {
        errors.dob = 'Date of birth is required.';
    } else {
        const birthDate = new Date(dob);
        if (Number.isNaN(birthDate.getTime())) {
            errors.dob = 'Please enter a valid date of birth.';
        } else {
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const month = today.getMonth() - birthDate.getMonth();
            if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            if (age < 18) {
                errors.dob = 'You must be at least 18 years old to register to vote.';
            }
        }
    }

    if (!sccCode || sccCode.trim() === '') {
        errors.sccCode = 'SCC code is required.';
    } else {
        stdScc = sccCode.trim().toUpperCase();
        const code = await SccCodeModel.findOne({ scc: stdScc });

        if (!code) {
            errors.sccCode = 'Invalid SCC code.';
        } else if (code.used) {
            errors.sccCode = 'This SCC code has already been used.';
        }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const voter = await VoterModel.create({
      name,
      email,
      password: hashedPassword,
      dob,
      sccCode: stdScc
    });

    await SccCodeModel.updateOne(
      { scc: stdScc },
      { $set: { used: true } }
    );

    return res
        .status(201)
        .json({ message: 'REGISTER_SUCCESS', voterId: voter._id });
    } catch (err) {
        console.error('Error in /register:', err);
        return res
            .status(500)
            .json({ errors: { form: 'Internal server error. Please try again.' } });
    }
});


app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const errors = {};
    if (!email || email.trim() === '') {
        errors.email = 'Email is required.';
    }
    if (!password) {
        errors.password = 'Password is required.';
    }

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
    }

    const voter = await VoterModel.findOne({ email });

    if (!voter) {
        return res.status(400).json({
            errors: {
                email: 'Invalid email or password.',
                password: 'Invalid email or password.',
            },
        });
    }

    const isMatch = await bcrypt.compare(password, voter.password);

    if (!isMatch) {
        return res.status(400).json({
            errors: {
                email: 'Invalid email or password.',
                password: 'Invalid email or password.',
            },
        });
    }

    const payload = {
        userId: voter._id.toString(),
        email: voter.email,
        role: voter.role || 'voter',
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    return res.json({
        message: 'LOGIN_SUCCESS',
        token,
        role: payload.role,
    });
    } catch (err) {
        console.error('Error in /login:', err);
        return res
            .status(500)
            .json({ errors: { form: 'Internal server error. Please try again.' } });
    }
});

app.get("/ec/stats", authenticateJWT, requireEC, async (req, res) => {
  try {
    const totalPopulation = await VoterModel.countDocuments();
    const eligibleVoters = await VoterModel.countDocuments({ role: "voter" });

    const votedDistinct = await VoterHistory.distinct("voter");
    const votersWhoVoted = votedDistinct.length;

    const pct = eligibleVoters > 0 ? (votersWhoVoted / eligibleVoters) * 100 : 0;

    return res.json({
      totalPopulation,
      eligibleVoters,
      percentVoted: Number(pct.toFixed(0)),
    });
  } catch (e) {
    return res.status(500).json({ errors: { form: "Failed to load stats." } });
  }
});


app.post('/referendums', authenticateJWT, requireEC, async (req, res) => {
    try {
        const { title, description, options } = req.body;

        const safeTitle = (title || '').trim();
        const safeDesc = (description || '').trim();
        const cleanedOptions = Array.isArray(options)
          ? options.map(o => (o || '').trim()).filter(Boolean)
          : [];

        if (!safeTitle || cleanedOptions.length < 2) {
        return res.status(400).json({
            errors: { form: 'Title and at least two options are required.' },
        });
        }

        const counter = await Counter.findOneAndUpdate(
            { name: 'referendum_id' },
            { $inc: {seq:1} },
            { new: true, upsert: true }
        );

        const referendumIdNumber = counter.seq;

        const formattedOptions = cleanedOptions.map((text, idx) => ({
            option_id: idx + 1,
            text,
            votesCount: 0,
        }));

        const ref = await ReferendumModel.create({
            referendum_id: referendumIdNumber,
            title: safeTitle,
            description: safeDesc,
            options: formattedOptions,
            status: '',
            hasEverOpened: false,
        });
        return res.status(201).json(ref);
    } catch (err) {
        console.error('Error creating referendum:', err);
        return res.status(500).json({
            errors: { form: 'Internal server error while creating referendum.' },
        });
    }
});


app.put('/referendums/:id', authenticateJWT, requireEC, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, options } = req.body;

    const ref = await ReferendumModel.findById(id);
    if (!ref) {
      return res
        .status(404)
        .json({ errors: { form: 'Referendum not found.' } });
    }

    if (ref.hasEverOpened) {
      return res.status(400).json({
        errors: {
          form:
            'This referendum has already been opened to voters and can no longer be edited (title, description, or options).',
        },
      });
    }

    if (title !== undefined) {
      ref.title = title;
    }
    if (description !== undefined) {
      ref.description = description;
    }
    if (options && Array.isArray(options)) {
      const cleaned = options
        .map((o) => (typeof o === 'string' ? o.trim() : ''))
        .filter((o) => o.length > 0);

      if (cleaned.length < 2) {
        return res.status(400).json({
          errors: {
            form: 'Please provide at least two options.',
          },
        });
      }

      ref.options = cleaned.map((text, idx) => ({
        option_id: idx + 1,
        text,
        votesCount: 0,
      }));

    }

    await ref.save();
    return res.json(ref);
  } catch (err) {
    console.error('Error editing referendum:', err);
    return res.status(500).json({
      errors: { form: 'Internal server error while editing referendum.' },
    });
  }
});



app.patch('/referendums/:id/status', authenticateJWT, requireEC, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['open', 'closed'].includes(status)) {
      return res.status(400).json({
        errors: { form: "Status must be 'open' or 'closed'." },
      });
    }

    const ref = await ReferendumModel.findById(id);
    if (!ref) {
      return res.status(404).json({ errors: { form: 'Referendum not found.' } });
    }

    if (status === 'open') {
      ref.status = 'open';
      ref.openedAt = new Date();

      if (!ref.hasEverOpened) {
        ref.hasEverOpened = true;
      }
    }

    if (status === 'closed') {
      ref.status = 'closed';
      ref.closedAt = new Date();
    }

    await ref.save();
    return res.json(ref);
  } catch (err) {
    console.error('Error updating referendum status:', err);
    return res.status(500).json({
      errors: { form: 'Internal server error while updating status.' },
    });
  }
});




app.get('/referendums', authenticateJWT, requireEC, async (req, res) => {
  try {
    const refs = await ReferendumModel.find().sort({ createdAt: -1 });
    return res.json(refs);
  } catch (err) {
        console.error('Error fetching referendums:', err);
        return res.status(500).json({
            errors: { form: 'Internal server error while fetching referendums.' },
        });
  }
});


app.get('/voter/referendums', authenticateJWT, requireVoter, async (req, res) => {
  try {
    const voterId = req.user.userId;
    const refs = await ReferendumModel
      .find({ hasEverOpened: true })
      .sort({ createdAt: 1 });
    const history = await VoterHistory.find({
      voter: voterId,
      referendum: { $in: refs.map((r) => r._id) },
    });
    const votedMap = new Map();
    history.forEach((vh) => {
      votedMap.set(vh.referendum.toString(), vh.optionId.toString());
    });
    const result = refs.map((r) => {
      const refObj = r.toObject();
      const votedOptionId = votedMap.get(r._id.toString());
      return {
        ...refObj,
        alreadyVoted: !!votedOptionId,
        votedOptionId: votedOptionId || null,
      };
    });
    return res.json(result);
  } catch (err) {
        console.error('Error in /voter/referendums:', err);
        return res
        .status(500)
        .json({ errors: { form: 'Internal server error while loading referendums.' } });
  }
});


app.post('/vote', authenticateJWT, requireVoter, async (req, res) => {
  try {
    const { referendumId, optionId } = req.body;
    const voterId = req.user.userId;

    if (!referendumId || optionId === undefined || optionId === null) {
      return res.status(400).json({ errors: { form: 'referendumId and optionId are required.' } });
    }

    const ref = await ReferendumModel.findById(referendumId);
    if (!ref) {
      return res.status(404).json({ errors: { form: 'Referendum not found.' } });
    }

    if (ref.status !== 'open') {
      return res.status(400).json({ errors: { form: 'Referendum is not open for voting.' } });
    }

    const existingVote = await VoterHistory.findOne({ voter: voterId, referendum: ref._id });
    if (existingVote) {
      return res.status(400).json({ errors: { form: 'You have already voted in this referendum.' } });
    }

    const optionIdNum = Number(optionId);
    if (Number.isNaN(optionIdNum)) {
      return res.status(400).json({ errors: { form: 'optionId must be a number.' } });
    }

    const optionIndex = (ref.options || []).findIndex((o) => Number(o.option_id) === optionIdNum);
    if (optionIndex === -1) {
      return res.status(404).json({ errors: { form: 'Option not found.' } });
    }

    ref.options[optionIndex].votesCount = (ref.options[optionIndex].votesCount || 0) + 1;

    try {
      await VoterHistory.create({
        voter: voterId,
        referendum: ref._id,  
        referendum_id: Number(ref.referendum_id),
        optionId: optionIdNum,
      });
    } catch (e) {
      if (e && e.code === 11000) {
        return res.status(400).json({ errors: { form: 'You have already voted in this referendum.' } });
      }
      throw e;
    }

    const totalVoters = await VoterModel.countDocuments({ role: 'voter' });
    if (totalVoters > 0 && ref.options[optionIndex].votesCount >= 0.5 * totalVoters) {
      ref.status = 'closed';
      ref.closedAt = new Date();
    }

    await ref.save();

    return res.json({ message: 'VOTE_RECORDED', referendum: ref });
  } catch (err) {
    console.error('Error in /vote:', err);
    return res.status(500).json({
      errors: { form: err?.message || 'Internal server error while recording vote.' },
    });
  }
});

app.get("/ec/overview", authenticateJWT, requireEC, async (req, res) => {
  try {
    const refs = await ReferendumModel.find().sort({ referendum_id: 1 });

    const overview = refs.map((r) => {
      const totalVotes = (r.options || []).reduce((s, o) => s + (o.votesCount || 0), 0);

      let leader = null;
      if (r.options?.length) {
        const top = [...r.options].sort((a, b) => (b.votesCount || 0) - (a.votesCount || 0))[0];
        leader = top ? { text: top.text, votes: top.votesCount || 0 } : null;
      }

      return {
        referendum_id: r.referendum_id,
        title: r.title,
        status: r.status,
        totalVotes,
        leader,
      };
    });

    return res.json({ overview });
  } catch (e) {
    console.error("Error in GET /ec/overview:", e);
    return res.status(500).json({ errors: { form: "Failed to load overview." } });
  }
});


app.listen(3001, () => {
    console.log("server is running")
}) 