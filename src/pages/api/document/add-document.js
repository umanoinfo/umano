import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

// ** Axios Imports
import axios from 'axios'

export default async function handler(req, res) {
  if(req.method != 'POST'){
    return res.status(405).json({success: false , message: 'Method is not allowed'});
  }
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('AddDocument')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // -------------------- Insert ---------------------------------------------

  const document = req.body.data
  if (!document.title || !document.version || !document.type) {
    return res.status(422).json({
      message: 'Invalid input'
    })
  }

  if(!document.notifyBefore){
    document.notifyBefore = 30
  }
  document.notifyBeforeDays = document.notifyBefore
  var date = new Date(document.expiryDate);
  date.setDate(date.getDate() - document.notifyBefore); 

  document.notifyBefore = date
  document.company_id = myUser.company_id
  document.expiryDate = new Date(document.expiryDate)
  const newDocument = await client.db().collection('documents').insertOne(document)
  const insertedDocument = await client.db().collection('documents').findOne({ _id: newDocument.insertedId })

  // ---------------------- Add Event --------------------------------------



  if (!insertedDocument.expiryDateFlag) {
    let event = {}
    event.title = document.title + ' Expired'
    event.allDay = true
    event.description = document.title + ' Expired'
    event.startDate = document.expiryDate
    event.endDate = document.expiryDate
    event.type = 'Document'
    event.users = []
    event.status = 'active'
    event.company_id = myUser.company_id
    event.user_id = myUser._id
    event.created_at = new Date()
    event.document_id = insertedDocument._id
    const newEvent = await client.db().collection('events').insertOne(event)
  }

  // -------------------- logBook ------------------------------------------

  let log = {
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: 'Document',
    Action: 'Add',
    linked_id: insertedDocument._id ,
    Description: 'Add Document (' + insertedDocument.title + ')',
    created_at: new Date()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  return res.status(201).json({ success: true, data: insertedDocument })
}
