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
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('EditEmployeeReward')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ------------------ Edit -----------------------------------------------

  const employeeReward = req.body.data
  const id = employeeReward._id
  const reward = await client.db().collection('employeeRewards').findOne({ _id: ObjectId(id), company_id: myUser.company_id.toString() });
  if (!reward) {
    return res.status(404).json({ success: false, message: 'Reward not found' });
  }
  delete employeeReward._id
  employeeReward.company_id = myUser.company_id
  employeeReward.date = new Date(employeeReward.date)
  employeeReward.user_id = myUser._id
  employeeReward.updated_at = new Date()

  if (!employeeReward.reason || !employeeReward.employee_id || !employeeReward.value || !employeeReward.type) {
    res.status(422).json({
      message: 'Invalid input'
    })

    return
  }

  const updateDeduction = await client
    .db()
    .collection('employeeRewards')
    .updateOne({ _id: ObjectId(id) }, { $set: employeeReward }, { upsert: false })

  // ------------------ logBook -------------------

  let log = {
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: 'Employee Reward',
    Action: 'Edit',
    Description: 'Edit employee reward (' + employeeReward.reason + ')',
    created_at: new Date().toISOString()()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  return res.status(201).json({ success: true, data: employeeReward })
}
