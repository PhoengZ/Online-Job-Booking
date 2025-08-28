const sgMail = require('@sendgrid/mail');

exports.sendEmail = async (users, company) => {
    try {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);

        for (const user of users) {
            const msg = {
                to: user.email,
                from: "6630199021@student.chula.ac.th",
                subject: `บริษัท ${company} ที่คุณสนใจได้มีที่ว่างแล้ว`,
                text: `คุณ ${user.name} รีบไปสมัครสิ!`,
                html: `<strong>คุณ ${user.name} รีบไปสมัครงานที่บริษัท ${company} สิ!</strong>`,
            };

            await sgMail.send(msg);
            console.log(`Email sent successfully to ${user.email}`);
        }

        return {
            success: true,
            message: "All emails have been sent successfully."
        };

    } catch (err) {
        // Log error ที่ละเอียดขึ้นจาก SendGrid
        console.error('Error sending email:', err);
        if (err.response) {
            console.error(err.response.body);
        }
        return {
            success: false,
            message: err.message
        };
    }
};