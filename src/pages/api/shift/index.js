import { connectToDatabase } from 'src/configs/dbConnect'
import { getToken } from 'next-auth/jwt'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  if (!req.query.q) {
    req.query.q = ''
  }
  if (!req.query.shiftStatus) {
    req.query.shiftStatus = ''
  }

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('ViewAttendanceShift')) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // --------------------- Post ---------------------------------------------------

  const shifts = await client
    .db()
    .collection('shifts')
    .aggregate([
      {
        $match: {
          $and: [
            { company_id: myUser.company_id },
            { title: { $regex: req.query.q , '$options' : 'i' } },
            { status: { $regex: req.query.shiftStatus , '$options' : 'm'  } },
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

  res.status(200).json({ success: true, data: shifts })
}
