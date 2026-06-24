const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    summary: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    techStack: [{ type: String, trim: true }],
    githubUrl: { type: String, default: '' },
    liveUrl: { type: String, default: '' },
    category: {
      type: String,
      enum: ['ml', 'web', 'security', 'data', 'other'],
      default: 'other'
    },
    highlights: [{ type: String }],
    order: { type: Number, default: 0 },
    featured: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', ProjectSchema);
