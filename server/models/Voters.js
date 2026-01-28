const mongoose = require('mongoose')

const VoterSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        lowercase: true,
        trim: true 
    },
    password: { type: String, required: true }, 
    dob: { type: Date, required: true },
    sccCode: { type: String, required: true } ,
    role: {
        type: String,
        enum: ['voter', 'ec'],
        default: 'voter',
    },
})

const VoterModel = mongoose.model("voters", VoterSchema)
module.exports = VoterModel;