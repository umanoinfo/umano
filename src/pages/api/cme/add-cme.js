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

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('AddCME')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  if(!req.body.amount || !req.body.employee_id || !req.body.date || !req.body.description){
    return res.status(400).json({success: false , message: 'Amount & Employee & Date & Description are required'});
  }

  // ----------------------------- View Companies --------------------------------
  const cme = await client.db().collection('cme').insertOne({
    url: req.body.url ,
    amount : req.body.amount,
    employee_id: req.body.employee_id,
    company_id: myUser.company_id,
    created_at: new Date(),
    description: req.body.description,
    date: new Date(req.body.date)
  });

  let log = {
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: 'CME',
    Action: 'Add',
    Description: 'Add CME ',
    created_at: new Date()
  }

  const newlogBook = await client.db().collection('logBook').insertOne(log)
  
  return res.status(200).json({ success: true, data: cme })
  
}
