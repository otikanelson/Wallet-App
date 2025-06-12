const nodemailer = require("nodemailer");
const { MAILEMAIL,MAILHOST,MAILPASSWORD } = require("./env");

async function sendMail(email, title, html) {


    if (!email || !title || !html) {
        console.error("Missing parameters: Ensure email, title, and html are provided.");
        return;
    }

    if (!MAILEMAIL || !MAILHOST || !MAILPASSWORD) {
        console.error("Missing mail configuration. Check your .env file.");
        return;
    }

    const transporter = nodemailer.createTransport({
        host: MAILHOST,
        port: 465,
        secure: true,
        auth: {
            user: MAILEMAIL,
            pass: MAILPASSWORD, 
        },
    });

    try {
        await transporter.sendMail({
            from: '"CFC" <info@cfc.cfcterminalapp.xyz>',
            to: email,
            subject: title,
            text: "", 
            html: html,
        });

    } catch (error) {
        console.error("Error sending email:", error);
    }
}

module.exports = {sendMail};
 