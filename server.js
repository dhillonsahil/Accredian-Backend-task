const express = require('express');
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');
const cors = require('cors')
require('dotenv').config()


const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(bodyParser.json());
app.use(cors())

app.post('/api/referral', async (req, res) => {
    const { referrerName,
        referrerEmail,
        referrerPhone,
        refereeName,
        refereeEmail,
        refereePhone, } = req.body;
    try {
        // Basic validation
        if (!referrerName || !referrerEmail || !referrerPhone || !refereeName || !refereeEmail || !refereePhone) {
            return res.status(400).json({ error: 'Name, email, and phone are required fields.' });
        }

        await prisma.referral.create({
            data: {
                referrerName,
                referrerEmail,
                referrerPhone,
                refereeName,
                refereeEmail,
                refereePhone,
            },
        });

        // Send referral email using nodemailer
        await sendReferralEmail(referrerName, referrerEmail);

        res.status(201).json({ success: true });
    } catch (error) {
        console.error('Error handling referral:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

async function sendReferralEmail(name, email) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.NODEMAILER_EMAIL,
            pass: process.env.NODEMAILER_PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.NODEMAILER_EMAIL,
        to: email,
        subject: 'Referral Submission Confirmation',
        text: `Dear ${name},\n\nThank you for your referral. We have received your information.\n\nBest regards,\nYour Company Name`,
    };

    await transporter.sendMail(mailOptions);
}

app.get('/', async (req, res) => {
    return res.json({ message: "Hello Server is running fine !" })
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
