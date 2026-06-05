// ================================================
// AKHMADJON KHASANJONOV — Backend Server
// Express + Supabase + Nodemailer
// ================================================
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ===== SUPABASE =====
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// ===== EMAIL TRANSPORTER =====
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,      // akhmadjonusa2001@gmail.com
    pass: process.env.GMAIL_APP_PASS   // Gmail App Password (not regular password)
  }
});

// ===== MIDDLEWARE =====
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

// Serve static frontend files (when deployed together)
app.use(express.static(path.join(__dirname, '..')));

// ===== HEALTH CHECK =====
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ===== VIEW COUNTER =====
// GET /api/views — return current count
app.get('/api/views', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('page_views')
      .select('count')
      .eq('id', 1)
      .single();

    if (error) throw error;
    res.json({ count: data?.count || 0 });
  } catch (err) {
    console.error('GET /api/views error:', err.message);
    res.status(500).json({ error: 'Could not fetch view count' });
  }
});

// POST /api/views — increment counter, return new count
app.post('/api/views', async (req, res) => {
  try {
    // Upsert: if row with id=1 doesn't exist, create it; otherwise increment
    const { data: existing } = await supabase
      .from('page_views')
      .select('count')
      .eq('id', 1)
      .single();

    let newCount;
    if (existing) {
      newCount = (existing.count || 0) + 1;
      await supabase
        .from('page_views')
        .update({ count: newCount, updated_at: new Date().toISOString() })
        .eq('id', 1);
    } else {
      newCount = 1;
      await supabase
        .from('page_views')
        .insert({ id: 1, count: 1, updated_at: new Date().toISOString() });
    }

    res.json({ count: newCount });
  } catch (err) {
    console.error('POST /api/views error:', err.message);
    res.status(500).json({ error: 'Could not update view count' });
  }
});

// ===== CONTACT FORM =====
// POST /api/contact — save to DB + send email
app.post('/api/contact', async (req, res) => {
  const { name, email, phone, message } = req.body;

  // Basic validation
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }
  if (message.length < 5 || message.length > 3000) {
    return res.status(400).json({ error: 'Message must be between 5 and 3000 characters.' });
  }

  try {
    // 1. Save to Supabase
    const { error: dbError } = await supabase
      .from('contacts')
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        message: message.trim(),
        created_at: new Date().toISOString()
      });

    if (dbError) throw new Error('Database error: ' + dbError.message);

    // 2. Send email notification to Akhmadjon
    await transporter.sendMail({
      from: `"Website Contact" <${process.env.GMAIL_USER}>`,
      to: 'akhmadjonusa2001@gmail.com',
      subject: `New Message from ${name} — akhmadjonwrestler.com`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#111;color:#f0ede8;padding:40px;border-radius:4px;">
          <div style="border-bottom:2px solid #cc1a1a;padding-bottom:20px;margin-bottom:28px;">
            <h2 style="color:#cc1a1a;font-size:24px;margin:0;letter-spacing:2px;">NEW WEBSITE MESSAGE</h2>
            <p style="color:#888;font-size:12px;margin-top:6px;">akhmadjonwrestler.com · Contact Form</p>
          </div>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:10px 0;color:#888;font-size:12px;letter-spacing:1px;text-transform:uppercase;width:100px;">Name</td><td style="padding:10px 0;color:#f0ede8;font-size:16px;">${name}</td></tr>
            <tr><td style="padding:10px 0;color:#888;font-size:12px;letter-spacing:1px;text-transform:uppercase;">Email</td><td style="padding:10px 0;color:#f0ede8;font-size:16px;"><a href="mailto:${email}" style="color:#cc1a1a;">${email}</a></td></tr>
            ${phone ? `<tr><td style="padding:10px 0;color:#888;font-size:12px;letter-spacing:1px;text-transform:uppercase;">Phone</td><td style="padding:10px 0;color:#f0ede8;font-size:16px;">${phone}</td></tr>` : ''}
          </table>
          <div style="margin-top:28px;padding:24px;background:#1a1a1a;border-left:3px solid #cc1a1a;border-radius:2px;">
            <p style="color:#888;font-size:11px;letter-spacing:1px;text-transform:uppercase;margin-bottom:12px;">Message</p>
            <p style="color:#f0ede8;font-size:16px;line-height:1.7;white-space:pre-wrap;">${message}</p>
          </div>
          <div style="margin-top:28px;text-align:center;">
            <a href="mailto:${email}?subject=Re: Your message to Akhmadjon" style="display:inline-block;padding:14px 36px;background:#cc1a1a;color:#fff;text-decoration:none;font-family:Arial;font-size:13px;letter-spacing:2px;text-transform:uppercase;border-radius:2px;">Reply to ${name}</a>
          </div>
          <p style="margin-top:32px;color:#444;font-size:11px;text-align:center;">Received ${new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })} PST</p>
        </div>
      `
    });

    // 3. Send confirmation email to the person who submitted
    await transporter.sendMail({
      from: `"Akhmadjon Khasanjonov" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Message received — Akhmadjon Khasanjonov',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#111;color:#f0ede8;padding:40px;border-radius:4px;">
          <div style="border-bottom:2px solid #cc1a1a;padding-bottom:20px;margin-bottom:28px;">
            <h2 style="color:#f0ede8;font-size:22px;margin:0;letter-spacing:2px;">MESSAGE RECEIVED</h2>
            <p style="color:#888;font-size:12px;margin-top:6px;">akhmadjonkhasanjonov.com</p>
          </div>
          <p style="font-size:17px;color:#f0ede8;line-height:1.7;">Hi ${name},</p>
          <p style="font-size:17px;color:rgba(240,237,232,0.65);line-height:1.7;margin-top:16px;">Thank you for reaching out. I received your message and will get back to you personally as soon as possible — usually within 24 hours.</p>
          <p style="font-size:17px;color:rgba(240,237,232,0.65);line-height:1.7;margin-top:16px;">If you need to reach me directly:</p>
          <div style="margin-top:20px;padding:20px;background:#1a1a1a;border-left:3px solid #cc1a1a;">
            <p style="color:#888;font-size:11px;margin-bottom:8px;letter-spacing:1px;text-transform:uppercase;">Phone / Text</p>
            <p style="color:#f0ede8;font-size:17px;">415 425 3747</p>
          </div>
          <p style="margin-top:32px;font-size:17px;color:rgba(240,237,232,0.65);">— Akhmadjon</p>
          <p style="margin-top:32px;color:#444;font-size:11px;border-top:1px solid #1a1a1a;padding-top:20px;">CA State Champion 2026 · Greco-Roman Wrestling · California, USA</p>
        </div>
      `
    });

    res.status(200).json({ success: true, message: 'Message sent successfully.' });

  } catch (err) {
    console.error('POST /api/contact error:', err.message);
    res.status(500).json({ error: 'Failed to send message. Please try again or contact directly at akhmadjonusa2001@gmail.com' });
  }
});

// ===== FALLBACK — serve index.html for all non-API routes =====
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
  } else {
    res.status(404).json({ error: 'API endpoint not found' });
  }
});

// ===== START =====
app.listen(PORT, () => {
  console.log(`\n🔴 Server running on port ${PORT}`);
  console.log(`   Frontend: http://localhost:${PORT}`);
  console.log(`   Views API: http://localhost:${PORT}/api/views`);
  console.log(`   Contact API: http://localhost:${PORT}/api/contact\n`);
});
