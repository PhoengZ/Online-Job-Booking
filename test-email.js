const dotenv = require('dotenv');
const { sendEmail } = require('./controllers/auth'); 

dotenv.config({ path: './config/config.env' });

const testing_email = [{
    name: "Phaolap",
    email: "pholapcondo11@gmail.com"
}];

const testCompany = "Online Booking Job (Test)";

const runTest = async () => {

    console.log('Sending test email...');
    try {
        const result = await sendEmail(testing_email, testCompany);
        
        if (result.success) {
            console.log('✅ Email sending test successful!');
            console.log('Response:', result);
        } else {
            console.error('❌ Email sending test failed.');
            console.error('Error:', result.message);
        }
    } catch (error) {
        console.error('An unexpected error occurred:', error);
    }

    process.exit();
};

runTest();