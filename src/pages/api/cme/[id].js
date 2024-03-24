import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const { method } = req

  const client = await connectToDatabase()

  if (!req.query.id) {
    return res.status(400).json({success: false, message: 'ID is required'});
  }


  // ------------------------------- Token -------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('ViewCME')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  } 

  // ----------------------------- View Companies --------------------------------
  
  const cme  = await client.db().collection('cme').findOne({
    _id: ObjectId(req.query.id),
    company_id: myUser.company_id.toString()
  });
  
  
  return res.status(200).json({ success: true, data: cme  })
  
}
