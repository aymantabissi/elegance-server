import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();

router.post("/", async (req, res) => {
  const { name, email, phone, message } = req.body;

  try {
   const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // App Password هنا
  },

    });

const mailOptions = {
  from: process.env.EMAIL_USER, // لازم يكون هكا
  replyTo: email,               // باش المستخدم يقدر يجاوب
  to: process.env.EMAIL_USER,
  subject: "New Contact Message",
  html: `
    <h3>New Message</h3>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Phone:</strong> ${phone}</p>
    <p><strong>Message:</strong> ${message}</p>
  `,
};

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: "Message sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to send message" });
  }
});

export default router;
