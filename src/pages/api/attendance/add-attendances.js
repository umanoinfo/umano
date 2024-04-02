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
    const is12Format = (str)=>{
      return str.toUppserCase().includes('AM') || str.toUppserCase().includes('PM') ;
    };
    if(is12Format(attendance.timeIn ) ||  is12Format(attendance.timeOut)){
      attendance.timeIn = new Date('2000-1-1 ' + attendance.timeIn ).toLocaleTimeString('en-US' , {hour12: false}) ;
      attendance.timeOut = new Date('2000-1-1 ' + attendance.timeOut ).toLocaleTimeString('en-US' , {hour12: false}) ;
    }
    attendance.company_id = myUser.company_id
    attendance.date = new Date(attendance.date)
    attendance.user_id = myUser._id
    attendance.created_at = new Date()
    attendance.status = 'active'
    const existing = await client.db().collection('attendances').findOne({date: attendance.date , employee_no: attendance.employee_no , $or:[{deleted_at:{$exists:false} , deleted_at: null}]});
    if(!existing){
      const newAttendance = await client.db().collection('attendances').insertOne(attendance)
    }
    else{
      existingAttendances.push(index+1);
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
