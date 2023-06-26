import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // ------------------------------- Token -------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('AdminEditCompany')) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ------------------------------- Edit -------------------------------------

  const company = req.body.data
  const id = company._id
  delete company._id

  if (!company.name) {
    res.status(422).json({
      message: 'Invalid input'
    })
    return
  }
  const newCompany = await client
    .db()
    .collection('companies')
    .updateOne({ _id: ObjectId(id) }, { $set: company }, { upsert: false })

  // --------------------- Update Manager --------------------------------------

  const user = await client
    .db()
    .collection('users')
    .findOne({ _id: ObjectId(company.user_id) })

  const user_id = company.user_id
  user.company_id = id
  delete user._id

  const newUser = await client
    .db()
    .collection('users')
    .updateOne({ _id: ObjectId(user_id) }, { $set: user }, { upsert: false })

  // -------------------------- logBook ---------------------------

  let log = {
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: 'Company',
    Action: 'Edit',
    Description: 'Edit company (' + company.name + ')',
    created_at: new Date()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  res.status(201).json({ success: true, data: company })
}
