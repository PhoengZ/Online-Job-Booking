const axios = require('axios')
exports.sendEmail= async(users,company,)=>{
    try{
        const Username = process.env.EMAIL_KEY
        const Password = process.env.EMAIL_SECRET
        if (!Username || !Password){
            return {
                success:false,
                message:"Didn't set API-Key or API-Secret"
            }
        }
        for (let i = 0 ;i<users.length;i++){
            const payload = {
                mail_from:"6630199021@student.chula.ac.th",
                mail_to:users[i],
                name:"ทีมงาน Online Jobs Booking",
                subject:"บริษัทที่คุณกดหัวใจได้มีพื้นที่ว่างแล้ว",
                template_id:"25082812-0919-8dbb-a985-a6ee4d438d82",
                payload:{
                    COMPANY:company,
                    FIRST_NAME:users[i].name
                }
            }
            const response = await axios.post(process.env.EMAIL_API,payload,{
                headers:{
                    Authorization:{
                        Username:Username,
                        Password:Password
                    }
                }
            }) 
        }
        return {
            success:true,
            message: "Success sending emails"
        }
    }catch(err){
        console.error(err);
        return {
            success:false,
            message:err.message
        }
    }
}