import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const { method } = req

  // ---------------- Token ----------------
  const client = await connectToDatabase()
  
  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('AdminViewPermission')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })  
  }   
  if (!req.query.q) {
    req.query.q = ''
  }

   
  const permissions = await client
    .db()
    .collection('permissions')
    .aggregate([
      {
        $match: {
           $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }] }
        
      },

      { $group: { _id: '$group', permissions: { $push: '$$ROOT' } } },
      {
        $sort: {
          created_at: -1
        }
      }
    ])
    .toArray()
    
return res.status(200).json({ success: true, data: permissions })
}
