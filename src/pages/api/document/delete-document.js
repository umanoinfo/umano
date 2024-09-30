import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  if (req.method != 'POST') {
    return res.status(405).json({ success: false, message: 'Method is not allowed' });
  }
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('DeleteDocument')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ---------------- Delete --------------------

  const document = req.body.selectedDocument
  const id = document._id
  delete document._id

  const selectedDocument = await client
    .db()
    .collection('documents')
    .findOne({ _id: ObjectId(id), company_id: myUser.company_id.toString() })
  if (!selectedDocument) {
    return res.status(404).json({ success: false, message: 'Document not found' });
  }
  if (selectedDocument && selectedDocument.deleted_at) {
    const deletePosition = await client
      .db()
      .collection('documents')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: '' } }, { upsert: false })

    //-------------------- Event ---------------------------------

    const events = await client
      .db()
      .collection('events')
      .deleteMany({ document_id: ObjectId(id) })

    if (!selectedDocument.expiryDateFlag) {
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
      event.created_at = new Date().toISOString()()
      event.document_id = selectedDocument._id
      const newEvent = await client.db().collection('events').insertOne(event)
    }

    // ---------------- logBook ----------------

    let log = {
      user_id: myUser._id,
      company_id: myUser.company_id,
      Module: 'Document',
      Action: 'Restore',
      Description: 'Restore document (' + selectedDocument.title + ')',
      created_at: new Date().toISOString()()
    }
    const newlogBook = await client.db().collection('logBook').insertOne(log)
  } else {
    const deletePosition = await client
      .db()
      .collection('documents')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: new Date() } }, { upsert: false })

    // ---------------- logBook ----------------

    let log = {
      user_id: myUser._id,
      company_id: myUser.company_id,
      Module: 'Document',
      Action: 'Delete',
      linked_id: selectedDocument._id,
      Description: 'Delete document (' + selectedDocument.title + ')',
      created_at: new Date().toISOString()()
    }
    const newlogBook = await client.db().collection('logBook').insertOne(log)
  }

  return res.status(201).json({ success: true, data: selectedDocument })
}
