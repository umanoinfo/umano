import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  if(req.method != 'POST'){
    return res.status(405).json({success: false , message: 'Method is not allowed'});
  }
  const client = await connectToDatabase()

  // ------------------------------- Token -------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('EditPayrollAllowance')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ------------------------------- Edit -------------------------------------
  const compensation = req.body.data
  const comp = await client.db().collection('compensations').findOne({_id: ObjectId(compensation._id)  , company_id: myUser.company_id.toString()});
  if(!comp){
    return res.status(404).json({success: false, message: 'Compensation not found'});
  }


  if (!compensation.type || !compensation.title || (!compensation.fixedValue && !compensation.percentageValue)) {
    return res.status(422).json({
      message: 'Invalid input'
    })

  }

  compensation.company_id = myUser.company_id
  compensation.updated_at = new Date()
  const id = compensation._id
  delete compensation._id
  delete compensation.user_id
  compensation.user_id = myUser._id

  const newCompensation = await client
    .db()
    .collection('compensations')
    .updateOne({ _id: ObjectId(id) }, { $set: compensation }, { upsert: false })

  // -------------------------- logBook ---------------------------

  let log = {
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: 'Compensation',
    Action: 'Edit',
    Description: 'Edit compensation (' + compensation.title + ')',
    created_at: new Date()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  return res.status(201).json({ success: true, data: newCompensation })
}
