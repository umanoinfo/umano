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
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('EditDocument')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ------------------ Edit -----------------------------------------------

  const document = req.body.data
  const id = document._id
  delete document._id

  const doc = await client
    .db()
    .collection('documents')
    .findOne({ _id: ObjectId(id), company_id: myUser.company_id.toString() });

  if (!doc) {
    return res.status(404).json({ success: false, message: 'Document not found' });
  }

  if (!document.title || !document.version || !document.type) {
    return res.status(422).json({
      message: 'Invalid input'
    })
  }

  if (!document.notifyBefore) {
    document.notifyBefore = 30
  }
  document.notifyBeforeDays = document.notifyBefore
  var date = new Date(new Date(document.expiryDate)- (Number(document.notifyBefore) * 1000 * 60 * 60 * 24 ));
  date.setDate(date.getDate() - document.notifyBefore);
  document.notifyBefore = date

  document.expiryDate = new Date(document.expiryDate).toISOString();

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
    event.created_at = new Date().toISOString()
    event.document_id = insertedDocument._id
    const newEvent = await client.db().collection('events').insertOne(event)
  }

  // ------------------ logBook -------------------

  let log = {
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: 'Document',
    Action: 'Edit',
    linked_id: insertedDocument._id,
    Description: 'Edit Document (' + insertedDocument.title + ')',
    created_at: new Date().toISOString()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  return res.status(201).json({ success: true, data: insertedDocument })
}
