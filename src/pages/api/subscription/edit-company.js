import { ObjectId } from 'mongodb'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const { method } = req

  const company = req.body.data
  const id = company._id
  delete company._id

  if (!company.name) {
    res.status(422).json({
      message: 'Invalid input'
    })

    return
  }
  
  const client = await connectToDatabase()

  const newCompany = await client
    .db()
    .collection('companies')
    .updateOne({ _id: ObjectId(id) }, { $set: company }, { upsert: false })

  res.status(201).json({ success: true, data: company })
}
