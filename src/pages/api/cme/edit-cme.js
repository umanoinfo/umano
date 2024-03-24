import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const { method } = req
  if(req.method != 'POST'){
    return res.status(405).json({success: false , message: 'Method is not allowed'});
  }
  
  const client = await connectToDatabase()


  // ------------------------------- Token -------------------------------------
  const {id} = req.query; 
  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('EditCME')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  if(!req.body.amount || !req.body.date ){
    return res.status(400).json({success: false , message: 'Amount & Employee & Date are required'});
  }

  // ----------------------------- View Companies --------------------------------
  const cme = await client.db().collection('cme').updateOne({_id: ObjectId(id)},{$set: req.body}, {upsert:false,  });

  let log = {
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: 'CME',
    Action: 'Edit',
    Description: 'Edit CME ('+ (id) + ' )' ,
    created_at: new Date()
  }

  const newlogBook = await client.db().collection('logBook').insertOne(log)
  
  return res.status(200).json({ success: true, data: cme })
  
}
