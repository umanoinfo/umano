import { ObjectId } from 'mongodb'
import { connectToDatabase } from 'src/configs/dbConnect'
import { getToken } from 'next-auth/jwt'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('ViewDocument')) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }

  const {
    query: { id },
    method
  } = req

  // try {

  // ---------------------- Insert -----------------------------

  const document = await client
    .db()
    .collection('documents')
    .aggregate([
      {
        $match: {
          _id: ObjectId(id)
        }
      },
      {
        $lookup: {
          from: 'files',
          let: { id: { $toObjectId: '$_id' } },
          pipeline: [
            { $addFields: { linked_id: { $toObjectId: '$linked_id' } } },
            {
              $match: { $expr: { $eq: ['$linked_id', '$$id'] } }
            }
          ],
          as: 'files_info'
        }
      }
    ])
    .toArray()

  res.status(200).json({ success: true, data: document })
}
