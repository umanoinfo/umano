import { connectToDatabase } from 'src/configs/dbConnect'
import { getToken } from 'next-auth/jwt'
import { ObjectId } from 'mongodb'

export default async function handler(req, res) {
  if (!req.query.q) {
    req.query.q = ''
  }
  if (!req.query.employeeType) {
    req.query.employeeType = ''
  }
  if (!req.query.q) {
    req.query.q = ''
  }

  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('ViewEmployee')) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // --------------------- Get ------------------------------------------

  const employees = await client
    .db()
    .collection('employees')
    .aggregate([
      {
        $match: {
          $and: [ 
            { $or: [{ firstName: { $regex: req.query.q, '$options' : 'i'  } }, { lastName: { $regex: req.query.q , '$options' : 'i'  } }] },
            { employeeType: { $regex: req.query.employeeType } },
            { company_id: myUser.company_id },
            { $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }] }
          ]
        }
      },
      {
        $lookup: {
          from: 'employeePositions',
          let: { id: { $toObjectId: '$_id' } },
          pipeline: [
            { $addFields: { employee: { $toObjectId: '$employee_id' } } },
            {
              $match: {
                $and: [
                  { $expr: { $eq: ['$employee', '$$id'] } },
                  { company_id: myUser.company_id },
                  { $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }]},
                  { $or:[
                    { endChangeDate: { $exists: false } },
                    { endChangeDate: null },
                  ] }
                ]
              }
            }
          ],
          as: 'positions_info'
        }
      },
      {
        $lookup: {
          from: 'shifts',
          let: { shift_id: { $toObjectId: '$shift_id' } },
          pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$shift_id'] } } }],
          as: 'shift_info'
        }
      },
      {
        $lookup: {
          from: 'employeeLeaves',
          let: { employee_id: { $toString: '$_id' } },
          pipeline: [{ $match: { $expr: { $eq: ['$employee_id', '$$employee_id'] } } }],
          as: 'leaves_info'
        }
      },
      {
        $lookup: {
          from: 'salaryFormula',
          let: { salary_formula_id: { $toObjectId: '$salary_formula_id' } },
          pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$salary_formula_id'] } } }],
          as: 'salaryFormulas_info'
        }
      },
      {
        $sort: {
          created_at: -1
        }
      }
    ])
    .toArray()

    const departments = await client
    .db()
    .collection('departments')
    .aggregate([
      {
        $match: {
          $and: [
            { company_id: myUser.company_id },
          ]
        }
      },
      {
        $lookup: {
          from: 'employees',
          let: { user_id: { $toObjectId: '$user_id' } },
          pipeline: [{ $addFields: { user_id: '$_id' } }, { $match: { $expr: { $eq: ['$user_id', '$$user_id'] } } }],
          as: 'user_info'
        }
      },
      {
        $sort: {
          created_at: -1
        }
      }
    ])
    .toArray()


  res.status(200).json({ success: true, data: employees , departmemts:departments})
}
