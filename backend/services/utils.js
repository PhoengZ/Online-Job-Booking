const sgMail = require('@sendgrid/mail');
const { GoogleGenAI, Type } = require('@google/genai');
const Favorite = require('../models/Favorite');

exports.getNameNEmail = async(cid)=>{
    const whoFavoriting = await Favorite.find({companyId:cid,isSending:false}).populate({
        path:"userId",
        select:"name email"
    })
    if (!whoFavoriting){
        return [false,[]]
    }
    return [true, whoFavoriting]
}

const sendEmailToAll = async (users, company) => {
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

export async function handleSlotOpeningNotification(companyId, companyName) {
    try {
        console.log(`A slot opened for ${companyName}. Checking for interested users...`);
        const [success, favoritingUsers] = await exports.getNameNEmail(companyId);
        if (success && favoritingUsers.length > 0) {
            // .populate จะทำให้ favoritingUsers เป็น [{..., userId: {name, email}}, ...]
            const usersToNotify = favoritingUsers.map(fav => fav.userId);
            await sendEmailToAll(usersToNotify, companyName);
            console.log(`Successfully sent notifications for ${companyName}.`);
        } else {
            console.log(`No users have favorited ${companyName}. No notifications sent.`);
        }

    } catch (error) {
        console.error('Error during background notification process:', error);
    }
}
