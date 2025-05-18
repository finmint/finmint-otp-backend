const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const twilio = require('twilio');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Twilio credentials from Render Environment
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SID;

const client = twilio(accountSid, authToken);

// ✅ Send OTP
app.post('/send-otp', async (req, res) => {
  const { mobile } = req.body;

  if (!/^[1-9][0-9]{9}$/.test(mobile)) {
    return res.status(400).json({ error: "Invalid mobile number." });
  }

  try {
    const verification = await client.verify.v2
      .services(verifyServiceSid)
      .verifications.create({ to: `+91${mobile}`, channel: 'sms' });

    res.status(200).json({ message: 'OTP sent', sid: verification.sid });
  } catch (err) {
    console.error('Send OTP Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Verify OTP
app.post('/verify-otp', async (req, res) => {
  const { mobile, code } = req.body;
  try {
    const verificationCheck = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SID)
      .verificationChecks.create({ to: `+91${mobile}`, code });

    if (verificationCheck.status === "approved") {
      res.status(200).json({ status: "approved" });
    } else {
      res.status(400).json({ status: "failed", message: "Invalid OTP" });
    }
  } catch (err) {
    console.error("Verification failed:", err); // 👈 this line helps debug
    res.status(500).json({ error: err.message || "Verification error" });
  }
});

// ✅ Save user info to users.json
app.post('/save-user', (req, res) => {
  const { firstName, lastName, email, mobile } = req.body;

  if (!firstName || !lastName || !email || !mobile) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  const user = {
    firstName,
    lastName,
    email,
    mobile,
    timestamp: new Date().toISOString()
  };

  const filePath = 'users.json';
  let users = [];

  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath);
      users = JSON.parse(data);
    }

    users.push(user);
    fs.writeFileSync(filePath, JSON.stringify(users, null, 2));

    res.status(200).json({ message: 'User saved successfully.' });
  } catch (err) {
    console.error('Save User Error:', err.message);
    res.status(500).json({ error: 'Failed to save user.' });
  }
});

// ✅ Port setup
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running at http://0.0.0.0:${PORT}`);
});
