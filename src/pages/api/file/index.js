import { connectToDatabase } from 'src/configs/dbConnect'
import { getToken } from 'next-auth/jwt'

export default async function handler(req, res) {
  if (!req.query.q) {
    req.query.q = ''
  }
  if (!req.query.fileStatus) {
    req.query.fileStatus = ''
  }

  if (req.query.fileTypes) {
    req.query.fileTypes = ''
  }

  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('ViewDocument')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // --------------------- Post ------------------------------------------

  const documents = await client
    .db()
    .collection('files')
    .aggregate([
      {
        $match: {
          $and: [
            { company_id: myUser.company_id },
            { name: { $regex: req.query.q ,'$options' :'i' } },
            { type: { $regex: req.query.fileTypes } },
          ]
        }
      },
      {
        $lookup: {
          from: 'documents',
          let: { linked_id: { $toObjectId: '$linked_id' } },
          pipeline: [
            { $addFields: { id: { $toObjectId: '$_id' } } },
            {
              $match: { $expr: { $eq: ['$id', '$$linked_id'] } }
            }
          ],
          as: 'document_info'
        }
      },
      {
        $sort: {
          created_at: -1
        }
      }
    ])
    .toArray()

  return res.status(200).json({ success: true, data: documents })
}
