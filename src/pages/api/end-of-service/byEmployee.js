import { connectToDatabase } from 'src/configs/dbConnect'
import { getToken } from 'next-auth/jwt'
import { ObjectId } from 'mongodb'
import { functions } from 'src/helpers/end-of-service-calculation-fuctions'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('ViewPayroll')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }



  const selectedEmployee = req.body.data
  const id = selectedEmployee._id

  const fromDate = new Date(new Date(new Date(selectedEmployee.fromDate).setUTCHours(0, 0, 0, 0)).toISOString());
  const toDate = new Date(new Date(new Date(selectedEmployee.toDate).setUTCHours(23, 59, 59, 999)).toISOString());




  // --------------------- Get ------------------------------------------

  let employee = await client
    .db()
    .collection('employees')
    .aggregate([
      {
        $match: {
          $and: [{ _id: ObjectId(id) }, { company_id: myUser.company_id }]
        }
      },
      {
        $lookup: {
          from: 'salaryFormula',
          let: { salary_formula_id: { $toString: '$salary_formula_id' } },
          pipeline: [
            { $addFields: { formula_id: { $toObjectId: '$_id' } } },
            { $match: { $expr: { $eq: ['$formula_id', { $toObjectId: '$$salary_formula_id' }] } } },
            { $match: { $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }] } },
          ],
          as: 'salaryFormulas_info'
        }
      },
      {
        $lookup: {
          from: 'employeePositions',
          let: { employee_id: { $toString: '$_id' } },
          pipeline: [{ $match: { $expr: { $eq: ['$employee_id', '$$employee_id'] } } },
          { $match: { $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }] } },],
          as: 'employeePositions_info'
        }
      },
      {
        $lookup: {
          from: 'employeeSalaries',
          let: { employee_id: { $toString: '$_id' } },
          pipeline: [
            { $match: { $expr: { $eq: ['$employee_id', '$$employee_id'] } } },
            { $sort: { startChangeDate: 1 } },
            { $match: { $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }] } },
          ],
          as: 'salaries_info'
        }
      },
      {
        $lookup: {
          from: 'shifts',
          let: { shift_id: { $toObjectId: '$shift_id' } },
          pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$shift_id'] } } },
          { $match: { $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }] } },],
          as: 'shift_info'
        }
      },
      {
        $lookup: {
          from: 'attendances',
          let: { employee_no: { $toString: '$idNo' } },
          pipeline: [
            { $match: { $expr: { $eq: ['$employee_no', '$$employee_no'] } } },
            {
              $match: { date: { $gte: new Date(fromDate).toISOString(), $lte: new Date(toDate ).toISOString() } }
            },
            {
              $match: { $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }] },

            },
            { $match: { $expr: { $eq: ['$status', 'active'] } } },
            { $match: { $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }] } },
          ],
          as: 'attendances_info'
        }
      },
      {
        $lookup: {
          from: 'employeeLeaves',
          let: { employee_id: { $toString: '$_id' } },
          pipeline: [
            { $match: { $expr: { $eq: ['$employee_id', '$$employee_id'] } } },

            {
              $match: {
                date_from: { $gte: new Date(fromDate).toISOString(), $lte: new Date(toDate).toISOString() },
                $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }]
              }
            },
            { $match: { $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }] } },
          ],
          as: 'leaves_info'
        }
      },
      {
        $sort: {
          created_at: -1
        }
      }
    ])
    .toArray()

  const company = await client
    .db()
    .collection('companies')
    .findOne({ _id: ObjectId(myUser.company_id) })

  let holidays = [];
  if (company.holidays) {
    holidays = company.holidays.map(day => {
      let holidayDate = new Date(day.date).toLocaleDateString().split('/');

      return holidayDate[0] + '/' + holidayDate[1];
    })
  }
  const working_days = company.working_days

  if (!employee || !employee[0]) {
    return res.status(404).json({ success: false, data: [], message: 'Employee not found' });
  }
  employee = employee[0];

  let data = { employee , fromDate ,toDate , company , working_days , holidays , res };
  console.log(employee.shift_info?.[0]?.shiftType );
  if(employee.shift_info?.[0]?.shiftType == 'times'){
      functions.Monthly(data);

      return ;
  }
  else if(employee.shift_info?.[0]?.shiftType == 'DailyTotalWorkingHours'){
    functions.DynamicTotalHours(data);
    
    return ;
      
  }else if(employee.shift_info?.[0]?.shiftType == 'totalWorkingHours'){
    functions.DynamicTotalHours(data);

    return ;
  }

  return res.json({success:false , message:'define shift type'}) ;
}
