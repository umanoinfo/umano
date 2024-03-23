import { ObjectId } from 'mongodb'
import { connectToDatabase } from 'src/configs/dbConnect'
import { getToken } from 'next-auth/jwt'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('ViewDocument')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  const {
    query: { id },
    method
  } = req

  
  // ---------------------- Insert -----------------------------

  const document = await client
    .db()
    .collection('documents')
    .aggregate([
      {
        $match: {
          _id: ObjectId(id),
          company_id: myUser.company_id.toString()
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


    const logBook = await client
    .db()
    .collection('logBook')
    .aggregate([
      {
        $match: {
          linked_id: ObjectId(document[0]._id)
        }
      },
       {
        $lookup: {
          from: 'users',
          let: { id: { $toObjectId: '$user_id' } },
          pipeline: [
            { $addFields: { user_id: { $toObjectId: '$_id' } } },
            {
              $match: { $expr: { $eq: ['$user_id', '$$id'] } }
            }
          ],
          as: 'user_info'
        }
      },
      {
        $sort: {
          created_at: -1
        }
      }
    ])
    .toArray()

  return res.status(200).json({ success: true, data: document , logBook: logBook})
}
