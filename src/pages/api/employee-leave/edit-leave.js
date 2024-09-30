import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  if (req.method != 'POST') {
    return res.status(405).json({ success: false, message: 'Method is not allowed' });
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
  const leave = await client.db().collection('employeeLeaves').findOne({ _id: ObjectId(id), company_id: myUser.company_id.toString() });
  if (!leave) {
    return res.status(404).json({ success: false, message: 'Leave not found' });
  }

  // working
  // employeeLeave.date_from = new Date( new Date( employeeLeave.date_from).setHours(23,59,59,999)) ;
  // employeeLeave.date_to = new Date( new Date(employeeLeave.date_to).setHours(23,59,59,999));
  let date_from = new Date(employeeLeave.date_from);
  let date_to = new Date(employeeLeave.date_to);

  // employeeLeave.date_from = new Date(date_from.getTime() + Math.abs(date_from.getTimezoneOffset() * 60000) )
  // employeeLeave.date_to = new Date(date_to.getTime() + Math.abs(date_to.getTimezoneOffset() * 60000) )
  employeeLeave.paidValue = employeeLeave.paidValue ?? 0

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
    created_at: new Date().toISOString()()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  return res.status(201).json({ success: true, data: employeeLeave })
}
