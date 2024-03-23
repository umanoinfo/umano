import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  if(req.method != 'POST'){
    return res.status(405).json({success: false , message: 'Method is not allowed'});
  }
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('EditEmployeeLeave')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ------------------ Edit -----------------------------------------------

  const employeeLeave = req.body.data
  const id = employeeLeave._id
  delete employeeLeave._id
  const leave = await client.db().collection('employeeLeaves').findOne({_id : ObjectId(id) , company_id: myUser.company_id.toString()});
  if(!leave){
    return res.status(404).json({success: false, message: 'Leave not found'});
  }


  employeeLeave.date_from = new Date(employeeLeave.date_from)
  employeeLeave.date_to = new Date(employeeLeave.date_to)

  if (
    !employeeLeave.reason ||
    !employeeLeave.employee_id ||
    !employeeLeave.date_from ||
    !employeeLeave.date_to ||
    !employeeLeave.type
  ) {
    res.status(422).json({
      message: 'Invalid input'
    })

    return
  }

  const updateLeave = await client
    .db()
    .collection('employeeLeaves')
    .updateOne({ _id: ObjectId(id) }, { $set: employeeLeave }, { upsert: false })

  // ------------------ logBook -------------------

  let log = {
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: 'Employee Leave',
    Action: 'Edit',
    Description: 'Edit employee leave (' + employeeLeave.reason + ')',
    created_at: new Date()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  return res.status(201).json({ success: true, data: employeeLeave })
}
