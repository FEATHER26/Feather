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
    if (resend) {
      await resend.emails.send({
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
    } else {
      console.log("Email would be sent:", { name, email, phone, product, message });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error("Email error:", error);
    return res.json({ success: false, error: error.message });
  }
});

const port = process.env.PORT || 10000;
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));

export default app;
