import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const { method } = req
  if(req.method != 'POST'){
    return res.status(405).json({success: false , message: 'Method is not allowed'});
  }
  const client = await connectToDatabase()

  console.log(req.body) ;   

  // ------------------------------- Token -------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('DeleteCME')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

   if(!req.body.id){
    return res.status(400).json({success: false , message: 'id is required'});
  }
  const curCME = await client.db().collection('cme').findOne({company_id: myUser.company_id.toString() , _id: ObjectId(req.body.id) }) ; 
  if(!curCME){
    return res.status(404).json({success: false, message: "CME not found"}) ;
  }


  // ----------------------------- View Companies --------------------------------
  const cme = await client.db().collection('cme').deleteOne({company_id: myUser.company_id.toString() , _id: ObjectId(req.body.id) }) ; 
   
  let log = {
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: 'CME',
    Action: 'Delete',
    Description: 'Delete CME (' + req.body.id + ')' ,
    created_at: new Date()
  }

  const newlogBook = await client.db().collection('logBook').insertOne(log)
  
  return res.status(200).json({ success: true, data: cme })
  
}
