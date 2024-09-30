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

  const file = req.body
  const id = file._id
  delete file._id

  const selectedFile = await client
    .db()
    .collection('files')
    .findOne({ _id: ObjectId(id), company_id: myUser.company_id.toString() })
  if (!selectedFile) {
    return res.status(404).json({ success: false, message: 'File not found' });
  }


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
      created_at: new Date().toISOString()()
    }
    const newlogBook = await client.db().collection('logBook').insertOne(log)

    // -------------------- logBook Doc ------------------------------------------

    let logDog = {
      user_id: myUser._id,
      company_id: myUser.company_id,
      Module: 'File',
      Action: 'Restore',
      linked_id: ObjectId(selectedFile.linked_id),
      Description: 'Restore File (' + selectedFile.name + ')',
      created_at: new Date().toISOString()()
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
      created_at: new Date().toISOString()()
    }
    const newlogBook = await client.db().collection('logBook').insertOne(log)


    // -------------------- logBook Doc ------------------------------------------

    let logDog = {
      user_id: myUser._id,
      company_id: myUser.company_id,
      Module: 'File',
      Action: 'Delete',
      linked_id: ObjectId(selectedFile.linked_id),
      Description: 'Delete File (' + selectedFile.name + ')',
      created_at: new Date().toISOString()()
    }
    const newlogBookDoc = await client.db().collection('logBook').insertOne(logDog)

  }

  return res.status(201).json({ success: true, data: selectedFile })
}
