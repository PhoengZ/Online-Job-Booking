const mongoose = require('mongoose')

exports.connectDB = async()=>{
    mongoose.set('strictQuery',true)
    try{
        const connect = await mongoose.connect(process.env.MONGO_URI)
        console.log('Database connected:', connect.connection.host);
    }catch(err){
        console.error("Database connection error:",err.stack)
    }
}