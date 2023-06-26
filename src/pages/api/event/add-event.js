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
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('AddEvent')) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // -------------------- Insert ---------------------------------------------

  // const event = JSON.parse(req.body).data
  const event = req.body.data

  // let v = JSON.parse(req.body)
  // res.status(200).json({ success: true, data: v })

  // return
  if (!event.title || !event.startDate || !event.description) {
    res.status(422).json({
      message: 'Invalid input'
    })

    return
  }
  event.company_id = myUser.company_id
  event.user_id = myUser._id
  const newEvent = await client.db().collection('events').insertOne(event)
  const insertedEvent = await client.db().collection('events').findOne({ _id: newEvent.insertedId })

  // -------------------- logBook ------------------------------------------

  let log = {
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: 'Event',
    Action: 'Add',
    Description: 'Add Event (' + insertedEvent.title + ')',
    created_at: new Date()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  res.status(201).json({ success: true, data: insertedEvent })
}
