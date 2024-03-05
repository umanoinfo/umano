import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
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
    created_at: new Date()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  return res.status(201).json({ success: true, data: insertedEmployee })
}
