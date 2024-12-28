import { ObjectId } from 'mongodb'
import { connectToDatabase } from 'src/configs/dbConnect'
import { getToken } from 'next-auth/jwt'

export default async function handler(req, res) {
  if(req.method != 'POST'){
    return res.status(405).json({success: false , message: 'Method is not allowed'});
  }
  const selectedCompany = req.body.selectedCompany
  const id = selectedCompany._id

  //-------------- token ----------
  const client = await connectToDatabase()

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('AdminDeleteCompany')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })  
  }   

  const company = await client
    .db()
    .collection('companies')
    .findOne({ _id: ObjectId(id) })

  if (company.deleted_at) {
    const deletCompany = await client
      .db()
      .collection('companies')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: '' } }, { upsert: false })
  } else {
    const deletCompany = await client
      .db()
      .collection('companies')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: new Date() } }, { upsert: false })
  }

  return  res.status(200).json({ success: true, data: company })

}
