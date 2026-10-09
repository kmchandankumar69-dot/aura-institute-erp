import { connectDB } from '../lib/mongodb'
import { User } from '../models/User'
import { Admission } from '../models/Admission'
import { Event, EventRegistration } from '../models/Event'
import { Exam, Grade, StudentCgpa, Revaluation, Notice } from '../models/Academic'
import { Session } from '../models/Session'
import { RateLimit } from '../models/RateLimit'
import { Placement, PlacementApplication } from '../models/Placement'

async function main() {
  await connectDB()
  for (const model of [User, Admission, Event, EventRegistration, Exam, Grade, StudentCgpa, Revaluation, Notice, Session, RateLimit, Placement, PlacementApplication]) await model.createIndexes()
  console.log('Database indexes ensured')
  process.exit(0)
}

main().catch(error => { console.error(error); process.exit(1) })
