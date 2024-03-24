import { ObjectId } from 'mongodb'
import { connectToDatabase } from 'src/configs/dbConnect'
import { getToken } from 'next-auth/jwt'

export default async function handler(req, res) {
  if(req.method != 'POST'){
    return res.status(405).json({success: false , message: 'Method is not allowed'});
  }
  const { method } = req

  //-------------- token ----------
  const client = await connectToDatabase()

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('AdminEditCompany')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })  
  }   

  //------------------------------
  const company = req.body.data
  const id = company._id

  delete company._id
  if (!company.name) {
    return res.status(422).json({
      message: 'Invalid input'
    })
  }
  

  const newCompany = await client
    .db()
    .collection('companies')
    .updateOne({ _id: ObjectId(id) }, { $set: company }, { upsert: false })

    return res.status(201).json({ success: true, data: company })
}
