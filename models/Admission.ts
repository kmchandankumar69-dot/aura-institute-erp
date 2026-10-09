import mongoose, { Schema } from 'mongoose'

const AdmissionSchema = new Schema({
  applicationNo: { type: String, required: true, unique: true, index: true },
  applicantName: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true, index: true },
  phone: { type: String, trim: true },
  program: { type: String, required: true, enum: ['B.Tech Computer Science', 'B.Des Product Design', 'BBA Innovation'] },
  intake: { type: String, required: true, enum: ['2026', '2027'] },
  residency: { type: String, enum: ['HOSTEL', 'DAY_SCHOLAR'], required: true },
  admissionMode: { type: String, enum: ['CET', 'COMEDK', 'MANAGEMENT_QUOTA'], required: true, index: true },
  academicDetails: { type: Schema.Types.Mixed, default: {} },
  documents: [{ name: String, url: String, uploadedAt: Date }],
  status: { type: String, enum: ['SUBMITTED', 'UNDER_REVIEW', 'ASSESSMENT', 'INTERVIEW', 'OFFERED', 'ENROLLED', 'REJECTED'], default: 'SUBMITTED', index: true },
  notes: { type: String, trim: true, maxlength: 5000 },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })
AdmissionSchema.index({ intake: 1, status: 1, createdAt: -1 })
export const Admission = mongoose.models.Admission || mongoose.model('Admission', AdmissionSchema)
