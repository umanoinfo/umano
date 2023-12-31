import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('DeletePayroll')) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ---------------- Delete --------------------

  const endOfService = req.body.selectedEndOfService
  const id = endOfService._id
  delete endOfService._id

  const selectedEndOfService = await client
    .db()
    .collection('endOfServices')
    .findOne({ _id: ObjectId(id) })

  if (selectedEndOfService && selectedEndOfService.deleted_at) {
    const deleteEndOfService = await client
      .db()
      .collection('endOfServices')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: '' } }, { upsert: false })

    // ---------------- logBook ----------------

    let log = {
      user_id: myUser._id,
      company_id: myUser.company_id,
      Module: 'End Of Services',
      Action: 'Restore',
      Description: 'Restore end of services (' + selectedEndOfService.name + ')',
      created_at: new Date()
    }
    const newlogBook = await client.db().collection('logBook').insertOne(log)
  } else {
    const deleteEndOfService = await client
      .db()
      .collection('endOfServices')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: new Date() } }, { upsert: false })

    // ---------------- logBook ----------------

    let log = {
      user_id: myUser._id,
      company_id: myUser.company_id,
      Module: 'End Of Services',
      Action: 'Delete',
      Description: 'Delete end of services (' + selectedEndOfService.name + ')',
      created_at: new Date()
    }
    const newlogBook = await client.db().collection('logBook').insertOne(log)
  }

  res.status(201).json({ success: true, data: selectedEndOfService })
}
