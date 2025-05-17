const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const twilio = require('twilio');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const verifyServiceSid = process.env.VERIFY_SERVICE_SID;

const client = twilio(accountSid, authToken);

app.post('/send-otp', async (req, res) => {
  const { mobile } = req.body;
  try {
    const verification = await client.verify.v2.services(verifyServiceSid)
      .verifications.create({ to: `+91${mobile}`, channel: 'sms' });

    res.status(200).json({ message: 'OTP sent', sid: verification.sid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log('Twilio OTP backend running on http://localhost:3000');
});