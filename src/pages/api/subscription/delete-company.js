import { ObjectId } from 'mongodb'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const selectedCompany = req.body.selectedCompany
  const id = selectedCompany._id

  const client = await connectToDatabase()

  const company = await client
    .db()
    .collection('companies')
    .findOne({ _id: ObjectId(id) })

  if (company.deleted_at) {
    const deletCompany = await client
      .db()
      .collection('companies')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: '' } }, { upsert: false })
  } else {
    const deletCompany = await client
      .db()
      .collection('companies')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: new Date() } }, { upsert: false })
  }

  return  res.status(200).json({ success: true, data: company })

}
