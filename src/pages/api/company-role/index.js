
import { connectToDatabase } from 'src/configs/dbConnect'
import { getToken } from 'next-auth/jwt'


export default async function handler(req, res) {

  if (!req.query.q) {
    req.query.q = ''
  }
  
  // -------------------- Token ---------------------

  const token = await getToken({req})
  if (!token || !token.user || !token.user.permissions.includes('ViewRole')) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }


  // ---------------------------------------------------------------

  const client = await connectToDatabase()
  
  const roles = await client
    .db()
    .collection('roles')
    .aggregate([
      {
        $match: {
          $and: [{ type: 'company' },
          { company_id : token.user.company_id },
          { $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }] }]
        }
      },
      {
        $lookup: {
          from: 'users',
          let: { roles: '$roles' },
          pipeline: [{ $match: { roles: { $elemMatch: { $eq: '$_id' } } } }],
          as: 'users_info'
        }
      },
      {
        $sort: {
          created_at: -1
        }
      }
    ])
    .toArray()

  res.status(200).json({ success: true, data: roles })
}
