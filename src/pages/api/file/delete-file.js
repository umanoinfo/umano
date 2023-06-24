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

  // ---------------- Delete --------------------

  const file = req.body
  const id = file._id
  delete file._id

  const selectedFile = await client
    .db()
    .collection('files')
    .findOne({ _id: ObjectId(id) })

  if (selectedFile && selectedFile.deleted_at) {
    const deletFile = await client
      .db()
      .collection('files')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: '' } }, { upsert: false })

    // ---------------- LogBook ----------------

    let log = {
      user_id: myUser._id,
      company_id: myUser.company_id,
      Module: 'File',
      Action: 'Delete',
      Description: 'Restore file (' + selectedFile.name + ')',
      created_at: new Date()
    }
    const newLogBook = await client.db().collection('LogBook').insertOne(log)
  } else {
    const deletFile = await client
      .db()
      .collection('files')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: new Date() } }, { upsert: false })

    // ---------------- LogBook ----------------

    let log = {
      user_id: myUser._id,
      company_id: myUser.company_id,
      Module: 'Files',
      Action: 'Delete',
      Description: 'Delete role (' + selectedFile.name + ')',
      created_at: new Date()
    }
    const newLogBook = await client.db().collection('LogBook').insertOne(log)
  }

  res.status(201).json({ success: true, data: selectedFile })
}
