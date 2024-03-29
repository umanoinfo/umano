import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

// ** Axios Imports
import axios from 'axios'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('AddAttendance')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // -------------------- Insert ---------------------------------------------

  const attendances = req.body.data

  let index = 1 ;
  let existingAttendances = [ ] ;
  for (const attendance of attendances) {
    attendance.company_id = myUser.company_id
    attendance.date = new Date(attendance.date)
    attendance.user_id = myUser._id
    attendance.created_at = new Date()
    attendance.timeIn = new Date('2000-01-01 ' + attendance.timeIn + ' UTC').toISOString().substr(11, 8)
    attendance.timeOut = new Date('2000-01-01 ' + attendance.timeOut + ' UTC').toISOString().substr(11, 8)
    attendance.status = 'active'
    const existing = await client.db().collection('attendances').findOne({date: attendance.date , user_id: attendance.user_id});
    if(!existing){
      const newAttendance = await client.db().collection('attendances').insertOne(attendance)
    }
    else{
      existingAttendances.push(index);
    }
    index++ ;
  }

  // -------------------- logBook ------------------------------------------

  let log = {
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: 'Attendance',
    Action: 'Add',
    Description: 'Add attendances ',
    created_at: new Date()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  return res.status(201).json({ success: true, data: [] , existing: existingAttendances })
}
