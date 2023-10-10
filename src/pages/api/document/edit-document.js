import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('EditDocument')) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ------------------ Edit -----------------------------------------------

  const document = req.body.data

  if (!document.title || !document.version || !document.type) {
    res.status(422).json({
      message: 'Invalid input'
    })
    
    return
  }

  if(!document.notifyBefore){
    document.notifyBefore = 30
  }
  document.notifyBeforeDays = document.notifyBefore
  var date = new Date(document.expiryDate);
  date.setDate(date.getDate() - document.notifyBefore); 
  document.notifyBefore = date
  const id = document._id
  delete document._id
  document.expiryDate = new Date(document.expiryDate)

  const updateDocument = await client
    .db()
    .collection('documents')
    .updateOne({ _id: ObjectId(id) }, { $set: document }, { upsert: false })

  const insertedDocument = await client
    .db()
    .collection('documents')
    .findOne({ _id: ObjectId(id) })

  //-------------------- Event ---------------------------------

  const events = await client
    .db()
    .collection('events')
    .deleteMany({ document_id: ObjectId(id) })

  if (!insertedDocument.expiryDateFlag) {
    let event = {}
    event.title = 'Expiry date for ' + document.title
    event.allDay = true
    event.description = 'Expiry date for ' + document.title
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

  // ------------------ logBook -------------------

  let log = {
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: 'Document',
    Action: 'Edit',
    linked_id: insertedDocument._id ,
    Description: 'Edit Document (' + insertedDocument.title + ')',
    created_at: new Date()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  res.status(201).json({ success: true, data: insertedDocument })
}
