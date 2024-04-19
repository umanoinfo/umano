import { ObjectId } from 'mongodb'
import { connectToDatabase } from 'src/configs/dbConnect'
import { hashPassword } from 'src/configs/auth'
import { getToken } from 'next-auth/jwt'

export default async function handler(req, res) {
  if(req.method != 'POST'){
    return res.status(405).json({success: false , message: 'Method is not allowed'});
  }
  const { method } = req

  const client = await connectToDatabase()

  // ---------------------------- Token -------------------------------------

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
  let subscription = myUser.subscriptions_info[0];
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('AddUser') || !myUser.subscriptions_info || !myUser.subscriptions_info[0]) {
    let message = 'Not Auth'; 
    if(!myUser.subscriptions_info || !myUser.subscriptions_info[0]){
      message = 'You are not allowed to add users because (You do not have active subscription)'
    }
    
    return res.status(401).json({ success: false, message  })
  }

  const user = req.body.data
  if (!user.email || !user.password || !user.name || !user.type || !user.email.includes('@')) {
    return res.status(422).json({
      message: 'Invalid input'
    })
  }
  const count = await client.db().collection('users').countDocuments({company_id: myUser.company_id , status:'active' , $or:[{deleted_at: {$exists:false}} , {deleted_at: null}]}) ;
  if(count + 1 > subscription.availableUsers){
    return res.status(400).json({success: false, message: `You are limited to only ${subscription.availableUsers} in your subscription`});
  }


  const creatingUser = await client.db().collection('users').findOne({ email: user.email })
  if (creatingUser) {
    return res.status(402).json({ success: false, message: 'There is user has same email' })
  }

  const hashedPassword = await hashPassword(user.password)
  user.password = hashedPassword

  user.email = user.email.toLowerCase();
  
  const newUser = await client.db().collection('users').insertOne(user)
  const insertedUser = await client.db().collection('users').findOne({ _id: newUser.insertedId })
  
  return res.status(201).json({ success: true, data: insertedUser })
}
