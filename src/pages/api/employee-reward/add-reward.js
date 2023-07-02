import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('AddEmployeeReward')) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // -------------------- Insert ---------------------------------------------

  const employeeReward = req.body.data
  if (!employeeReward.reason || !employeeReward.employee_id || !employeeReward.value || !employeeReward.type) {
    res.status(422).json({
      message: 'Invalid input'
    })
    
    return
  }

  employeeReward.company_id = myUser.company_id
  employeeReward.user_id = myUser._id
  employeeReward.created_at = new Date()
  employeeReward.date = new Date(employeeReward.date)
  employeeReward.status = 'active'

  const newemployeeReward = await client.db().collection('employeeRewards').insertOne(employeeReward)
  const insertedReward = await client.db().collection('employeeRewards').findOne({ _id: newemployeeReward.insertedId })

  // -------------------- logBook ------------------------------------------

  let log = {
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: 'Employee Reward',
    Action: 'Add',
    Description: 'Add Employee reward (' + insertedReward.reason + ')',
    created_at: new Date()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  res.status(201).json({ success: true, data: insertedReward })
}
