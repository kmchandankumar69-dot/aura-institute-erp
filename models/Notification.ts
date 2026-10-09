import mongoose, { Schema } from 'mongoose'
const NotificationSchema = new Schema({ userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true }, title: { type: String, required: true, trim: true }, message: { type: String, required: true, trim: true }, type: { type: String, enum: ['PLACEMENT','ADMISSION','ACADEMIC','EVENT','SYSTEM'], default: 'SYSTEM' }, read: { type: Boolean, default: false, index: true } }, { timestamps: true })
NotificationSchema.index({ userId: 1, createdAt: -1 })
export const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema)
