const mongoose = require('mongoose')

const FavoriteSchema = new mongoose.Schema({
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
    isSending:{
        type:Boolean,
        default: false
    }
})

module.exports = mongoose.model("Favorite",FavoriteSchema)