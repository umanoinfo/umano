import { ObjectId } from 'mongodb'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const {
    query: { id },
    method
  } = req

  // try {
  const client = await connectToDatabase()
  
  const deduction = await client
    .db()
    .collection('deductions')
    .aggregate([
      {
        $match: {
          _id: ObjectId(id)
        }
      }
    ])
    .toArray()

  res.status(200).json({ success: true, data: deduction })
}
