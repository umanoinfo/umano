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

    // ---------------- logBook ----------------

    let log = {
      user_id: myUser._id,
      company_id: myUser.company_id,
      Module: 'File',
      Action: 'Restore',
      Description: 'Restore file (' + selectedFile.name + ')',
      created_at: new Date()
    }
    const newlogBook = await client.db().collection('logBook').insertOne(log)

     // -------------------- logBook Doc ------------------------------------------

     let logDog = {
      user_id: myUser._id,
      company_id: myUser.company_id,
      Module: 'File',
      Action: 'Restore',
      linked_id: ObjectId(selectedFile.linked_id) ,
      Description: 'Restore File (' + selectedFile.name + ')',
      created_at: new Date()
    }
    const newlogBookDoc = await client.db().collection('logBook').insertOne(logDog)

  } else {
    const deletFile = await client
      .db()
      .collection('files')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: new Date() } }, { upsert: false })

    // ---------------- logBook ----------------

    let log = {
      user_id: myUser._id,
      company_id: myUser.company_id,
      Module: 'Files',
      Action: 'Delete',
      Description: 'Delete file (' + selectedFile.name + ')',
      created_at: new Date()
    }
    const newlogBook = await client.db().collection('logBook').insertOne(log)

    
     // -------------------- logBook Doc ------------------------------------------

     let logDog = {
      user_id: myUser._id,
      company_id: myUser.company_id,
      Module: 'File',
      Action: 'Delete',
      linked_id: ObjectId(selectedFile.linked_id) ,
      Description: 'Delete File (' + selectedFile.name + ')',
      created_at: new Date()
    }
    const newlogBookDoc = await client.db().collection('logBook').insertOne(logDog)

  }

  res.status(201).json({ success: true, data: selectedFile })
}
