//
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

  let index = 1;
  let existingAttendances = [];

  let attendancesQuery = [];
  for (const attendance of attendances) {
    const is12Format = (str) => {
      return String(str).toUpperCase().includes('AM') || str.toUpperCase().includes('PM');
    };
    if (is12Format(attendance.timeIn) || is12Format(attendance.timeOut)) {
      attendance.timeIn = new Date('2000-01-01 ' + attendance.timeIn + ' UTC').toISOString().substr(11, 8)
      attendance.timeOut = new Date('2000-01-01 ' + attendance.timeOut + ' UTC').toISOString().substr(11, 8)

      // attendance.timeIn = new Date(attendance.timeIn.getTime() + Math.abs(attendance.timeIn.getTime() * 60000 ) ).toLocaleTimeString('en-US', { hour12: false })
      // attendance.timeOut = new Date(attendance.timeOut.getTime() + Math.abs(attendance.timeOut.getTime() * 60000 )).toLocaleTimeString('en-US', { hour12: false })

    }
    attendance.originalTimeIn = new Date('2000-01-01 ' + attendance.timeIn + ' UTC').toISOString().substr(11, 8); 
    attendance.originalTimeOut = new Date('2000-01-01 ' + attendance.timeOut + ' UTC').toISOString().substr(11, 8);

    attendance.company_id = myUser.company_id
    attendance.date = attendance.date = new Date(new Date(attendance.date).toISOString().slice(0, 10)).toISOString();    attendance.user_id = myUser._id
    attendance.created_at = new Date().toISOString()
    attendance.status = 'active'
    attendance.employee_id = attendance.employee_id;
    attendancesQuery.push({ date: attendance.date , company_id: myUser.company_id, employee_id: attendance.employee_id, $or: [{ deleted_at: { $exists: false }, deleted_at: null }] });
  }
  console.log(attendancesQuery);
  const curAttendances = await client.db().collection('attendances').find({ $or: attendancesQuery }).toArray();
  const nonExistingAttendances = [];
  for (const attendance of attendances) {
    const existing = curAttendances.filter((att) => {
      return att.employee_id == attendance.employee_id &&
        new Date(att.date).toLocaleDateString() == new Date(attendance.date).toLocaleDateString();
    })
    console.log(existing, attendance);
    if (!existing || existing?.length == 0) {
      nonExistingAttendances.push(attendance);
    }
    else {
      existingAttendances.push(index + 1);
    }
    index++;
  }

  if (nonExistingAttendances.length > 0) {
    const insertedAttendances = await client.db().collection('attendances').insertMany(nonExistingAttendances);
  }

  // -------------------- logBook ------------------------------------------

  let log = {
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: 'Attendance',
    Action: 'Add',
    Description: 'Add attendances ',
    created_at: new Date().toISOString()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  return res.status(201).json({ success: true, data: [], existing: existingAttendances })
}
