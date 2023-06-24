import { connectToDatabase } from 'src/configs/dbConnect'
import { getToken } from 'next-auth/jwt'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  if (!req.query.compensationType) {
    req.query.compensationType = ''
  }
  if (!req.query.compensationStatus) {
    req.query.compensationStatus = ''
  }
  if (!req.query.q) {
    req.query.q = ''
  }

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('ViewPayrollCompensation')) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // --------------------- Post ---------------------------------------------------

  const compensations = await client
    .db()
    .collection('compensations')
    .aggregate([
      {
        $match: {
          $and: [
            { company_id: myUser.company_id },
            { title: { $regex: req.query.q } },
            { type: { $regex: req.query.compensationType } },
            { status: { $regex: req.query.compensationStatus } },
            { $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }] }
          ]
        }
      },
      {
        $sort: {
          created_at: -1
        }
      }
    ])
    .toArray()

  res.status(200).json({ success: true, data: compensations })
}
