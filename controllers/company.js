const Company = require('../models/Company');

//@desc    get all company
//@route   GET /api/v1/companies
//@access  Public
exports.getCompanies = async(req,res,next) => {
    try{
        const companies = await Company.find();
        if(!companies){
            return res.status(400).json({success : false});
        }
        res.status(200).json({success:true, data:companies});
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
            return res.status(404).json({status : false,message:`Company not found with id of ${req.params.id}`});
        }
        await Company.deleteOne({_id:req.params.id});
        
        res.status(200).json({status:true,data : {}});
    } catch (error) {
        res.status(400).json({status : false});
    }
}