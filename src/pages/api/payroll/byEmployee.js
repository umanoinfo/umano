import { connectToDatabase } from 'src/configs/dbConnect'
import { getToken } from 'next-auth/jwt'
import { ObjectId } from 'mongodb'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('ViewEmployee')) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }

  const company = await client
    .db()
    .collection('companies')
    .findOne({ _id: ObjectId(myUser.company_id) })

  const working_days = company.working_days

  const selectedEmployee = req.body.data
  const id = selectedEmployee._id

  const fromDate = new Date(new Date(selectedEmployee.fromDate).setUTCHours(0,0,0,0))
  const toDate = new Date(new Date(selectedEmployee.toDate).setUTCHours(23,59,59,999))




  // --------------------- Get ------------------------------------------

  const employee = await client
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
            { $match: { $expr: { $eq: ['$formula_id', { $toObjectId: '$$salary_formula_id' }] } } }
          ],
          as: 'salaryFormulas_info'
        }
      },
      {
        $lookup: {
          from: 'employeePositions',
          let: { employee_id: { $toString: '$_id' } },
          pipeline: [{ $match: { $expr: { $eq: ['$employee_id', '$$employee_id'] } } }],
          as: 'employeePositions_info'
        }
      },
      {
        $lookup: {
          from: 'employeeSalaries',
          let: { employee_id: { $toString: '$_id' } },
          pipeline: [
            
            { $match: {$and:[{ $expr: { $eq: ['$employee_id', '$$employee_id'] } }]} },
            { $sort: { startChangeDate: -1 } }
          ],
          as: 'salaries_info'
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
          from: 'attendances',
          let: { employee_no: { $toString: '$idNo' } },
          pipeline: [
            { $match: { $expr: { $eq: ['$employee_no', '$employee_no'] } } },
            {
              $match: { date: { $gte: fromDate, $lte: toDate } }
            },
            { $match: { $expr: { $eq: ['$status', 'active'] } } }
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
                  $and: [{ $isArray: '$$compensations' }, { $in: ['$string_id', '$$compensations'] }]
                }
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
                date_from: { $gte: fromDate, $lte: toDate }
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
            { $match:  { $and: [
              {date_from: { $gte: new Date("1/1/"+new Date().getFullYear()), $lt: new Date("1/1/"+(new Date().getFullYear()+1)) }},
              { $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }] },
              { $expr: { $eq: ['$employee_id', '$$id'] } }
            ]}}
          ],
          as: 'all_leaves_info'
        }
      },
      {
        $lookup: {
          from: 'deductions',
          let: { deductions: '$deductions' },
          pipeline: [
            { $addFields: { string_id: { $toString: '$_id' } } },
            { $match: { $expr: { $and: [{ $isArray: '$$deductions' }, { $in: ['$string_id', '$$deductions'] }] } } }
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
            { $match: { date: { $gte: fromDate, $lte: toDate } } }
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
            { $match: { date: { $gte: fromDate, $lte: toDate } } }
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

  let start = fromDate
  let end = toDate
  let attendances = []
  let index = 0
  const weekday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  const holidays = company.holidays.map(day => {
    return new Date(day.date).toLocaleDateString()
  })

  if (employee)
    for (let x = start; x <= end; x.setDate(x.getDate() + 1)) {

      index++
      let _in = ''
      let _out = ''
      let earlyFlag = false
      let lateFlag = false
      let totalHours = 0
      let earlyHours = 0
      let lateHours = 0
      let earlyOverTimeHours = 0
      let lateOverTimeHours = 0
      let day = ''
      let holidayDay = false
      let leaveDay = false
      let leaveHourly = false
      let leavePaidValue = 0
      let leaves = []
      day = new Date(x).getDay()
      let workingDay = working_days.includes(weekday[day])
      let dateFormate = new Date(x).toLocaleDateString()
      holidayDay = holidays.includes(dateFormate)
 

      // ----------------------- leaves ------------------------------------

      employee[0].leaves_info.map(leave => {
       
          var dateFrom = new Date(leave.date_from).setUTCHours(0,0,0,0) ;
          var dateTo = new Date(leave.date_to).setUTCHours(0,0,0,0) ;
          var dateCheck = x.setUTCHours(0,0,0,0) ;
          if ( dateCheck >= dateFrom && dateCheck <= dateTo) {
            if (leave.type == 'daily') {
              leaveDay = true
            }
            if (leave.type == 'hourly') {
              leaveHourly = true
            }
            leaves.push(leave) 
          }
          
        return new Date(day.date).toLocaleDateString()
      })
  
      // -----------------------------------------------------------------

      let shift_in = new Date('1/1/2023 ' + employee[0].shift_info[0].times[0].timeIn.toString() + ' UTC')
      let shift_out = new Date('1/1/2023 ' + employee[0].shift_info[0].times[0].timeOut.toString() + ' UTC')
      let availableEarly = new Date('1/1/2023 ' + employee[0].shift_info[0].times[0].availableEarly.toString() + ' UTC')
      let availableLate = new Date('1/1/2023 ' + employee[0].shift_info[0].times[0].availableLate.toString() + ' UTC')
      let shiftOverTime1 = new Date('1/1/2023 ' + employee[0].shift_info[0].times[0]['1st'].toString() + ' UTC')
      let shiftOverTime2 = new Date('1/1/2023 ' + employee[0].shift_info[0].times[0]['2nd'].toString() + ' UTC')
      let shiftOverTime3 = new Date('1/1/2023 ' + employee[0].shift_info[0].times[0]['3rd'].toString() + ' UTC')

      // ----------------------- Absence days -----------------------------------------

      if ((!_in.toString() || !_out.toString()) && !leaveDay && !holidayDay && workingDay) {
        lateFlag = true
        lateHours = ((shift_out - shift_in) / 3600000).toFixed(2)
      }


      // -------------------------------------------------------------

      employee[0].attendances_info.map(att => {
        if (new Date(x).toLocaleDateString() == new Date(att.date).toLocaleDateString()) {
          _in = att.timeIn
          _out = att.timeOut
          earlyFlag = false
          earlyHours =0
          lateFlag = false
          lateHours = 0
          totalHours = (
            (new Date('1/1/2023 ' + _out.toString() + ' UTC') - new Date('1/1/2023 ' + _in.toString() + ' UTC')) /
            3600000
          ).toFixed(2)

          
          if (new Date('1/1/2023 ' + _in.toString() + ' UTC') > availableLate) {
            lateFlag = true
            lateHours = ((new Date('1/1/2023 ' + _in.toString() + ' UTC') - shift_in) / 3600000).toFixed(3)
          }

          if (new Date('1/1/2023 ' + _out.toString() + ' UTC') < availableEarly) {
            earlyFlag = true
            earlyHours = ((shift_out - new Date('1/1/2023 ' + _out.toString() + ' UTC')) / 3600000).toFixed(3)
          }

          // -------------------- overtime -----------------------

          if (new Date('1/1/2023 ' + _in.toString() + ' UTC') < shift_in) {
            lateFlag = true
            earlyOverTimeHours = ((shift_in - new Date('1/1/2023 ' + _in.toString() + ' UTC')) / 3600000).toFixed(3)
          }
          if (new Date('1/1/2023 ' + _out.toString() + ' UTC') > shift_out) {
            lateFlag = true
            lateOverTimeHours = ((new Date('1/1/2023 ' + _out.toString() + ' UTC') - shift_out) / 3600000).toFixed(3)
          }
        }
      })
      attendances.push({
        day: weekday[day],
        workingDay: workingDay,
        id: index,
        date: new Date(x),
        _in: _in,
        _out: _out,
        lateFlag: lateFlag,
        earlyFlag: earlyFlag,
        lateHours: lateHours,
        earlyHours: earlyHours,
        totalHours: totalHours,
        earlyOverTimeHours: earlyOverTimeHours,
        lateOverTimeHours: lateOverTimeHours,
        holidayDay: holidayDay,
        leaveDay: leaveDay,
        leaveHourly: leaveHourly,
        leaves:leaves
      })
    }

    
  res.status(200).json({ success: true, data: employee, attendances: attendances })
}
