import { connectToDatabase } from 'src/configs/dbConnect'
import { getToken } from 'next-auth/jwt'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  if (!req.query.q) {
    req.query.q = ''
  }
  if (!req.query.type) {
    req.query.type = ''
  }
  if (!req.query.formulaStatus) {
    req.query.formulaStatus = ''
  }

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('ViewPayrollFormula')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // --------------------- Post ---------------------------------------------------

  const formulas = await client
    .db()
    .collection('salaryFormula')
    .aggregate([
      {
        $match: {
          $and: [
            { company_id: myUser.company_id },

            { title: { $regex: req.query.q , '$options' : 'i' } },
            { type: { $regex: req.query.type } },
            { status: { $regex: req.query.formulaStatus } },
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

  return res.status(200).json({ success: true, data: formulas })
}
