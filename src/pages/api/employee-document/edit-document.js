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

  const employeeDocument = req.body.data
  const id = employeeDocument._id
  const document = await client.db().collection('employeeDocuments').findOne({_id: ObjectId(id) , company_id: myUser.company_id.toString()});
  if(!document){
    return res.status(404).json({success: false, message: 'document not found'});
  }

  delete employeeDocument._id

  if (!employeeDocument.documentTitle) {
    return  res.status(422).json({
      message: 'Invalid input'
    })
  }


  const updateDocument = await client
    .db()
    .collection('employeeDocuments')
    .updateOne({ _id: ObjectId(id) }, { $set: employeeDocument }, { upsert: false })

  // ------------------ logBook -------------------

  let log = {
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: 'Employee document',
    Action: 'Edit',
    Description: 'Edit employee document (' + employeeDocument.positionTitle + ')',
    created_at: new Date()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  return res.status(201).json({ success: true, data: employeeDocument })
}
