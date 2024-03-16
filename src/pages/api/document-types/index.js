import { connectToDatabase } from 'src/configs/dbConnect'
import { getToken } from 'next-auth/jwt'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email });

  if (!myUser || !myUser.permissions || !(myUser.permissions.includes('AdminViewDocumentType') || myUser.permissions.includes('ViewDocumentType'))) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  const documentTypes = await client.db().collection('documentTypes').find({$or:[{company_id : 'general' } , {company_id:myUser.company_id}] 

  // ,  $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }, {deleted_at:""}]  

  }).toArray();

  return res.status(200).json({ success: true, data: documentTypes })
}
