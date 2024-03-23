import { ObjectId } from 'mongodb'
import { connectToDatabase } from 'src/configs/dbConnect'
import { getToken } from 'next-auth/jwt'

export default async function handler(req, res) {
  if(req.method != 'POST'){
    return res.status(405).json({success: false , message: 'Method is not allowed'});
  }
  const client = await connectToDatabase()

  // ---------------------------- Token -------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('AdminEditUser')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // -------------------------- Edit --------------------------------------

  const { id } = req.body;

  const user = {
    deleted_at: null 
  };
  
    const newUser = await client
      .db()
      .collection('users')
      .updateOne({ _id: ObjectId(id) }, { $set: user }, { upsert: false })


    // ---------------- logBook ----------------

    let log = {
      user_id: myUser._id,
      company_id: myUser.company_id,
      Module: 'User',
      Action: 'Restore',
      Description: 'Restore user id (' + id + ')',
      created_at: new Date()
    }
    const newlogBook = await client.db().collection('logBook').insertOne(log)

    return res.status(200).json({ success: true, message: 'success' })
 
}
