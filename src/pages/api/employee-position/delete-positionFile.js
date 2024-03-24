import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  if(req.method != 'POST'){
    return res.status(405).json({success: false , message: 'Method is not allowed'});
  }
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('EditEmployee')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ------------------ Edit -----------------------------------------------

  const employeePosition = req.body.data

  const id = employeePosition._id

  const position = await client.db().collection('employeePositions').findOne({_id: ObjectId(id) , company_id: myUser.company_id.toString() })
  if(!position){
    return res.status(404).json({success: false, message: 'Employee Position not found'});
  }

  const file = position.file
  delete position._id
  position.file = null

  const updatePosition = await client
    .db()
    .collection('employeePositions')
    .updateOne({ _id: ObjectId(id) }, { $set: position }, { upsert: false })

  // ------------------ logBook -------------------

  let log = {
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: 'Employee position',
    Action: 'Delete File',
    Description: 'Delete file position (' + file + ')',
    created_at: new Date()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  return res.status(201).json({ success: true, data: employeePosition })
}
