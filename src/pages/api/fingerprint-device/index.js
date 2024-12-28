import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  if(req.method != 'GET'){
    return res.status(405).json({success: false , message: 'Method is not allowed'});
  }
  const client = await connectToDatabase()

  // -------------------- Token ---------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions ) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // -------------------------------------------------------------

  const devices = await client.db().collection('fingerprintDevices').find().toArray();

  return res.status(201).json({ success: true, data: devices })
}
