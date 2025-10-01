const User = require('../models/User');
const sgMail = require('@sendgrid/mail');
const { GoogleGenAI, Type } = require('@google/genai')
//@desc    Register User
//@route   POST /api/v1/auth/register
//@access  Public
exports.register = async (req,res,next) => {
    try {
        const {name,email,phone,password,role} = req.body;

        //Create User
        const user = await User.create({name,email,phone,password,role});
        //Create Token and sent to cookie by call function
        sendTokenResponse(user,200,res);
    } catch (error) {
        res.status(400).json({success:false,error});
        console.log(error.stack);
    }
};

//@desc    Login User
//@route   POST /api/v1/auth/login
//@access  Public
exports.login = async (req,res,next) => {
    const {email,password} = req.body;
    //Validate email & password
    if(!email || !password){
        return res.status(400).json({success:false, msg:'Please provide an email and password'});
    }

    //Check for user
    const user = await User.findOne({email}).select('+password');
    if(!user){
        return res.status(400).json({success:false, msg:'Invalid credentials'});
    }

    //Check if password matches
    const isMatch = await user.matchPassword(password); 
    if(!isMatch){
        return res.status(401).json({success:false, msg:'Invalid credentials'});
    }

    //Create Token and sent to cookie by call function
    sendTokenResponse(user,200,res);

};


//@desc    Logout User
//@route   POST /api/v1/auth/logout
//@access  Public
exports.logout = async (req,res,next) => {
    res.cookie('token', 'none', {
    expires: new Date(Date.now()), 
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'User logged out successfully'
  });
};

//Get token from model, create cookie and send response
const sendTokenResponse = (user , statusCode , res) => {
    //Create Token
    const token = user.getSignedJWTToken();
    const options = {
        expires : new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE*24*60*60*1000), 
        httpOnly : true 
    };

    if(process.env.NODE_ENV == 'production'){
        options.secure = true;
    };

    res.status(statusCode).cookie('token',token,options).json({success:true, token});
}


//@desc    Get current Logged in user
//@route   POST /api/v1/auth/me
//@access  Private
exports.getMe = async (req,res,next) =>{
    const user = await User.findById(req.user.id);
    res.status(200).json({success:true, data:user})
}


exports.sendEmailToAll = async (users, company) => {
    try {
        const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY})
        const response = await ai.models.generateContent({
            model:'gemini-2.5-flash',
            contents:`Write a short email to inform a user that a company they are interested in has an opening. The email should be polite and encouraging. Here is an example:
            Subject: Company ${company} has an opening!
            Text: The company ${company} you are interested in has an opening. Hurry up and apply now!
            Html: Dear [User's Name], we are excited to inform you that the company ${company} you are interested in has an opening. Hurry up and apply now!
            Now, please generate a similar email but make it more creative and engaging.`,
            config:{
                responseMimeType: "application/json",
                responseSchema:{
                    type: Type.OBJECT,
                    properties:{
                        Subject:{
                            type: Type.STRING,
                            description: "The subject of the email"
                        },
                        Text:{
                            type: Type.STRING,
                            description: "The body text of the email"
                        },
                        Html:{
                            type: Type.STRING,
                            description: "The HTML content of the email"
                        }
                    },
                    propertyOrdering: ["Subject", "Text", "Html"]
                },
                candidateCount: 1
            }
        })
        const emailContent = JSON.parse(response.text)
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        const msg = users.map(user=>({
            to: user.email,
            from: "6630199021@student.chula.ac.th",
            subject: emailContent.Subject.replace("[Company Name]", company),
            text: emailContent.Text.replace("[User's Name]", user.name).replace("[Company Name]", company),
            html: emailContent.Html.replace("[User's Name]", user.name).replace("[Company Name]", company),
        }));
        await sgMail.send(msg);

        return {
            success: true,
            message: "All emails have been sent successfully."
        };

    } catch (err) {
        console.error('Error sending email:', err);
        return {
            success: false,
            message: err.message
        };
    }
};

exports.sendEmailToVerify = async (req,res,next)=>{
    try{
        sgMail.setApiKey(process.env.SENDGRID_API_KEY)
        const {email, uid} = req.body
        const otp = Math.floor(100000 + Math.random() * 900000);
        const user = await User.findById(uid);
        if (!user){
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }
        user.otpEmailToken = otp;
        user.otpEmailExpired = Date.now() + 1 * 60 * 1000; // 1 min
        user.save();
        const msg = {
            to: email,
            from: "6630199021@student.chula.ac.th",
            subject: `ยืนยันอีเมล ${email} OTP ของคุณ`,
            html: `OTP ของคุณคือ <strong>${otp}</strong>`,
        }
        await sgMail.send(msg);
        res.status(200).json({
            success: true, 
            message: "Email sent"
        })
    }catch(err){
        console.error('Error sending email:', err);
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        })
    }
}

exports.verifyEmail = async(req,res,next)=>{
    try{
        const {otp, uid} = req.body
        const user = await User.findById(uid)
        if (!user){
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }
        const currentTime = Date.now()
        if (currentTime > user.otpEmailExpired){
            return res.status(400).json({
                success: false,
                messsage: "OTP was expired please resend OTP"
            })
        }
        if (user.otpEmailToken !== otp){
            return res.status(400).json({
                success: false,
                message: "Invalid OTP Please try again"
            })
        }
        user.isVerify = true
        user.save()
        res.status(200).json({
            success: true,
            message: "Email verify succesfully"
        })
    }catch(err){
        console.error('Error verifying email: ', err);
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        })
        
    }
}
