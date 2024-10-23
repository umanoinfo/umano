import { connectToDatabase } from 'src/configs/dbConnect'
import { getToken } from 'next-auth/jwt'
import { ObjectId } from 'mongodb'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  let fromDate = new Date().setUTCHours(0, 0, 0, 0)
  let toDate = new Date().setUTCHours(23, 59, 59, 999)

  if (!req.query.employee_no) {
    req.query.employee_no = ''
  }
  if (req.query.fromDate) {
    fromDate = new Date(req.query.fromDate).setUTCHours(0, 0, 0, 0)
  }
  if (req.query.toDate) {
    toDate = new Date(req.query.toDate).setUTCHours(23, 59, 59, 999)
  }

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('ViewAttendance')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // --------------------- Post ---------------------------------------------------

  const attendances = await client
    .db()
    .collection('attendances')
    .aggregate([
      {$addFields: {employee_no_str: {$toString: '$employee_no'}}},
      {
        $match: {
          $and: [
            { company_id: myUser.company_id },
            { employee_no_str: { $regex: req.query.employee_no  }},
            {
              date: {
                $gte: new Date(fromDate).toISOString(),
                $lte: new Date(toDate).toISOString()
              }
            },
            { $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }] }
          ]
        }
      },
      {
        $lookup: {
          from: 'employees',
          let: { employee_no:  { $toString: '$employee_no'}  },
          pipeline: [{ $match: { $expr: { $eq: ['$idNo', '$$employee_no'] } } }],
          as: 'employee_info'
        }
      },
      {
        $unwind: {
          path: '$employee_info',
          preserveNullAndEmptyArrays: true // Optional, if you want to keep documents without employee_info
        }
      },
      {
        $lookup: {
          from: 'shifts',
          let: { shift_id: { $toObjectId: '$employee_info.shift_id' } },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$shift_id']
                }
              }
            },
            {
              $match: {
                $or: [
                  { deleted_at: { $exists: false } },
                  { deleted_at: null }
                ]
              }
            }
          ],
          as: 'shift_info'
        }
      },
    
      {
        $sort: {
          date: -1
        }
      }
    ])
    .toArray()

    


    return res.status(200).json({ success: true, data: attendances })
}
