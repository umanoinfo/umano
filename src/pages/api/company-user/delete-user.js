import { ObjectId } from 'mongodb'
import { connectToDatabase } from 'src/configs/dbConnect'
import { getToken } from 'next-auth/jwt'

export default async function handler(req, res) {
  if(req.method != 'POST'){
    return res.status(405).json({success: false , message: 'Method is not allowed'});
  }
  const selectedUser = req.body.selectedUser
  const id = selectedUser._id

  // try {
  const client = await connectToDatabase()
  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('DeleteUser')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  const user = await client
    .db()
    .collection('users')
    .findOne({ _id: ObjectId(id) , company_id: myUser.company_id.toString()})
  if(!user){
    return res.status(404).json({success: false, message: 'User not found'});
  }

  if (user.deleted_at) {
    const deletUser = await client
      .db()
      .collection('users')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: '' } }, { upsert: false })
  } else {
    const deletUser = await client
      .db()
      .collection('users')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: new Date() } }, { upsert: false })
  }

  return res.status(200).json({ success: true, data: user })
}
