const Company = require('../models/Company');
const User = require('../models/User');
exports.favoriteCompany = async(req,res,next)=>{
    try{
        const cid = req.params.cid
        const company = await Company.findById(cid)
        if (!company){
            return res.status(404).json({
                success: false,
                message: "Company not found"
            })
        }
        const user = await User.findById(req.user._id)
        if (!user){
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }
        company.liked.push(user._id)
        company.save()
        res.status(200).json({
            success: true,
            message: "Company favorited successfully"
        })
    }catch(err){
        console.error("Error favoriting company: ", err);
        res.status(500).json({
            success: false,
            message: "Something went wrong"
        })
    }
}

exports.unfavoriteCompany = async(req,res,next)=>{
    try{
        const cid = req.params.cid
        const company = await Company.findById(cid)
        if (!company){
            return res.status(404).json({
                success: false,
                message: "Company not found"
            })
        }
        const uid = req.user._id
        const user = await User.findById(req.user._id)
        if (!user){
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }
        company.liked = company.liked.filter(uid => uid.toString() !== uid)
        company.save()
        res.status(200).json({
            success: true,
            messsage: "Company unfavorited successfully"
        })
    }catch(err){
        console.error("Error unfavoriting company: ", err);
        res.status(500).json({
            success: false,
            message: "Something went wrong"
        })
    }
}