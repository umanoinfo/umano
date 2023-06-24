import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

// ** Axios Imports
import axios from 'axios'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('AddDocument')) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // -------------------- Insert ---------------------------------------------

  const document = req.body.data
  if (!document.title || !document.version || !document.type) {
    res.status(422).json({
      message: 'Invalid input'
    })
    return
  }
  document.company_id = myUser.company_id
  const newDocument = await client.db().collection('documents').insertOne(document)
  const insertedDocument = await client.db().collection('documents').findOne({ _id: newDocument.insertedId })

  // ---------------------- Add Event --------------------------------------

  if (!insertedDocument.expiryDateFlag) {
    let event = {}
    event.title = 'Expiry date for ' + document.title
    event.allDay = true
    event.Description = 'Expiry date for ' + document.title
    event.StartDate = document.expiryDate
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

  // -------------------- LogBook ------------------------------------------

  let log = {
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: 'Document',
    Action: 'Add',
    Description: 'Add Document (' + insertedDocument.title + ')',
    created_at: new Date()
  }
  const newLogBook = await client.db().collection('LogBook').insertOne(log)

  res.status(201).json({ success: true, data: insertedDocument })
}
