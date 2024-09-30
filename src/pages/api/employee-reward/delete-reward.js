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
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('DeleteEmployeeReward')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ---------------- Delete --------------------

  const employeeReward = req.body.selectedReward

  const id = employeeReward._id
  delete employeeReward._id

  const selectedReward = await client
    .db()
    .collection('employeeRewards')
    .findOne({ _id: ObjectId(id), company_id: myUser.company_id.toString() })
  if (!selectedReward) {
    return res.status(404).json({ success: false, message: 'Reward not found' });
  }

  if (selectedReward && selectedReward.deleted_at) {
    const deletePosition = await client
      .db()
      .collection('employeeRewards')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: '' } }, { upsert: false })

    // ---------------- logBook ----------------

    let log = {
      user_id: myUser._id,
      company_id: myUser.company_id,
      Module: 'Employee Reward',
      Action: 'Restore',
      Description: 'Restore employee reward (' + selectedReward.reason + ')',
      created_at: new Date().toISOString()()
    }
    const newlogBook = await client.db().collection('logBook').insertOne(log)
  } else {
    const deletePosition = await client
      .db()
      .collection('employeeRewards')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: new Date() } }, { upsert: false })

    // ---------------- logBook ----------------

    let log = {
      user_id: myUser._id,
      company_id: myUser.company_id,
      Module: 'Employee Reward',
      Action: 'Delete',
      Description: 'Delete employee reward (' + selectedReward.reason + ')',
      created_at: new Date().toISOString()()
    }
    const newlogBook = await client.db().collection('logBook').insertOne(log)
  }

  return res.status(201).json({ success: true, data: selectedReward })
}
