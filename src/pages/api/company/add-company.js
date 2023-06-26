import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // ------------------------------- Token -------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('AdminViewCompany')) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ------------------------- Add Company --------------------------------------

  const company = req.body.data
  if (!company.address || !company.country_id || !company.name || !company.type || !company.user_id) {
    res.status(422).json({
      message: 'Invalid input'
    })
    return
  }

  const newCompany = await client.db().collection('companies').insertOne(company)
  const insertedCompany = await client.db().collection('companies').findOne({ _id: newCompany.insertedId })

  // --------------------- Update Manager --------------------------------------

  const user = await client
    .db()
    .collection('users')
    .findOne({ _id: ObjectId(insertedCompany.user_id) })

  const id = user._id
  user.company_id = insertedCompany._id
  delete user._id

  const newUser = await client
    .db()
    .collection('users')
    .updateOne({ _id: ObjectId(id) }, { $set: user }, { upsert: false })

  // -------------------------- logBook ---------------------------

  let log = {
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: 'Company',
    Action: 'Add',
    Description: 'Add company (' + insertedCompany.name + ')',
    created_at: new Date()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  res.status(201).json({ success: true, data: insertedCompany })
}
