import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const { method } = req

  const client = await connectToDatabase()


  // ------------------------------- Token -------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('ViewCME')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  } 

  // ----------------------------- View Companies --------------------------------
  const required = await client.db().collection('requiredCME').find({}).toArray();


  
  
  return res.status(200).json({ success: true, data: required })
  
}
