import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })

  const myUser = await client.db().collection('users').findOne({ email: token.email })
  
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('EditEmployee')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ------------------ Edit -------------------

  const employeeposition = req.body.data

  const id = employeeposition._id
  
  delete employeeposition._id

  if (!employeeposition.positionTitle) {
    res.status(422).json({
      message: 'Invalid input'
    })
    
    return
  }

  if (employeeposition.endChangeType == 'onPosition') {
    employeeposition.endChangeDate = null
  }


  const updatePosition = await client
    .db()
    .collection('employeePositions')
    .updateOne({ _id: ObjectId(id) }, { $set: employeeposition }, { upsert: false })

  // ------------------ logBook -------------------

  let log = {
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: 'Employee position',
    Action: 'Edit',
    Description: 'Edit employee position (' + employeeposition.positionTitle + ')',
    created_at: new Date()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  return res.status(201).json({ success: true, data: employeeposition })
}
