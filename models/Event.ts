import mongoose, { Schema } from 'mongoose'

const EventSchema = new Schema({
  title: { type: String, required: true, trim: true },
  date: { type: Date, required: true },
  time: { type: String, trim: true },
  venue: { type: String, trim: true },
  capacity: { type: Number, default: 100, min: 1 },
  registeredCount: { type: Number, default: 0, min: 0 },
  description: { type: String, trim: true },
  active: { type: Boolean, default: true, index: true },
}, { timestamps: true })

const EventRegistrationSchema = new Schema({
  eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
}, { timestamps: true })
EventRegistrationSchema.index({ eventId: 1, userId: 1 }, { unique: true })

export const Event = mongoose.models.Event || mongoose.model('Event', EventSchema)
export const EventRegistration = mongoose.models.EventRegistration || mongoose.model('EventRegistration', EventRegistrationSchema)
