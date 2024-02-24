import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('EditEmployeeReward')) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ------------------ Edit -----------------------------------------------

  const employeeReward = req.body.data
  const id = employeeReward._id
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
    created_at: new Date()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  res.status(201).json({ success: true, data: employeeReward })
}
