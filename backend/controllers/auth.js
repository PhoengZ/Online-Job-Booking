const sgMail = require('@sendgrid/mail');
const User = require('../models/User');
const { GoogleGenAI, Type } = require('@google/genai')
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
