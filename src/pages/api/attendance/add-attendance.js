//
import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

// ** Axios Imports
import axios from 'axios'

export default async function handler(req, res) {

  if (req.method != 'POST') {
    return res.status(405).json({ success: false, message: 'Method is not allowed' });
  }

  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('AddAttendance')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // -------------------- Insert ---------------------------------------------

  const attendance = req.body
  attendance.company_id = myUser.company_id
  attendance.date = attendance.date = new Date(new Date(attendance.date).toISOString().slice(0, 10)).toISOString();

  // attendance.user_id = myUser._id

  const employee = await client.db().collection('employees').findOne({ idNo: attendance.employee_no });
  attendance.employee_id = String(employee._id);

  attendance.created_at = new Date().toISOString()
  attendance.timeIn = new Date('2000-01-01 ' + attendance.timeIn + ' UTC').toISOString().substr(11, 8)
  attendance.timeOut = new Date('2000-01-01 ' + attendance.timeOut + ' UTC').toISOString().substr(11, 8)
  attendance.originalTimeIn = new Date('2000-01-01 ' + attendance.timeIn + ' UTC').toISOString().substr(11, 8)
  attendance.originalTimeOut = new Date('2000-01-01 ' + attendance.timeOut + ' UTC').toISOString().substr(11, 8)
  
  attendance.status = 'active'
  const existing = await client.db().collection('attendances').findOne({ date: attendance.date, employee_id: attendance.employee_id });
  if (!existing) {
    const newAttendance = await client.db().collection('attendances').insertOne(attendance)
  }
  else {
    return res.status(400).json({ success: false, message: 'Attendance for this date already exist' });
  }

  // -------------------- logBook ------------------------------------------

  let log = {
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: 'Attendance',
    Action: 'Add',
    Description: 'Add attendance ',
    created_at: new Date().toISOString()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  return res.status(201).json({ success: true, data: attendance })
}
