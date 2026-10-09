import mongoose, { Schema } from 'mongoose'
const AuditLogSchema = new Schema({ actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true }, action: { type: String, required: true }, entity: { type: String, required: true }, entityId: String, details: { type: Schema.Types.Mixed, default: {} } }, { timestamps: true })
AuditLogSchema.index({ createdAt: -1 })
export const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema)
