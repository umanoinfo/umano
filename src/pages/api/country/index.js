import { ObjectId } from 'mongodb'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const { method } = req

  switch (method) {
    case 'GET':
      try {
        const client = await connectToDatabase()
        const countries = await client.db().collection('countries').find({}).toArray()
        res.status(200).json({ success: true, data: countries })
      } catch (error) {
        res.status(400).json({ success: false })
      }
      break
    case 'POST':
      try {
        const country = req.body
        const client = await connectToDatabase()
        const newCountry = await client.db().collection('countries').insertOne(country)
        const insertedCountry = await client.db().collection('countries').findById(newCountry.insertedId)
        res.status(201).json({ success: true, data: insertedCountry })
      } catch (error) {
        res.status(400).json({ success: false })
      }
      break
    default:
      res.status(400).json({ success: false })
      break
  }
}
