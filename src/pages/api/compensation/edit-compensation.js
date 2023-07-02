import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // ------------------------------- Token -------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('EditPayrollCompensation')) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ------------------------------- Edit -------------------------------------

  const compensation = req.body.data
  if (!compensation.type || !compensation.title || (!compensation.fixedValue && !compensation.percentageValue)) {
    res.status(422).json({
      message: 'Invalid input'
    })
    
    return
  }

  compensation.company_id = myUser.company_id
  compensation.updated_at = new Date()
  const id = compensation._id
  delete compensation._id
  delete compensation.user_id
  compensation.user_id = myUser._id

  const newCompensation = await client
    .db()
    .collection('compensations')
    .updateOne({ _id: ObjectId(id) }, { $set: compensation }, { upsert: false })

  // -------------------------- logBook ---------------------------

  let log = {
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: 'Compensation',
    Action: 'Edit',
    Description: 'Edit compensation (' + compensation.title + ')',
    created_at: new Date()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  res.status(201).json({ success: true, data: newCompensation })
}
