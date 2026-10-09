import { AuditLog } from '@/models/AuditLog'
export async function writeAuditLog(actorId: string, action: string, entity: string, entityId?: string, details: Record<string, unknown> = {}) {
  try { await AuditLog.create({ actorId, action, entity, entityId, details }) } catch { /* audit failure must not break the main transaction */ }
}
