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
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('AddEmployeeReward')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // -------------------- Insert ---------------------------------------------

  const employeeReward = req.body.data
  if (!employeeReward.reason || !employeeReward.employees || !employeeReward.value || !employeeReward.type) {
    res.status(422).json({
      message: 'Invalid input'
    })

    return
  }

  const emp_array = employeeReward.employees
  delete employeeReward.employees

  emp_array.forEach(async empId => {
    let newEmp = {}
    newEmp = { ...employeeReward }
    newEmp.employee_id = empId
    newEmp.company_id = myUser.company_id
    newEmp.user_id = myUser._id
    newEmp.created_at = new Date().toISOString()
    newEmp.date = new Date(newEmp.date).toISOString()
    newEmp.status = 'active'

    const newemployeeReward = await client.db().collection('employeeRewards').insertOne(newEmp)

    const insertedReward = await client
      .db()
      .collection('employeeRewards')
      .findOne({ _id: newemployeeReward.insertedId })

    // -------------------- logBook ------------------------------------------

    let log = {
      user_id: myUser._id,
      company_id: myUser.company_id,
      Module: 'Employee Reward',
      Action: 'Add',
      Description: 'Add Employee reward (' + employeeReward.reason + ')',
      created_at: new Date().toISOString()
    }
    const newlogBook = await client.db().collection('logBook').insertOne(log)
  })

  return res.status(201).json({ success: true, data: employeeReward })
}

//