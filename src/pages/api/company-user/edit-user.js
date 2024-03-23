import { ObjectId } from 'mongodb'
import { connectToDatabase } from 'src/configs/dbConnect'
import { hashPassword } from 'src/configs/auth'
import { getToken } from 'next-auth/jwt'

export default async function handler(req, res) {
  if(req.method != 'POST'){
    return res.status(405).json({success: false , message: 'Method is not allowed'});
  }
  const client = await connectToDatabase()
  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('EditUser')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  const curUser = await client
  .db()
  .collection('users')
  .findOne({ _id: ObjectId(id) , company_id: myUser.company_id.toString() } );
  if(!curUser){
    return res.status(404).json({success: false, message: 'User not found'});
  }



  const user = req.body.data
  const id = user._id
  user.email = user.email.toLowerCase();
  delete user._id
  user.permissions = []



  if (user.roles) {
    for (const role_id of user.roles) {
      const selectedRole = await client
        .db()
        .collection('roles')
        .aggregate([{ $match: { $and: [{ _id: ObjectId(role_id) }, { type: 'company' }] } }])
        .toArray()

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

    return res.status(200).json({ success: true, data: updatedUser })
  } catch (error) {
    return res.status(400).json({ success: false })
  }
}
