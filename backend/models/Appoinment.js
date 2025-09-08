const mongoose = require('mongoose')

const AppointmentSchema = new mongoose.Schema({
    apptDate:{
        type:Date,
        required:[true, "Please add an appointment date"]
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:true
    },
    company:{
        type:mongoose.Schema.ObjectId,
        ref:'Company',
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
})

module.exports = mongoose.model("Appointment",AppointmentSchema)