import mongoose, { Schema } from 'mongoose'

const PlacementSchema = new Schema({
  companyName: { type: String, required: true, trim: true, maxlength: 160 },
  jobRole: { type: String, required: true, trim: true, maxlength: 160 },
  salary: { type: String, required: true, trim: true, maxlength: 120 },
  skillsRequired: [{ type: String, trim: true, maxlength: 80 }],
  minCgpa: { type: Number, required: true, min: 0, max: 10 },
  eligibleSemesters: [{ type: Number, min: 1, max: 20 }],
  eligiblePrograms: [{ type: String, trim: true, maxlength: 160 }],
  description: { type: String, trim: true, maxlength: 5000 },
  applicationDeadline: { type: Date },
  active: { type: Boolean, default: true, index: true },
}, { timestamps: true })

const PlacementApplicationSchema = new Schema({
  placementId: { type: Schema.Types.ObjectId, ref: 'Placement', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  status: { type: String, enum: ['APPLIED', 'SHORTLISTED', 'SELECTED', 'REJECTED'], default: 'APPLIED', index: true },
  appliedAt: { type: Date, default: Date.now },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })
PlacementApplicationSchema.index({ placementId: 1, userId: 1 }, { unique: true })

export const Placement = mongoose.models.Placement || mongoose.model('Placement', PlacementSchema)
export const PlacementApplication = mongoose.models.PlacementApplication || mongoose.model('PlacementApplication', PlacementApplicationSchema)
