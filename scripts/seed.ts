import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { connectDB } from '../lib/mongodb'
import { User } from '../models/User'
import { Event, EventRegistration } from '../models/Event'
import { Exam, Grade, Notice } from '../models/Academic'
import { hashPassword } from '../lib/auth'

async function upsertUser(email:string,name:string,role:'STUDENT'|'FACULTY'|'ADMIN',password:string,extra:any={}){
  return User.findOneAndUpdate({email},{email,name,role,passwordHash:await hashPassword(password),active:true,...extra},{upsert:true,returnDocument:'after',setDefaultsOnInsert:true})
}
async function main(){
  await connectDB()
  const admin=await upsertUser(process.env.SEED_ADMIN_EMAIL||'admin@aura.edu','Aura Admin','ADMIN',process.env.SEED_ADMIN_PASSWORD||'ChangeMe123!')
  const faculty=await upsertUser(process.env.SEED_FACULTY_EMAIL||'faculty@aura.edu','Aura Faculty','FACULTY',process.env.SEED_FACULTY_PASSWORD||'ChangeMe123!',{department:'Computer Science'})
  const student=await upsertUser(process.env.SEED_STUDENT_EMAIL||'student@aura.edu','Aura Student','STUDENT',process.env.SEED_STUDENT_PASSWORD||'ChangeMe123!',{studentId:'AIT2026CS001',department:'Computer Science'})
  if(!student) throw new Error('Student seed failed')
  if(await Event.countDocuments()===0) await Event.insertMany([
    {title:'Future Tech Summit',date:new Date('2026-06-18T09:00:00+05:30'),time:'09:00',venue:'Innovation Hall',capacity:300,description:'Future technology and research summit.'},
    {title:'Design Futures Night',date:new Date('2026-06-24T18:30:00+05:30'),time:'18:30',venue:'Studio Theatre',capacity:180},
    {title:'Aura Open Mic',date:new Date('2026-07-02T19:00:00+05:30'),time:'19:00',venue:'Student Plaza',capacity:250},
  ])
  const seededEvents = await Event.find().select('_id').lean()
  for (const event of seededEvents) {
    const registrations = await EventRegistration.countDocuments({ eventId: event._id })
    await Event.updateOne({ _id: event._id }, { $set: { registeredCount: registrations } })
  }
  if(await Exam.countDocuments({userId:student._id})===0) await Exam.insertMany([
    {userId:student._id,date:new Date('2026-06-18T09:30:00+05:30'),subject:'Data Structures',time:'09:30 – 12:30',venue:'Main Hall',semester:6},
    {userId:student._id,date:new Date('2026-06-21T09:30:00+05:30'),subject:'Computer Networks',time:'09:30 – 12:30',venue:'Main Hall',semester:6},
    {userId:student._id,date:new Date('2026-06-24T14:00:00+05:30'),subject:'AI & Machine Learning',time:'14:00 – 17:00',venue:'Lab 3',semester:6},
  ])
  if(await Grade.countDocuments({userId:student._id})===0) await Grade.insertMany([{userId:student._id,semester:3,sgpa:7.9},{userId:student._id,semester:4,sgpa:8.3},{userId:student._id,semester:5,sgpa:8.7}])
  if(await Notice.countDocuments()===0) await Notice.create({title:'Semester 6 hall tickets available',body:'Semester 6 hall tickets are available from 15 June.',audience:'STUDENT',publishedBy:faculty?._id})
  console.log('Seed complete', {admin:admin?.email,faculty:faculty?.email,student:student?.email})
  process.exit(0)
}
main().catch(e=>{console.error(e);process.exit(1)})
