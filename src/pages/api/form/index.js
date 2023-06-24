import { connectToDatabase } from 'src/configs/dbConnect'
import { getToken } from 'next-auth/jwt'

export default async function handler(req, res) {
  if (!req.query.q) {
    req.query.q = ''
  }
  if (!req.query.formStatus) {
    req.query.formStatus = ''
  }

  if (!req.query.formType) {
    req.query.formType = ''
  }

  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('ViewForm')) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // --------------------- Post ------------------------------------------

  const forms = await client
    .db()
    .collection('forms')
    .aggregate([
      {
        $match: {
          $and: [
            { company_id: myUser.company_id },
            { title: { $regex: req.query.q } },
            { status: { $regex: req.query.formStatus } },
            { type: { $regex: req.query.formType } },
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

  res.status(200).json({ success: true, data: forms })
}
