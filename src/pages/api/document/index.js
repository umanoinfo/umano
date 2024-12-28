import { connectToDatabase } from 'src/configs/dbConnect'
import { getToken } from 'next-auth/jwt'

export default async function handler(req, res) {
  if (!req.query.q) {
    req.query.q = ''
  }
  if (!req.query.documentStatus) {
    req.query.documentStatus = ''
  }

  if (req.query.documentTypes) {
    let arr = req.query.documentTypes.split(',')
    req.query.type = arr
  }
  if(!req.query.documentStatus && !req.query.documentTypes  && !req.query.q){
    return res.json({success:true , data:[]});
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
    .collection('documents')
    .aggregate([
      {
        $match: {
          $and: [
            { company_id: myUser.company_id },
            { title: { $regex: req.query.q , '$options' : 'i' } },
            { status: { $regex: req.query.documentStatus } },
            { type: { $in: req.query.type } },
            { $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }] }
          ]
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
            },
            { $match: { $or: [ {deleted_at: {$exists: false } } , {deleted_at: null }]  }},
          ],
          as: 'files_info'
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
