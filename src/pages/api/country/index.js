import { ObjectId } from 'mongodb'
import { connectToDatabase } from 'src/configs/dbConnect'
import { getToken } from 'next-auth/jwt'

export default async function handler(req, res) {
  const { method } = req
  const client = await connectToDatabase()

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions ) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  switch (method) {
    case 'GET':
      try {
        const countries = await client.db().collection('countries').find({}).toArray()
        
        return res.status(200).json({ success: true, data: countries })
      } catch (error) {
        return res.status(400).json({ success: false })
      }
      break
    case 'POST':
      try {
        if(myUser.type != 'admin' )
          return res.status(401).json({success : false , message: 'You are not allowed to edit countries'});

        const country = req.body
        const newCountry = await client.db().collection('countries').insertOne(country)
        const insertedCountry = await client.db().collection('countries').findById(newCountry.insertedId)
        
        return res.status(201).json({ success: true, data: insertedCountry })
      } catch (error) {
        return  res.status(400).json({ success: false })
      }
      break
    default:
      return res.status(400).json({ success: false })
      break
  }
}
