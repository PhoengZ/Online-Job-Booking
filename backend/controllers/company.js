const Company = require('../models/Company');
const User = require('../models/User');

//@desc    get all company
//@route   GET /api/v1/companies
//@access  Public
exports.getCompanies = async(req,res,next) => {
    try{
        const companies = await Company.find();
        if(!companies){
            return res.status(400).json({success : false});
        }
        res.status(200).json({success:true,count : companies.length, data:companies});
    }catch(error){
        res.status(400).json({success : false});
    }
}

//@desc    add Company
//@route   POST /api/v1/companies/
//@access  Public
exports.addCompany = async(req,res,next) => {
    try{
        const company = await Company.create(req.body);
        res.status(201).json({success : true, data : company});
    }catch(error){
        console.log(error);
        res.status(400).json({success : false});
    }
}

//@desc    delete Company
//@route   DELETE /api/v1/companies/:id
//@access  Public
exports.deleteCompany = async(req,res,next) => {
    try {
        const company = await Company.findById(req.params.id);

        if(!company){ 
            return res.status(404).json({success : false,message:`Company not found with id of ${req.params.id}`});
        }
        await Company.deleteOne({_id:req.params.id});
        
        res.status(200).json({success:true,data : {}});
    } catch (error) {
        res.status(400).json({success : false});
    }
}

//@desc    Like Company
//@route   PUT /api/v1/companies/:id/like
//@access  Public
exports.likeCompany = async(req,res,next) => {
    try{
        const {companyId} = req.params;
        const userId = req.user._id;

        const company = await Company.findById(companyId);
        if(!company){
            return res.status(404).json({success:false,message:"Company not found"});
        }

        //If repeat
        if(company.liked.includes(userId)){
            return res.status(400).json({success:false,message:"You already liked this company"});
        }

        company.liked.push(userId);
        await company.save();

        res.status(200).json({success:true,message:`Liked ${company.name} successfully`})
    }catch(error){
        res.status(400).json({success : false});
    }
}

//@desc    Unlike Company
//@route   PUT /api/v1/companies/:id/unlike
//@access  Public
exports.unlikeCompany = async (req,res,next) => {
    const companyId = req.params.id;
    const userId = req.params.user.id;

    const company = Company.findById(companyId);
    if(!company){
        return res.status(404).json({success:false,message:"Company not found"});
    }

    //delete userid in liked
    company.liked = company.liked.filter(id => id.toString() !== userId.toString());
    await company.save();

    res.status(200).json({ success: true, message:`Unlike ${company.name} successfully` });


};