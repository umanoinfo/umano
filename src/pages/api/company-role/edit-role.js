import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  if(req.method != 'POST'){
    return res.status(405).json({success: false , message: 'Method is not allowed'});
  }
  
  const client = await connectToDatabase()

  const role = req.body.data
  const id = role._id
  delete role._id
  
  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })

  // -------------------- Token ---------------------

  if (!myUser || !myUser.permissions || !myUser.permissions.includes('EditRole')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  const curRole = await client
  .db()
  .collection('roles')
  .findOne({ _id: ObjectId(id) , company_id: myUser.company_id.toString()})
  if(!curRole){
    return res.status(404).json({success: false, message: 'Role not found'});
  }



  

  // ------------------ Edit -------------------


  if (!role.title) {
    return res.status(422).json({
      message: 'Invalid input'
    })
  }
  

  role.permissions = role?.permissions?.filter((permission)=>{
    return !permission.includes('Admin') && myUser.permissions.includes(permission);
  });

  const newRole = await client
    .db()
    .collection('roles')
    .updateOne({ _id: ObjectId(id) }, { $set: role }, { upsert: false })

  const updatedRole = await client
    .db()
    .collection('roles')
    .findOne({ _id: ObjectId(id) })

  const users = await client
    .db()
    .collection('users')
    .aggregate([
      {
        $match: {
          roles: { $elemMatch: { $eq: id } }
        }
      }
    ])
    .toArray()

  for (const user of users) {
    user.permissions = []
    const user_id = user._id

    for (const role_id of user.roles) {
      const selectedRole = await client
        .db()
        .collection('roles')
        .findOne({ _id: ObjectId(role_id) })
      if (selectedRole && selectedRole.permissions) {
        for (const permission of selectedRole.permissions) {
          if (!user.permissions.includes(permission)) {
            user.permissions.push(permission)
          }
        }
      }
    }
    delete user._id
    
    const updatedUser = await client
      .db()
      .collection('users')
      .updateOne({ _id: ObjectId(user_id) }, { $set: user }, { upsert: false })
  }

  // ---------------- logBook ----------------

  let log = {
    user_id: req.body.user._id,
    company_id: req.body.user.company_id,
    Module: 'Role',
    Action: 'Edit',
    Description: 'Edit role (' + role.title + ')',
    created_at: new Date()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  return res.status(201).json({ success: true, data: users })
}
