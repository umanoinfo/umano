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
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('AdminDeleteCompany')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  const selectedCompany = req.body.selectedCompany
  const id = selectedCompany._id

  const company = await client
    .db()
    .collection('companies')
    .findOne({ _id: ObjectId(id) })

  // -------------------------------- Restore ---------------------------------------

  if (company?.deleted_at) {
    const deletCompany = await client
      .db()
      .collection('companies')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: '' } }, { upsert: false })

    let log = {
      user_id: myUser._id,
      company_id: myUser.company_id,
      Module: 'Company',
      Action: 'Restore',
      Description: 'Restore company (' + selectedCompany.name + ')',
      created_at: new Date().toISOString()
    }
    const newlogBook = await client.db().collection('logBook').insertOne(log)
  } else {
    //----------------------------- Delete --------------------------------------
    const deletCompany = await client
      .db()
      .collection('companies')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: new Date() } }, { upsert: false })

    let log = {
      user_id: myUser._id,
      company_id: myUser.company_id,
      Module: 'Company',
      Action: 'Delete',
      Description: 'Delete company (' + selectedCompany.name + ')',
      created_at: new Date().toISOString()
    }
    const newlogBook = await client.db().collection('logBook').insertOne(log)
  }

  return res.status(200).json({ success: true, data: company })
}
