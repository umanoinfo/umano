import { ObjectId } from 'mongodb'
import { connectToDatabase } from 'src/configs/dbConnect'
import { getToken } from 'next-auth/jwt'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('ViewPayrollFormula')) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }

  const {
    query: { id },
    method
  } = req

  // try {

  // ---------------------- Insert -----------------------------

  const salaryFormula = await client
    .db()
    .collection('salaryFormula')
    .aggregate([
      {
        $match: {
          _id: ObjectId(id)
        }
      }
    ])
    .toArray()

  res.status(200).json({ success: true, data: salaryFormula })
}
