import { ObjectId } from 'mongodb'
import { connectToDatabase } from 'src/configs/dbConnect'
import { getToken } from 'next-auth/jwt'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  const {
    query: { id },
    method
  } = req

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })

  // try {
  const company = await client
    .db()
    .collection('companies')
    .aggregate([
      {
        $match: {
          _id: ObjectId(myUser.company_id)
        }
      }
    ])
    .toArray()

  res.status(200).json({ success: true, data: company })
  // } catch (error) {
  //   res.status(400).json({ success: false })
  // }
}
