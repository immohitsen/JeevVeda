import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  // Link to user
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'patientdatas',
    required: true,
    index: true
  },

  // Report type
  reportType: {
    type: String,
    enum: ['BLOOD_ANALYSIS', 'MRI_SCAN', 'RISK_ASSESSMENT'],
    required: true
  },

  // File info (if uploaded)
  fileName: String,
  fileSize: Number,

  // Store the complete report data as JSON
  reportData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }

}, {
  timestamps: true  // Auto-creates createdAt and updatedAt
});

// Index for fast queries
reportSchema.index({ userId: 1, createdAt: -1 });

const Report = mongoose.models.Report || mongoose.model("Report", reportSchema);

export default Report;
