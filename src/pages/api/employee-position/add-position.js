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

  if (!myUser || !myUser.permissions || !myUser.permissions.includes('AddEmployee')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ---------------- Insert ---------------------------------------------

  const employeeposition = req.body.data
  if (!employeeposition.positionTitle) {
    return res.status(422).json({
      message: 'Invalid input'
    })

    return
  }
  employeeposition.company_id = myUser.company_id


  const newEmployeepositions = await client.db().collection('employeePositions').insertOne(employeeposition)
  if (employeeposition.isManager) {

    const department = await client.db().collection('departments').updateOne({ _id: ObjectId(employeeposition.department_id) }, { $set: { user_id: employeeposition.employee_id } }, { upsert: false });

  }

  const insertedEmployee = await client
    .db()
    .collection('employeePositions')
    .findOne({ _id: newEmployeepositions.insertedId })

  // ---------------- logBook ------------------------------------------

  let log = {
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: 'Employee position',
    Action: 'Add',
    Description: 'Add Employee position (' + insertedEmployee.positionTitle + ')',
    created_at: new Date().toISOString()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  return res.status(201).json({ success: true, data: insertedEmployee })
}

//