import express from "express";
import cors from "cors";
import { Resend } from "resend";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Cache static assets
app.use(express.static(__dirname, {
  maxAge: '1y',
  immutable: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'public, max-age=3600');
    }
  }
}));

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
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
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
app.listen(port, () => console.log(`Server running on port ${port}`));

export default app;
