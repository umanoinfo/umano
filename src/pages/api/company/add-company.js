//
import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  if (req.method != 'POST') {
    return res.status(405).json({ success: false, message: 'Method is not allowed' });
  }
  const client = await connectToDatabase()

  // ------------------------------- Token -------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('AdminAddCompany')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ------------------------- Add Company --------------------------------------

  const company = req.body.data
  if (!company.address || !company.country_id || !company.name || !company.type || !company.user_id) {
    return res.status(422).json({
      message: 'Invalid input'
    })
  }
  const manager = await client.db().collection('users').findOne({ type: 'manager', _id: ObjectId(company.user_id), company_id: { $exists: true } },);
  if (manager) {
    return res.status(422).json({ success: false, message: 'User is already a manager of a company' });
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
    created_at: new Date().toISOString()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  return res.status(201).json({ success: true, data: insertedCompany })
}
