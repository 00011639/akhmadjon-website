require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

app.use(cors({ origin: '*', methods: ['GET', 'POST'] }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// GET views
app.get('/api/views', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('page_views').select('count').eq('id', 1).single();
    if (error) throw error;
    res.json({ count: data?.count || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST views — increment
app.post('/api/views', async (req, res) => {
  try {
    const { data: existing } = await supabase
      .from('page_views').select('count').eq('id', 1).single();
    let newCount;
    if (existing) {
      newCount = (existing.count || 0) + 1;
      await supabase.from('page_views')
        .update({ count: newCount, updated_at: new Date().toISOString() })
        .eq('id', 1);
    } else {
      newCount = 1;
      await supabase.from('page_views')
        .insert({ id: 1, count: 1, updated_at: new Date().toISOString() });
    }
    res.json({ count: newCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST contact
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message)
    return res.status(400).json({ error: 'Name, email, and message are required.' });

  try {
    // Save to Supabase
    await supabase.from('contacts').insert({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
      created_at: new Date().toISOString()
    });

    // Email to Akhmadjon
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'akhmadjonusa2001@gmail.com',
      subject: `New message from ${name} — akhmadjonwrestler.com`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;background:#111;color:#f0ede8;padding:40px;border-radius:4px;">
          <h2 style="color:#cc1a1a;letter-spacing:2px;margin-bottom:24px;">NEW WEBSITE MESSAGE</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}" style="color:#cc1a1a;">${email}</a></p>
          <div style="margin-top:24px;padding:20px;background:#1a1a1a;border-left:3px solid #cc1a1a;">
            <p style="white-space:pre-wrap;">${message}</p>
          </div>
          <div style="margin-top:24px;">
            <a href="mailto:${email}" style="padding:12px 32px;background:#cc1a1a;color:#fff;text-decoration:none;font-family:Arial;letter-spacing:2px;text-transform:uppercase;font-size:13px;">Reply to ${name}</a>
          </div>
        </div>
      `
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send. Please try again.' });
  }
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api'))
    res.sendFile(path.join(__dirname, '..', 'index.html'));
  else
    res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
