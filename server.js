import express from "express";
import cors from "cors";
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.static('.'));
app.use(cors());
app.use(express.json());

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY) 
  : null;

app.post("/submit-login", async (req, res) => {
  const { name, email, phone, product, message } = req.body;

  try {
    if (!resend) {
      return res.json({ success: false, error: "API key not configured" });
    }

    await resend.emails.send({
      from: "Feather Creations <onboarding@resend.dev>",
      to: "featherpy@gmail.com",
      subject: "New Customer Enquiry",
      html: `
        <h2 style="color: #333;">New Customer Message</h2>
        <hr style="border: 1px solid #ddd; margin: 10px 0;">
        <p><strong>Customer Name:</strong> ${name}</p>
        <p><strong>EmailID:</strong> ${email}</p>
        <p><strong>Contact #:</strong> ${phone}</p>
        <p><strong>Product(s):</strong> ${product}</p>
        <p><strong>Message:</strong> ${message}</p>
      `,
    });

    return res.json({ success: true });
  } catch (error) {
    return res.json({ success: false, error: error.message });
  }
});

const port = process.env.PORT || 10000;
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));

export default app;
