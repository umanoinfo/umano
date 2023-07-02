import { ObjectId } from 'mongodb'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const {
    query: { id },
    method
  } = req

  const client = await connectToDatabase()
  
  const company = await client
    .db()
    .collection('companies')
    .aggregate([
      {
        $match: {
          _id: ObjectId(id)
        }
      },
      {
        $lookup: {
          from: 'users',
          let: { mng_id: { $toObjectId: '$user_id' } },
          pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$mng_id'] } } }],
          as: 'user_info'
        }
      },
      {
        $lookup: {
          from: 'countries',
          let: { contry_id: { $toObjectId: '$country_id' } },
          pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$contry_id'] } } }],
          as: 'country_info'
        }
      }
    ])
    .toArray()

  res.status(200).json({ success: true, data: company })
}
