import { connectToDatabase } from 'src/configs/dbConnect'
import { getToken } from 'next-auth/jwt'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  if (!req.query.leaveType) {
    req.query.leaveType = ''
  }
  if (!req.query.leaveStatus) {
    req.query.leaveStatus = ''
  }
  if (!req.query.q) {
    req.query.q = ''
  }
  if(!req.query.employee){
    req.query.employee = '';
  }

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('ViewEmployeeLeave')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // --------------------- Post ------------------------------------------

  const employeeLeaves = await client
    .db()
    .collection('employeeLeaves')
    .aggregate([
      {
        $match: {
          $and: [
            { reason: { $regex: req.query.q , '$options' : 'i' } },
            { type: { $regex: req.query.leaveType } },
            { status_reason: { $regex: req.query.leaveStatus } },
            { $or: [{ firstName: { $regex: req.query.employeeQ, '$options' : 'i'  } }, { lastName: { $regex: req.query.employeeQ , '$options' : 'i'  } } , { idNo: { $regex: req.query.employeeQ , '$options' : 'i'  } }] },
            
            // {$or:[
            // ]},
            { company_id: myUser.company_id },
            { $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }] }
          ]
        }
      },
      {
        $lookup: {
          from: 'employees',
          let: { employee_id: { $toObjectId: '$employee_id' } },
          pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$employee_id'] } } }],
          as: 'employee_info'
        }
      },
      {
        $sort: {
          date_from: -1
        }
      }
    ])
    .toArray()

    return res.status(200).json({ success: true, data: employeeLeaves })
}
