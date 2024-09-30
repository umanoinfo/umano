import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  if (req.method != 'POST') {
    return res.status(405).json({ success: false, message: 'Method is not allowed' });
  }
  const client = await connectToDatabase()

  // ------------------------------- Token -------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('EditEvent')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ------------------------------- Edit -------------------------------------

  const event = req.body.data
  if (!event.title || !event.startDate || !event.description) {
    res.status(422).json({
      message: 'Invalid input'
    })

    return
  }

  const id = event._id

  const selectedEvent = await client
    .db()
    .collection('events')
    .findOne({ _id: ObjectId(id), company_id: myUser.company_id.toString() })

  if (!selectedEvent) {
    return res.status(404).json({ success: false, message: 'Event not found' });
  }

  delete event._id
  delete event.user_id
  delete event.calendar
  delete event.user_info
  event.user_id = myUser._id

  const newEvent = await client
    .db()
    .collection('events')
    .updateOne({ _id: ObjectId(id) }, { $set: event }, { upsert: false })

  // -------------------------- logBook ---------------------------

  let log = {
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: 'Event',
    Action: 'Edit',
    Description: 'Edit event (' + event.title + ')',
    created_at: new Date().toISOString()()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  return res.status(201).json({ success: true, data: newEvent })
}
