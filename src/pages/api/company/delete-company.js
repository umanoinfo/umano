import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // ------------------------------- Token -------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('AdminDeleteCompany')) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }

  const selectedCompany = req.body.selectedCompany
  const id = selectedCompany._id

  const company = await client
    .db()
    .collection('companies')
    .findOne({ _id: ObjectId(id) })

  // -------------------------------- Restore ---------------------------------------

  if (company.deleted_at) {
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
      created_at: new Date()
    }
    const newLogBook = await client.db().collection('LogBook').insertOne(log)
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
      created_at: new Date()
    }
    const newLogBook = await client.db().collection('LogBook').insertOne(log)
  }

  res.status(200).json({ success: true, data: company })
}
