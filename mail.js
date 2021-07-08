const nodemailer = require('nodemailer');

async function send(to, subject, html) {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: 587,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const info = await transporter.sendMail({
        from: `TCGPlayer Notifier <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
    });

    console.log(`Message sent: ${info.messageId}`);
}

module.exports = {
    send,
};
