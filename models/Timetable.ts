import mongoose, { Schema } from 'mongoose'

const TimetableSchema = new Schema({
  subject: { type: String, required: true, trim: true },
  subjectCode: { type: String, required: true, trim: true },
  semester: { type: Number, required: true, min: 1, max: 20, index: true },
  examDate: { type: Date, required: true, index: true },
  startTime: { type: String, required: true, trim: true },
  endTime: { type: String, required: true, trim: true },
  examType: { type: String, enum: ['THEORY', 'PRACTICAL'], required: true },
  assessment: { type: String, enum: ['1ST_INTERNAL', '2ND_INTERNAL', '3RD_INTERNAL', 'MAIN_EXAM'], required: true },
  venue: { type: String, trim: true },
}, { timestamps: true })

TimetableSchema.index({ semester: 1, examDate: 1, startTime: 1 })

export const Timetable =
  mongoose.models.Timetable ||
  mongoose.model('Timetable', TimetableSchema)
