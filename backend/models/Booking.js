const mongoose = require('mongoose')

const BookingSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:true
    },
    companyId:{
        type:mongoose.Schema.ObjectId,
        ref:'Company',
        required:true
    },
    timeslotDate:{
        type:Date,
        required:[true, "Please add an booking date"]
    },
    status:{
        type : String,
        enum : ['confirmed','cancelled','hold'],
        default : 'confirmed',
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
})

module.exports = mongoose.model("Booking",BookingSchema)