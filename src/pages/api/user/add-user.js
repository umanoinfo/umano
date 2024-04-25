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
  if (!user.email || !user.password || !user.name || !user.type || !user.email.includes('@')) {
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
