import mongoose, { Schema } from 'mongoose'

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  role: { type: String, enum: ['STUDENT', 'FACULTY', 'ADMIN'], required: true, default: 'STUDENT', index: true },
  studentId: { type: String, unique: true, sparse: true, index: true },
  department: String,
  phone: String,
  photoData: String,
  pendingPhotoData: String,
  photoStatus: { type: String, enum: ['NONE', 'PENDING', 'APPROVED', 'REJECTED'], default: 'NONE', index: true },
  photoRejectedReason: String,
  photoUploadedAt: Date,
  photoVerifiedAt: Date,
  photoVerifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  active: { type: Boolean, default: true },
}, { timestamps: true })

export const User = mongoose.models.User || mongoose.model('User', UserSchema)
