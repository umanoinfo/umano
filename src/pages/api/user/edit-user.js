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
    return  res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // -------------------------- Edit --------------------------------------

  const user = req.body.data
  user.email = user.email.toLowerCase();
  const id = user._id
  delete user._id
  user.permissions = []

  if (user.roles) {
    for (const role_id of user.roles) {
      const selectedRole = await client
        .db()
        .collection('roles')
        .aggregate([{ $match: { $and: [{ _id: ObjectId(role_id) }, { type: 'admin' }] } }])
        .toArray()
        selectedRole[0].permissions.map((permission)=>{
          if(!myUser.permissions.includes(permission) ){
            return res.status(401).json({success : false, message : 'You are not allowed to grant Roles to users that have higher priviliages than yours'});
          }
        })
      if (selectedRole && selectedRole[0] && selectedRole[0].permissions) {
        for (const permission of selectedRole[0].permissions) {
          if (!user.permissions.includes(permission)) {
            user.permissions.push(permission)
          }
        }
      }
    }
  }

  try {
    const newUser = await client
      .db()
      .collection('users')
      .updateOne({ _id: ObjectId(id) }, { $set: user }, { upsert: false })

    const updatedUser = await client
      .db()
      .collection('users')
      .findOne({ _id: ObjectId(id) })

    // ---------------- logBook ----------------

    let log = {
      user_id: myUser._id,
      company_id: myUser.company_id,
      Module: 'User',
      Action: 'Edit',
      Description: 'Edit user (' + user.name + ')',
      created_at: new Date()
    }
    const newlogBook = await client.db().collection('logBook').insertOne(log)

    return res.status(200).json({ success: true, data: updatedUser })
  } catch (error) {
    return  res.status(400).json({ success: false })
  }
}
