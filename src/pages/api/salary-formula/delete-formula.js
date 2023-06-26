import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('DeletePayrollFormula')) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ---------------- Delete --------------------

  const formula = req.body.selectedFormula
  const id = formula._id
  delete formula._id

  const selectedFormula = await client
    .db()
    .collection('salaryFormula')
    .findOne({ _id: ObjectId(id) })

  if (selectedFormula && selectedFormula.deleted_at) {
    const deleteFormula = await client
      .db()
      .collection('salaryFormula')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: '' } }, { upsert: false })

    // ---------------- logBook ----------------

    let log = {
      user_id: myUser._id,
      company_id: myUser.company_id,
      Module: 'Salary Formula',
      Action: 'Restore',
      Description: 'Restore salary formula (' + selectedFormula.title + ')',
      created_at: new Date()
    }
    const newlogBook = await client.db().collection('logBook').insertOne(log)
  } else {
    const deleteFormula = await client
      .db()
      .collection('salaryFormula')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: new Date() } }, { upsert: false })

    // ---------------- logBook ----------------

    let log = {
      user_id: myUser._id,
      company_id: myUser.company_id,
      Module: 'Salary Formula',
      Action: 'Delete',
      Description: 'Delete salary formula (' + selectedFormula.title + ')',
      created_at: new Date()
    }
    const newlogBook = await client.db().collection('logBook').insertOne(log)
  }

  res.status(201).json({ success: true, data: selectedFormula })
}
