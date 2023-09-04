import { connectToDatabase } from 'src/configs/dbConnect'
import { getToken } from 'next-auth/jwt'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })

  const myUser = await client.db().collection('users').findOne({ email: token.email })

  if (!myUser || !myUser.permissions || !myUser.permissions.includes('ViewRole')) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ---------------------- Get Departments -----------------------------------------

  if (!req.query.q) {
    req.query.q = ''
  }

  const departments = await client
    .db()
    .collection('departments')
    .aggregate([
      {
        $match: {
          $and: [
            { company_id: myUser.company_id },
            { $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }] }
          ]
        }
      },
      {
        $lookup: {
          from: 'departments',
          let: { department_id: { $toObjectId: '$parent' } },
          pipeline: [{ $addFields: { user_id: '$_id' } }, { $match: { $expr: { $eq: ['$_id', '$$department_id'] } } }],
          as: 'parent_info'
        }
      },
      {
        $lookup: {
          from: 'departments',
          let: { id: '$_id' },
          pipeline: [{ $match: { $expr: { $eq: ['$parent', '$id'] } } }],
          as: 'children_info'
        }
      },

      {
        $lookup: {
          from: 'departments',
          let: { id: { $toObjectId: '$_id' } },
          pipeline: [
            { $addFields: { parent: { $toObjectId: '$parent' } } },
            { $match: { $expr: { $eq: ['$parent', '$$id'] } } }
          ],
          as: 'children_info'
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


    const employees = await client
    .db()
    .collection('employeePositions')
    .aggregate([
      {
        $match: {
          $and: [
            { endChangeType: 'onPosition' },
            { company_id: myUser.company_id },
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

    departments.map((department)=>{
      let  employeesCount = 0
      employees.map((employee)=>{
        if(employee.department_id == department._id){
          employeesCount ++
        }
      })
      department.employeesCount = employeesCount
    })

  res.status(200).json({ success: true, data: departments })
}
