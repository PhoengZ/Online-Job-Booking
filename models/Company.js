const mongoose = require('mongoose')

const CompanySchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true, 'Please add a company name'],
        unique:true,
        trim:true,
        maxlength:[50, "Company name can't be more than 50 characters"]
    },
    address:{
        type:String,
        required:[true, 'Please add a hospital address']
    },
    website:{
        type:String,
        required:[true, 'Please add a company website']
    },
    description:{
        type:String,
        required:[true, 'Please add a description']
    },
    tel:{
        type:String,
        required:[true, 'Please add a company telephone number']
    },
    timeslots: [
        {
            date:Date,
            capacity:Number,
            currentBooked:Number
        }
    ],
    liked:{
        type:[mongoose.Schema.ObjectId],
        ref:'User',
        default:[]
    },

},{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})

CompanySchema.virtual('appointments',{
    ref:'Appointment',
    localField:'_id',
    foreignField:'company',
    justOne:false
})

module.exports = mongoose.model("Company" , CompanySchema)