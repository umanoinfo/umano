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

  let myUser = await client.db().collection('users').aggregate(
    [
      {
        $match:{
          email: token.email
        }
      },
      {
        $lookup: {
          from: 'subscriptions',
          let: { company_id:  '$company_id'  },
          pipeline: 
          [
            { $match: { $expr: { $eq: ['$company_id', '$$company_id'] } } },

            { $sort: { created_at : -1 } },
         ],
          as: 'subscriptions_info'
        }
      }
    ]
  ).toArray()
  myUser = myUser[0] ;
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('EditUser') || !myUser.subscriptions_info || !myUser.subscriptions_info[0]) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  const user = req.body.data
  const id = user._id

  // ------------------------- Validation for users count for the current subscription ----------------
  const curUser = await client
  .db()
  .collection('users')
  .findOne({ _id: ObjectId(id) , company_id: myUser.company_id.toString() } );
  if(!curUser){
    return res.status(404).json({success: false, message: 'User not found'});
  }
  if(curUser._id != myUser._id ){
    return res.status(401).json({success: false, message : 'You are not allowed to edit this account'});
  }

  const usersCount = await client.db().collection('users').countDocuments({company_id: myUser.company_id , status: 'active', $or:[{deleted_at: {$exists:false}} , {deleted_at: null}]}); 

  if(req.body.data.status == 'active' && req.body.data.status != curUser.status && usersCount + 1 > myUser.subscriptions_info[0].availableUsers){
    return res.status(400).json({success: false, message: `You are limited to only ${myUser.subscriptions_info[0].availableUsers} in your subscription`});
  }


  user.email = user.email.toLowerCase();
  delete user._id
  user.permissions = []



  if (user.roles) {
    for (const role_id of user.roles) {
      const selectedRole = await client
        .db()
        .collection('roles')
        .aggregate([{ $match: { $and: [{ _id: ObjectId(role_id) }] } }])
        .toArray()
      
      selectedRole[0].permissions.map((permission)=>{
        if(!myUser.permissions.includes(permission) || permission.includes('Admin')){
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

    return res.status(200).json({ success: true, data: updatedUser })
  } catch (error) {
    return res.status(400).json({ success: false })
  }
}
