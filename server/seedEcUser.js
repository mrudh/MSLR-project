require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const VoterModel = require('./models/Voters');
const SccCodeModel = require('./models/SccCode');
const bcrypt = require('bcrypt');

async function seedEC() {
    try {
        await connectDB();

        const EC_EMAIL = 'ec@referendum.gov.sr';
        const EC_PASSWORD = 'Shangrilavote&2025@';

        let ecUser = await VoterModel.findOne({ role: 'ec' });
        if (ecUser) {
            console.log('EC user already exists: ' + ecUser.email);
            return;
        }

        ecUser = await VoterModel.findOne({ email: EC_EMAIL });
        if (ecUser) {
            console.log('A user with EC email already exists but is not marked as EC. Updating role...');
            ecUser.role = 'ec';
            await ecUser.save();
            console.log('Updated existing user to EC role.');
            return;
        }

        let ecScc = await SccCodeModel.findOne({ scc: 'EC-ADMIN-CODE' });
        if (!ecScc) {
            ecScc = await SccCodeModel.create({
                scc: 'EC-ADMIN-CODE',
                used: true,
            });
            console.log('Created EC SCC code');
        }

        const hashedPassword = await bcrypt.hash(EC_PASSWORD, 10);

        ecUser = await VoterModel.create({
            name: 'Election Commission',
            email: EC_EMAIL,
            password: hashedPassword,
            dob: new Date('1990-01-01'),
            sccCode: ecScc.scc,
            role: 'ec',
        });

        console.log('EC user created successfully:', ecUser.email);
    } catch (err) {
        console.error('Error seeding EC user:', err);
    } finally {
        mongoose.disconnect();
    }
}

seedEC();
