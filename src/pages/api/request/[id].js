import { ObjectId } from 'mongodb'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const {
    query: { id },
    method
  } = req

  const client = await connectToDatabase()

  const request = await client
    .db()
    .collection('requests')
    .aggregate([
      {
        $match: {
          _id: ObjectId(id)
        }
      },
      {
        $lookup: {
          from: 'users',
          let: { user_id: { $toObjectId: '$user_id' } },
          pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$user_id'] } } }],
          as: 'user_info'
        }
      },
      {
        $lookup: {
          from: 'employees',
          let: { applicant_id: { $toObjectId: '$applicant_id' } },
          pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$applicant_id'] } } }],
          as: 'applicant_info'
        }
      },
      {
        $lookup: {
          from: 'forms',
          let: { form_id: { $toObjectId: '$form_id' } },
          pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$form_id'] } } }, { $project: { title: 1 } }],
          as: 'form_info'
        }
      }
    ])
    .toArray()

  res.status(200).json({ success: true, data: request })
}
