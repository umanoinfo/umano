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

  const employeeSalary = req.body.selectedSalary
  const id = employeeSalary._id
  delete employeeSalary._id

  const selectedemployeeSalary = await client
    .db()
    .collection('employeeSalaries')
    .findOne({ _id: ObjectId(id) })

  if (selectedemployeeSalary && selectedemployeeSalary.deleted_at) {
    const deletesalary = await client
      .db()
      .collection('employeeSalaries')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: '' } }, { upsert: false })

    // ---------------- logBook ----------------

    let log = {
      user_id: myUser._id,
      company_id: myUser.company_id,
      Module: 'Employee salary',
      Action: 'Restore',
      Description: 'Restore employee salary (' + selectedemployeeSalary._id + ')',
      created_at: new Date()
    }
    const newlogBook = await client.db().collection('logBook').insertOne(log)
  } else {
    const deletesalary = await client
      .db()
      .collection('employeeSalaries')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: new Date() } }, { upsert: false })

    // ---------------- logBook ----------------

    let log = {
      user_id: myUser._id,
      company_id: myUser.company_id,
      Module: 'Employee salary',
      Action: 'Delete',
      Description: 'Delete employee salary (' + selectedemployeeSalary._id + ')',
      created_at: new Date()
    }
    const newlogBook = await client.db().collection('logBook').insertOne(log)
  }

  res.status(201).json({ success: true, data: selectedemployeeSalary })
}
