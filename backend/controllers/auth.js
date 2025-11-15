const User = require('../models/User');
const brevo = require("@getbrevo/brevo")
//@desc    Register User
//@route   POST /api/v1/auth/register
//@access  Public
exports.register = async (req,res,next) => {
    try {
        const {name,email,phone,password,role} = req.body;

        // check email duplicate
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "This email is already in use."
            });
        }
        //Create User
        const user = await User.create({name,email,phone,password,role});
        //Create Token and sent to cookie by call function
        //sendTokenResponse(user,200,res);
        return res.status(200).json({
            success: true,
            data: user
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Server Error"});
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
    if(!user || !user.isVerify){
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
    expires: new Date(Date.now() + 10*1000), 
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
    if(!user){
        res.status(404).json({success:false,error})
    }
    res.status(200).json({success:true, data:user})
}

exports.sendEmailToVerify = async (req, res, next) => {
    try {
        const { email, uid } = req.body;
        
        const otp = Math.floor(100000 + Math.random() * 900000);
        const user = await User.findById(uid);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        
        user.otpEmailToken = otp;
        user.otpEmailExpired = Date.now() + 10 * 60 * 1000; 
        await user.save();

        let apiInstance = new brevo.TransactionalEmailsApi();
        let apiKey = apiInstance.authentications['apiKey'];
        apiKey.apiKey = process.env.BREVO_API_KEY;
        let sendSmtpEmail = new brevo.SendSmtpEmail();
        sendSmtpEmail.subject = `ยืนยันอีเมล ${email} OTP ของคุณ`;
        sendSmtpEmail.htmlContent = `OTP ของคุณคือ <strong>${otp}</strong>`;
        sendSmtpEmail.sender = { "name": "Booking App", "email": "6630199021@student.chula.ac.th" }; // ต้องเป็นเมลที่ Verify ใน Brevo แล้ว
        sendSmtpEmail.to = [{ "email": email }];
        await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log("successfull sending with Brevo");

        res.status(200).json({
            success: true,
            message: "Email sent"
        });

    } catch (err) {
        console.error('Error sending email:', err);
        if(err.body) console.error(err.body); 

        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};

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

