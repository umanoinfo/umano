import { connectToDatabase } from 'src/configs/dbConnect'
import { getToken } from 'next-auth/jwt'
import { ObjectId } from 'mongodb'
import { functions } from 'src/helpers/salary-calculation-functions';

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('ViewPayroll')) {
    return res.status(401).json({ success: false, message: ['Not Auth'] })
  }

  const company = await client
    .db()
    .collection('companies')
    .findOne({ _id: ObjectId(myUser.company_id) })

  const working_days = company.working_days

  const selectedEmployee = req.body.data
  const id = selectedEmployee._id

  // let fromDate = new Date(new Date(selectedEmployee.fromDate).setUTCHours(0,0,0,0)) 
  // let toDate = new Date(new Date(selectedEmployee.toDate).setUTCHours(23,59,59,999))

  let fromDate = new Date(new Date(selectedEmployee.fromDate));
  let toDate = new Date(new Date(selectedEmployee.toDate));

  // fromDate = new Date( fromDate - 1000 * 60 * 60 * 24  );
  // toDate = new Date( toDate - 1000 * 60 * 60 * 24  );


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
          pipeline: [{
            $match: {
              $and: [
                { $expr: { $eq: ['$employee_id', '$$employee_id'] } },
                { $or: [{ deleted_at: null }, { deleted_at: { $exists: false } }] }
              ]
            }
          },
          { $match: { $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }] } },],

          as: 'employeePositions_info'
        }
      },
      {
        $lookup: {
          from: 'employeeSalaries',
          let: { employee_id: { $toString: '$_id' } },
          pipeline: [
            { $match: { $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }] } },
            { $match: { $and: [{ $expr: { $eq: ['$employee_id', '$$employee_id'] } }] } },
            { $sort: { created_at: -1 } }
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
          from: 'compensations',
          let: { compensations: '$compensations' },
          pipeline: [
            { $addFields: { string_id: { $toString: '$_id' } } },
            {
              $match: {
                $expr: {
                  $and: [{ $isArray: '$$compensations' }, { $in: ['$string_id', '$$compensations'] }],

                },
                $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }]
              }
            }
          ],
          as: 'compensations_array'
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
                $or: [
                  { date_from: { $gte: new Date(fromDate).toISOString(), $lte: new Date(toDate).toISOString() } },
                  { date_to: { $gte: new Date(fromDate).toISOString(), $lte: new Date(toDate).toISOString() } }

                ]

              }
            },
            {
              $match: {
                $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }]
              }
            }
          ],
          as: 'leaves_info'
        }
      },
      {
        $lookup: {
          from: 'employeeLeaves',
          let: { id: { $toString: '$_id' } },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $or: [
                      { date_from: { $gte: new Date("1/1/" + new Date().getFullYear()).toISOString(), $lt: new Date("1/1/" + (new Date().getFullYear() + 1)).toISOString() } },
                      { date_to: { $gte: new Date("1/1/" + new Date().getFullYear()).toISOString(), $lt: new Date("1/1/" + (new Date().getFullYear() + 1)).toISOString() } },
                    ]
                  },
                  { $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }] },
                  { $expr: { $eq: ['$employee_id', '$$id'] } }
                ]
              }
            }
          ],
          as: 'all_leaves_info' // for the curernt year only
        }
      },
      {
        $lookup: {
          from: 'deductions',
          let: { deductions: '$deductions' },
          pipeline: [
            { $addFields: { string_id: { $toString: '$_id' } } },
            { $match: { $expr: { $and: [{ $isArray: '$$deductions' }, { $in: ['$string_id', '$$deductions'] }] } } },
            { $match: { $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }] } },
          ],
          as: 'deductions_array'
        }
      },
      {
        $lookup: {
          from: 'employeeDeductions',
          let: { employee_id: { $toString: '$_id' } },
          pipeline: [
            { $match: { $expr: { $eq: ['$employee_id', '$$employee_id'] } } },

            { $match: { date: { $gte: (new Date(fromDate).toISOString()), $lte: (new Date(toDate).toISOString()) } } }, // this working without toISOString
            { $match: { $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }] } },
          ],
          as: 'employee_deductions_info'
        }
      },
      {
        $lookup: {
          from: 'employeeRewards',
          let: { employee_id: { $toString: '$_id' } },
          pipeline: [
            { $match: { $expr: { $eq: ['$employee_id', '$$employee_id'] } } },
            { $match: { date: { $gte: (new Date(fromDate).toISOString()), $lte: (new Date(toDate).toISOString()) } } }, // this working without toISOString
            { $match: { $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }] } },
          ],
          as: 'employee_rewards_info'
        }
      },
      {
        $sort: {
          created_at: -1
        }
      }
    ])
    .toArray()
  if (!employee || !employee[0]) {
    return res.status(404).json({ success: false, message: ['No employee with this ID'] });
  }
  employee = employee?.[0];
  let data = { employee, company, fromDate, toDate, req, working_days, res };

  if (employee) {
    if (employee?.salaryFormulas_info?.[0]?.type == 'Flexible') {
      functions.Flexible(data);

      return ;
    }
    else if (employee?.salaryFormulas_info?.[0]?.type == 'Monthly') {
      functions.Monthly(data);

      return ;
    }
    else if (employee?.salaryFormulas_info?.[0]?.type == 'MonthlyTotalHours') {
      functions.MonthlyTotalHours(data);

      return ;
    }
    else if(employee?.salaryFormulas_info?.[0]?.type == 'DailyTotalHours'){
      functions.DailyTotalHours(data);

      return ;
    }
  }
  if (!employee.salaryFormulas_info || !employee.salaryFormulas_info[0] || !employee?.shift_info || !employee?.shift_info[0] || (!employee?.salaryFormulas_info?.[0]?.type != 'Flexible' && (!employee.salaries_info || employee.salaries_info.length == 0)) || ((!company?.working_days || company?.working_days?.length == 0))) {
    let message = [];
    if (!employee.salaryFormulas_info || !employee.salaryFormulas_info?.[0]) {
      message.push('Error: define Sarlary Formula for this employee first');
    }
    if (!employee?.shift_info || !employee?.shift_info?.[0]) {
      message.push('Error: define Shift info for this employee first');
    }

    if (!employee?.salaryFormulas_info?.[0]?.type != 'Flexible' && (!employee.salaries_info || employee.salaries_info.length == 0)) {
      message.push('Error: Add salary first (no salary defined)!');
    }
    if (!company?.working_days || company?.working_days?.length == 0) {
      message.push('Error: define working days for your company');
    }

    return res.status(400).json({ success: false, message: message });
  }



  return res.status(200).json({ success: true, data: employee })
}
