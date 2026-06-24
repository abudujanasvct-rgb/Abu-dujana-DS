const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse
} = require('@simplewebauthn/server');

const Admin = require('../models/Admin');
const requireAuth = require('../middleware/requireAuth');
const { loginLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

const RP_NAME = 'Abu Dujana Portfolio';
const RP_ID = process.env.RP_ID || 'localhost';
const ORIGIN = process.env.ORIGIN || 'http://localhost:5173';

const LOCK_THRESHOLD = 5;
const LOCK_TIME_MS = 15 * 60 * 1000; // 15 min

function signToken(adminId) {
  return jwt.sign({ adminId }, process.env.JWT_SECRET, { expiresIn: '12h' });
}

// ---------- PASSWORD LOGIN (fallback for non-biometric devices) ----------
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Check account lockout
    if (admin.lockUntil && admin.lockUntil > Date.now()) {
      const minutesLeft = Math.ceil((admin.lockUntil - Date.now()) / 60000);
      return res.status(423).json({ error: `Account locked. Try again in ${minutesLeft} minute(s).` });
    }

    const match = await bcrypt.compare(password, admin.passwordHash);
    if (!match) {
      admin.failedLoginAttempts += 1;
      if (admin.failedLoginAttempts >= LOCK_THRESHOLD) {
        admin.lockUntil = new Date(Date.now() + LOCK_TIME_MS);
        admin.failedLoginAttempts = 0;
      }
      await admin.save();
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // success - reset counters
    admin.failedLoginAttempts = 0;
    admin.lockUntil = null;
    await admin.save();

    const token = signToken(admin._id.toString());
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// ---------- WEBAUTHN: REGISTER A NEW FINGERPRINT/FACE-ID DEVICE ----------
// Must be called while already logged in (e.g. via password) so randoms can't register their own fingerprint
router.post('/webauthn/register/options', requireAuth, async (req, res) => {
  try {
    const admin = await Admin.findById(req.adminId);
    if (!admin) return res.status(404).json({ error: 'Admin not found.' });

    if (!admin.webauthnUserID) {
      admin.webauthnUserID = crypto.randomBytes(32).toString('base64url');
      await admin.save();
    }

    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID: RP_ID,
      userID: Buffer.from(admin.webauthnUserID, 'base64url'),
      userName: admin.email,
      attestationType: 'none',
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'required', // forces fingerprint/Face ID, not just "device present"
        authenticatorAttachment: 'platform' // built-in biometric sensors (phone/laptop)
      },
      excludeCredentials: admin.credentials.map((c) => ({
        id: c.credentialID,
        transports: c.transports
      }))
    });

    admin.currentChallenge = options.challenge;
    await admin.save();

    res.json(options);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not start device registration.' });
  }
});

router.post('/webauthn/register/verify', requireAuth, async (req, res) => {
  try {
    const admin = await Admin.findById(req.adminId);
    if (!admin) return res.status(404).json({ error: 'Admin not found.' });

    const verification = await verifyRegistrationResponse({
      response: req.body,
      expectedChallenge: admin.currentChallenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID
    });

    if (!verification.verified || !verification.registrationInfo) {
      return res.status(400).json({ error: 'Could not verify device.' });
    }

    const { credentialID, credentialPublicKey, counter, credentialDeviceType, transports } =
      verification.registrationInfo;

    admin.credentials.push({
      credentialID: Buffer.from(credentialID).toString('base64url'),
      publicKey: Buffer.from(credentialPublicKey).toString('base64url'),
      counter,
      transports: transports || [],
      deviceLabel: req.body.deviceLabel || 'New device'
    });
    admin.currentChallenge = null;
    await admin.save();

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Device registration failed.' });
  }
});

// ---------- WEBAUTHN: LOGIN WITH FINGERPRINT/FACE-ID ----------
router.post('/webauthn/login/options', async (req, res) => {
  try {
    const { email } = req.body;
    const admin = await Admin.findOne({ email: email?.toLowerCase() });
    if (!admin || admin.credentials.length === 0) {
      return res.status(404).json({ error: 'No biometric device registered for this account.' });
    }

    const options = await generateAuthenticationOptions({
      rpID: RP_ID,
      userVerification: 'required',
      allowCredentials: admin.credentials.map((c) => ({
        id: c.credentialID,
        transports: c.transports
      }))
    });

    admin.currentChallenge = options.challenge;
    await admin.save();

    res.json(options);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not start biometric login.' });
  }
});

router.post('/webauthn/login/verify', async (req, res) => {
  try {
    const { email } = req.body;
    const admin = await Admin.findOne({ email: email?.toLowerCase() });
    if (!admin) return res.status(404).json({ error: 'Admin not found.' });

    const cred = admin.credentials.find((c) => c.credentialID === req.body.id);
    if (!cred) return res.status(400).json({ error: 'Unrecognized device.' });

    const verification = await verifyAuthenticationResponse({
      response: req.body,
      expectedChallenge: admin.currentChallenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      authenticator: {
        credentialID: cred.credentialID,
        credentialPublicKey: Buffer.from(cred.publicKey, 'base64url'),
        counter: cred.counter
      }
    });

    if (!verification.verified) {
      return res.status(401).json({ error: 'Biometric verification failed.' });
    }

    cred.counter = verification.authenticationInfo.newCounter;
    admin.currentChallenge = null;
    await admin.save();

    const token = signToken(admin._id.toString());
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Biometric login failed.' });
  }
});

// ---------- CHECK SESSION ----------
router.get('/me', requireAuth, async (req, res) => {
  const admin = await Admin.findById(req.adminId).select('email credentials.deviceLabel');
  res.json({ email: admin.email, devices: admin.credentials.map((c) => c.deviceLabel) });
});

module.exports = router;
