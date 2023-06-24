import { connectToDatabase } from 'src/configs/dbConnect'
import { getToken } from 'next-auth/jwt'

export default async function handler(req, res) {
  if (!req.query.q) {
    req.query.q = ''
  }
  if (!req.query.no) {
    req.query.no = ''
  }
  if (!req.query.month) {
    req.query.month = ''
  }
  if (!req.query.year) {
    req.query.year = ''
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
            { $or: [{ firstName: { $regex: req.query.q } }, { lastName: { $regex: req.query.q } }] },
            { idNo: { $regex: req.query.no } },
            { $expr: { $eq: [{ $month: '$created_at' }, 6] } },
            { company_id: myUser.company_id },
            { $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }] }
          ]
        }
      },
      {
        $lookup: {
          from: 'salaryFormula',
          let: { salary_formula_id: { $toString: '$salary_formula_id' } },
          pipeline: [
            { $addFields: { formula_id: { $toObjectId: '$_id' } } },
            { $match: { $expr: { $eq: ['$formula_id', { $toObjectId: '$$salary_formula_id' }] } } }
          ],
          as: 'salaryFormulas_info'
        }
      },
      {
        $lookup: {
          from: 'employeeSalaries',
          let: { employee_id: { $toString: '$_id' } },
          pipeline: [
            { $match: { $expr: { $eq: ['$employee_id', '$$employee_id'] } } },
            { $sort: { startChangeDate: 1 } }
          ],
          as: 'salaries_info'
        }
      },
      {
        $lookup: {
          from: 'attendances',
          let: { employee_no: { $toString: '$idNo' } },
          pipeline: [
            { $match: { $expr: { $eq: ['$employee_no', '$employee_no'] } } },
            { $match: { $expr: { $eq: [{ $month: '$date' }, Number(req.query.month)] } } },
            { $match: { $expr: { $eq: [{ $year: '$date' }, Number(req.query.year)] } } },
            { $match: { $expr: { $eq: ['$status', 'active'] } } }
          ],
          as: 'attendances_info'
        }
      },
      {
        $sort: {
          created_at: -1
        }
      }
    ])
    .toArray()

  // for (let emp of employees) {
  //   for (
  //     var d = new Date(req.query.year, req.query.month, 0);
  //     d <= new Date(req.query.year, req.query.month + 1, 0);
  //     d.setDate(d.getDate() + 1)
  //   ) {
  //     console.log(d)
  //   }
  // }

  let first = new Date(req.query.year, req.query.month - 1, 0)
  let last = new Date(req.query.year, req.query.month, 0)
  console.log(first, last)

  res.status(200).json({ success: true, data: employees })
}
