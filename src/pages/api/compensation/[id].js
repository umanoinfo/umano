import { ObjectId } from 'mongodb'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const {
    query: { id },
    method
  } = req

  const client = await connectToDatabase()
  
  const compensations = await client
    .db()
    .collection('compensations')
    .aggregate([
      {
        $match: {
          _id: ObjectId(id)
        }
      }
    ])
    .toArray()

  res.status(200).json({ success: true, data: compensations })
}
