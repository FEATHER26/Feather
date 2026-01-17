import express from "express";
import cors from "cors";
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.static('public'));
app.use(cors());
app.use(express.json());

const resend = new Resend(process.env.RESEND_API_KEY);

app.post("/submit-login", async (req, res) => {
  const { name, email, phone, product, message } = req.body;

  try {
    const data = await resend.emails.send({
      from: "Mighty Hands <onboarding@resend.dev>",
      to: "yourgmail@gmail.com",
      subject: "New Customer Enquiry",
      html: `
        <h2>New Customer Message</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Product:</b> ${product}</p>
        <p><b>Message:</b> ${message}</p>
      `,
    });

    return res.json({ success: true });
  } catch (error) {
    console.error("Email error:", error);
    return res.json({ success: false, error });
  }
});

app.listen(10000, () => console.log("🚀 Server running on port 10000"));
