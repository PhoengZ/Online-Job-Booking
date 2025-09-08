const mongoose = require('mongoose')

const CompanySchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true, 'Please add a hospital name'],
        unique:true,
        trim:true,
        maxlength:[50, "Hospital name can't be more than 50 characters"]
    },
    address:{
        type:String,
        required:[true, 'Please add a hospital address']
    },
    district:{
        type:String,
        required:[true, 'Please add a district name']
    },
    province:{
        type:String,
        required:[true, 'Please add a province name']
    },
    liked:{
        type:[mongoose.Schema.ObjectId],
        ref:'User',
        default:[]
    },
    maxInterview:{
        type:Number,
        required:[true, 'Please add max interview number']
    },
    postalcode:{
        type:String,
        required:[true, 'Please add a postal code'],
        maxlength:[5, "Postal code can't be more than 5 digits"]
    },
    tel:{
        type:String,
    },
    region:{
        type:String,
        required:[true, 'Please add a region']
    }
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

module.exports = mongoose.model("Company",CompanySchema)