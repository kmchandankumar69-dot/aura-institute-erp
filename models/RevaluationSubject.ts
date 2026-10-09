import mongoose, { Schema } from 'mongoose'

const RevaluationSubjectSchema = new Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, trim: true },
  semester: { type: Number, required: true, min: 1, max: 20 },
  active: { type: Boolean, default: true, index: true },
}, { timestamps: true })

RevaluationSubjectSchema.index({ code: 1 }, { unique: true })

export const RevaluationSubject =
  mongoose.models.RevaluationSubject ||
  mongoose.model('RevaluationSubject', RevaluationSubjectSchema)
