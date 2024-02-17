import { ObjectId } from 'mongodb'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const {
    query: { id },
    method
  } = req


  const client = await connectToDatabase()
  
  const department = await client
    .db()
    .collection('departments')
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
      }
    ])
    .toArray()

  res.status(200).json({ success: true, data: department })

}
