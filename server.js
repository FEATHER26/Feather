import express from "express";
import cors from "cors";
import { Resend } from "resend";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import fs from "fs";

dotenv.config();

const app = express();
app.use(express.static('.'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY) 
  : null;

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

app.post("/submit-login", upload.single('productImage'), async (req, res) => {
  const { name, email, phone, product, message } = req.body;

  try {
    if (!resend) {
      // Clean up uploaded file if email fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.json({ success: false, error: "API key not configured" });
    }

    const emailData = {
      from: "Feather Creations <onboarding@resend.dev>",
      to: "featherpy@gmail.com",
      subject: "New Customer Enquiry" + (product ? ` - ${product}` : ''),
      html: `
        <h2 style="color: #1a365d;">New Customer Message</h2>
        <hr style="border: 1px solid #ddd; margin: 10px 0;">
        <p><strong>Customer Name:</strong> ${name || 'N/A'}</p>
        <p><strong>Email:</strong> ${email || 'N/A'}</p>
        <p><strong>Contact #:</strong> ${phone || 'N/A'}</p>
        <p><strong>Product(s):</strong> ${product || 'N/A'}</p>
        <p><strong>Message:</strong> ${message || 'N/A'}</p>
        ${req.file ? `<p><strong>Attached Image:</strong> See attachment below</p>` : ''}
      `,
    };

    // Add attachment if file was uploaded
    if (req.file) {
      emailData.attachments = [{
        filename: req.file.originalname,
        content: req.file.buffer.toString('base64')
      }];
    }

    await resend.emails.send(emailData);

    return res.json({ success: true });
  } catch (error) {
    return res.json({ success: false, error: error.message });
  }
});

const port = process.env.PORT || 10000;
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));

export default app;
