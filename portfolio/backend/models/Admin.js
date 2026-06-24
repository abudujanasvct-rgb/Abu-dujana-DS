const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },

    // WebAuthn (fingerprint / Face ID) fields
    webauthnUserID: { type: String }, // stable random ID used as WebAuthn user handle
    credentials: [
      {
        credentialID: { type: String, required: true },
        publicKey: { type: String, required: true }, // base64
        counter: { type: Number, default: 0 },
        transports: [{ type: String }],
        deviceLabel: { type: String, default: 'Unnamed device' },
        addedAt: { type: Date, default: Date.now }
      }
    ],

    // for storing temporary challenge during WebAuthn ceremony
    currentChallenge: { type: String, default: null },

    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Admin', AdminSchema);
