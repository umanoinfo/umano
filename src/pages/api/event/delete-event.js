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
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('DeleteEvent')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ---------------- Delete --------------------

  const event = req.body.selectedForm
  const id = event._id
  delete event._id

  const selectedEvent = await client
    .db()
    .collection('events')
    .findOne({ _id: ObjectId(id), company_id: myUser.company_id.toString() })

  if (!selectedEvent) {
    return res.status(404).json({ success: false, message: 'Event not found' });
  }

  if (selectedEvent && selectedEvent.deleted_at) {
    const deleteEvent = await client
      .db()
      .collection('events')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: '' } }, { upsert: false })

    // ---------------- logBook ----------------

    let log = {
      user_id: myUser._id,
      company_id: myUser.company_id,
      Module: 'Form',
      Action: 'Restore',
      Description: 'Restore event (' + selectedEvent.title + ')',
      created_at: new Date().toISOString()()
    }
    const newlogBook = await client.db().collection('logBook').insertOne(log)
  } else {
    const deleteEvent = await client
      .db()
      .collection('events')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: new Date() } }, { upsert: false })

    // ---------------- logBook ----------------

    let log = {
      user_id: myUser._id,
      company_id: myUser.company_id,
      Module: 'Form',
      Action: 'Event',
      Description: 'Delete event (' + selectedEvent.title + ')',
      created_at: new Date().toISOString()()
    }
    const newlogBook = await client.db().collection('logBook').insertOne(log)
  }

  return res.status(201).json({ success: true, data: selectedEvent })
}
