import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('DeleteEmployee')) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }
  
  // ---------------- Delete --------------------

  const employeePosition = req.body.selectedPosition
  const id = employeePosition._id
  delete employeePosition._id

  const selectedEmployeePosition = await client
    .db()
    .collection('employeePositions')
    .findOne({ _id: ObjectId(id) })

  if (selectedEmployeePosition && selectedEmployeePosition.deleted_at) {
    const deletePosition = await client
      .db()
      .collection('employeePositions')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: '' } }, { upsert: false })

    // ---------------- logBook ----------------

    let log = {
      user_id: myUser._id,
      company_id: myUser.company_id,
      Module: 'Employee position',
      Action: 'Restore',
      Description: 'Restore employee position (' + selectedEmployeePosition.positionTitle + ')',
      created_at: new Date()
    }
    const newlogBook = await client.db().collection('logBook').insertOne(log)
  } else {
    const deletePosition = await client
      .db()
      .collection('employeePositions')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: new Date() } }, { upsert: false })

    // ---------------- logBook ----------------

    let log = {
      user_id: myUser._id,
      company_id: myUser.company_id,
      Module: 'Employee position',
      Action: 'Delete',
      Description: 'Delete employee position (' + selectedEmployeePosition.positionTitle + ')',
      created_at: new Date()
    }
    const newlogBook = await client.db().collection('logBook').insertOne(log)
  }

  res.status(201).json({ success: true, data: selectedEmployeePosition })
}
