import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!token) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ---------------- Add File ---------------------------------------------

  const file = req.body.data
  if (!file.linked_id || !file.name) {
    res.status(422).json({
      message: 'Invalid input'
    })

    return
  }

  file.company_id = myUser.company_id
  const newFile = await client.db().collection('files').insertOne(file)

  // -------------------- logBook ------------------------------------------

    let log = {
      user_id: myUser._id,
      company_id: myUser.company_id,
      Module: 'File',
      Action: 'Add',
      linked_id: ObjectId(file.linked_id) ,
      Description: 'Add File (' + file.name + ')',
      created_at: new Date()
    }
    const newlogBook = await client.db().collection('logBook').insertOne(log)

  res.status(201).json({ success: true, data: req.body.formData })
}
