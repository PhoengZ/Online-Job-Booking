const sgMail = require('@sendgrid/mail');
const User = require('../models/User');

exports.sendEmailToAll = async (users, company) => {
    try {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);

        const msg = users.map(user=>({
            to: user.email,
            from: "6630199021@student.chula.ac.th",
            subject: `บริษัท ${company} ที่คุณสนใจได้มีที่ว่างแล้ว`,
            text: `คุณ ${user.name} รีบไปสมัครสิ!`,
            html: `<strong>คุณ ${user.name} รีบไปสมัครงานที่บริษัท ${company} สิ!</strong>`,
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
        const {email} = req.body
        const otp = Math.floor(100000 + Math.random() * 900000);
        const user = await User.findById(req.uesr._id);
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
        const {otp} = req.body
        const user = await User.findById(req.user._id)
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
