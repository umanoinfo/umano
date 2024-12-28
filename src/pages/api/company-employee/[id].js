import { ObjectId } from 'mongodb'
import { connectToDatabase } from 'src/configs/dbConnect'
import { getToken } from 'next-auth/jwt'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || (!myUser.permissions.includes('ViewEmployee'))) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  const {
    query: { id },
    method
  } = req

  // ---------------------- Insert -----------------------------

  const employee = await client
    .db()
    .collection('employees')
    .aggregate([
      {
        $match: {
          _id: ObjectId(id),
          company_id: myUser.company_id.toString()
        }
      },
      {
        $lookup: {
          from: 'countries',
          let: { contry_id: { $toObjectId: '$countryID' } },
          pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$contry_id'] } } }],
          as: 'country_info'
        }
      }
    ])
    .toArray()

  return res.status(200).json({ success: true, data: employee })
}
