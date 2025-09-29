const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const UserSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true, "Please add a name"]
    },
    email:{
        type:String,
        match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please add a valid email'],
        required:[true, "Please add an email"],
        unique:true
    },
    phone:{
        type:String,
        required:[true, "Please add a phone number"]
    },
    password:{
        type:String,
        required: [true, "Please add a password"],
        minlength:[6, 'Password must be at least 6 characters'],
        select: false
    },
    role:{
        type:String,
        enum:['user','admin'],
        default:'user'
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    otpEmailToken:{
        type:String
    },
    otpEmailExpired:{
        type:Date
    }
})

UserSchema.pre('save',async function (){
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password,salt)
})

UserSchema.methods.matchPassword = async function(password){
    return await bcrypt.compare(password, this.password)
}

UserSchema.methods.getSignedJWTToken = function(){
    return jwt.sign({_id:this._id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRE
    })
}

module.exports = mongoose.model("User", UserSchema)