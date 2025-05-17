const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const twilio = require('twilio');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Make sure these match EXACTLY what's in Render's env settings
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SID;

// ✅ Log to confirm these values are coming through (will appear in Render logs)
console.log("Using Twilio VERIFY SID:", verifyServiceSid);

const client = twilio(accountSid, authToken);

app.post('/send-otp', async (req, res) => {
  const { mobile } = req.body;

  if (!mobile || !/^\d{10}$/.test(mobile)) {
    return res.status(400).json({ error: "Invalid mobile number." });
  }

  try {
    const verification = await client.verify.v2.services(verifyServiceSid)
      .verifications.create({ to: `+91${mobile}`, channel: 'sms' });

    res.status(200).json({ message: 'OTP sent', sid: verification.sid });
  } catch (err) {
    console.error("OTP Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Use Render's assigned port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server live on port ${PORT}`);
});
