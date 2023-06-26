import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // ------------------------------- Token -------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('EditEvent')) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ------------------------------- Edit -------------------------------------

  const event = req.body.data
  if (!event.title || !event.StartDate || !event.Description) {
    res.status(422).json({
      message: 'Invalid input'
    })

    return
  }

  const id = event._id
  delete event._id
  delete event.user_id
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
    created_at: new Date()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  res.status(201).json({ success: true, data: newEvent })
}
