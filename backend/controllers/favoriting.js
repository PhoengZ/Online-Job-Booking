const Favorite = require('../models/Favorite')
const Company = require("../models/Company")

//@desc    like Company
//@route   post /api/v1/companies/:cid/favoriting/
//@access  private
exports.likeCompany = async(req,res,next) => {
    try{
        const params = req.params;
        const cid = params.cid
        const userId = req.user._id;
        console.log(params);
        const company = await Company.findById(cid);
        if(!company){
            return res.status(404).json({success:false,message:"Company not found"});
        }

        //If repeat
        // if(company.liked.includes(userId)){
        //     return res.status(400).json({success:false,message:"You already liked this company"});
        // }    
        
        // company.liked.push(userId);
        // await company.save();
        const favorite = await Favorite.create({
            userId: userId,
            companyId: cid,
            isSending: false
        })
        res.status(200).json({success:true,message:`Liked ${company.name} successfully`,data:favorite})
    }catch(error){
        res.status(500).json({success : false});
    }
}

//@desc    Unlike Company
//@route   Delete /api/v1/companies/:cid/favoriting/:fid
//@access  priavte
exports.unlikeCompany = async (req,res,next) => {
    try{
        const {cid, fid} = req.params;
        const company = Company.findById(cid);
        if(!company){
            return res.status(404).json({success:false,message:"Company not found"});
        }

        //delete userid in liked
        // company.liked = company.liked.filter(id => id.toString() !== userId.toString());
        // await company.save();
        await Favorite.findByIdAndDelete(fid)
        res.status(200).json({ success: true, message:`Unlike ${company.name} successfully` });
    }catch(err){
        console.error(err);
        res.status(500).json({
            success: false, message: "Something wrong"
        })
    }
};