import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const { method } = req

  const client = await connectToDatabase()

  // ------------------------------- Token -------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('AdminViewCompany')) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  } 

  // ----------------------------- View Companies --------------------------------

  if (!req.query.companyStatus) {
    req.query.companyStatus = ''
  }
  if (!req.query.type) {
    req.query.type = ''
  }
  if (!req.query.q) {
    req.query.q = ''
  }

  const companies = await client
    .db()
    .collection('companies')

    .aggregate([
      {
        $match: {
          $and: [
            { type: { $regex: req.query.type } },
            { status: { $regex: req.query.companyStatus } },
            { name: { $regex: req.query.q, '$options' : 'i' } },

            // { $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }] }
          ]
        }
      },
      {
        $lookup: {
          from: 'users',
          let: { user_id: { $toObjectId: '$user_id' } },
          pipeline: [{ $addFields: { user_id: '$_id' } }, { $match: { $expr: { $eq: ['$user_id', '$$user_id'] } } }],
          as: 'user_info'
        }
      },
      {
        $lookup: {
          from: 'subscriptions',
          let: { pr_company_id: { $toObjectId: '$_id' } },
          pipeline: [
            { $addFields: { ph_company_id: { $toObjectId: '$company_id' } } },
            { $match: { $expr: { $eq: ['$ph_company_id', '$$pr_company_id'] } } }
          ],
          as: 'subscriptions_info'
        }
      },
      {
        $sort: {
          created_at: -1
        }
      }
    ])
    .toArray()

  res.status(200).json({ success: true, data: companies })
}
