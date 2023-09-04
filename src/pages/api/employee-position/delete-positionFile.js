import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('EditEmployee')) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ------------------ Edit -----------------------------------------------

  const employeePosition = req.body.data

  const id = employeePosition._id

  const position = await client.db().collection('employeePositions').findOne({_id: ObjectId(id) })

  const file = position.file
  delete position._id
  position.file = null

  const updatePosition = await client
    .db()
    .collection('employeePositions')
    .updateOne({ _id: ObjectId(id) }, { $set: position }, { upsert: false })

  // ------------------ logBook -------------------

  let log = {
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: 'Employee position',
    Action: 'Delete File',
    Description: 'Delete file position (' + file + ')',
    created_at: new Date()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  res.status(201).json({ success: true, data: employeePosition })
}
