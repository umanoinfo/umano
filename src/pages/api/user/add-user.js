import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'
import { hashPassword } from 'src/configs/auth'

export default async function handler(req, res) {
  if(req.method != 'POST'){
    return res.status(405).json({success: false , message: 'Method is not allowed'});
  }
  const { method } = req

  const client = await connectToDatabase()

  // ---------------------------- Token -------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('AdminAddUser')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // --------------------------- Change Password ---------------------------------

  const user = req.body.data
  user.company_info = []
  let reg = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
  if (!user.email || !user.password || !user.name || !user.type || !user.email.match(reg) ) {
    return res.status(422).json({
      message: 'Invalid input'
    });
  }

  // duplicate

  // const users = await client
  // .db()
  // .collection('users')
  // .aggregate([
  //   {
  //     $match: {
  //       $and: [
  //         { $or: [{ type: 'admin' }, { type: 'manager' }] },
  //       ]
  //     }
  //   },
  //   {
  //     $project: {email:1}
  //    }
  // ])
  // .toArray()

  // let emails = []
  // users.map((val)=>{
  //   emails.push(val.email)
  // })
  // console.log(emails )
  // user.email = user.email.toLowerCase();
  // if(emails.includes(user.email)){
  //   res.status(422).json({
  //     message: 'This email has already been registered'
  //   })
  // }
  user.email = user.email.toLowerCase();
  const creatingUser = await client.db().collection('users').findOne({ email: user.email })
  if (creatingUser) {
    return  res.status(402).json({ success: false, message: 'This email has already been registered' })
  }
  if (user.roles) {
    for (const role_id of user.roles) {
      const selectedRole = await client
        .db()
        .collection('roles')
        .aggregate([{ $match: { $and: [{ _id: ObjectId(role_id) }, { type: 'admin' }] } }])
        .toArray()
        
        let dontHavePermission = 0 ;
        console.log(selectedRole[0]);
        selectedRole[0].permissions.map((permission)=>{
          if(!myUser.permissions.includes(permission) ){
              console.log(permission);
              dontHavePermission= 1;
          }
        })
        if(dontHavePermission && myUser.email != 'admin@admin.com'){
          return res.status(401).json({success : false, message : 'You are not allowed to grant Roles to users that have higher priviliages than yours'});
        }
      
        if (selectedRole && selectedRole[0] && selectedRole[0].permissions) {
          for (const permission of selectedRole[0].permissions) {
            if (!user.permissions.includes(permission)) {
              user.permissions.push(permission)
            }
          }
        }
    }
  }

  const hashedPassword = await hashPassword(user.password)
  user.password = hashedPassword

  const newUser = await client.db().collection('users').insertOne(user)
  const insertedUser = await client.db().collection('users').findOne({ _id: newUser.insertedId })

  // ---------------- logBook ----------------

  let log = {
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: 'User',
    Action: 'Add',
    Description: 'Add user (' + insertedUser.name + ')',
    created_at: new Date()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  return  res.status(201).json({ success: true, data: insertedUser })
}
