import { connectToDatabase } from 'src/configs/dbConnect'
import { getToken } from 'next-auth/jwt'
import { ObjectId } from 'mongodb'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('ViewEmployee')) {
    return  res.status(401).json({ success: false, message: 'Not Auth' })
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
            {
              $match:{ $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }] },

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
                date_from: { $gte: fromDate , $lte: toDate  },
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
            { $match:  { $and: [
              {date_from: { $gte: new Date("1/1/"+new Date().getFullYear()) , $lt: new Date("1/1/"+(new Date().getFullYear()+1))  }},
              { $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }] },
              { $expr: { $eq: ['$employee_id', '$$id'] } }
            ]}}
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
            { $match: { date: { $gte: fromDate , $lte: toDate  } } }
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
            { $match: { date: { $gte: fromDate , $lte: toDate  } } }
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
  if(!employee || !employee[0] ){
    return res.status(404).json({success: false, message : 'No employee with this ID'});
  }
  if(!employee[0].salaryFormulas_info || ! employee[0].salaryFormulas_info[0]|| !employee[0]?.shift_info || !employee[0]?.shift_info[0]  ){
    let message = [] ;
    if(!employee[0].salaryFormulas_info || ! employee[0].salaryFormulas_info[0]){
      message.push('Error: define Sarlary Formula for this employee first');

    }
    if(!employee[0]?.shift_info || !employee[0]?.shift_info[0] ){
      message.push('Error: define Shift info for this employee first');
    }  
    
    return res.status(400).json({success: false, message: message }); 
  }
  let start = fromDate
  let end = toDate
  let attendances = []
  let index = 0
  const weekday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  let holidays = [] ; 
  if(company.holidays){
    holidays = company.holidays.map(day => {
      return new Date(day.date).toLocaleDateString()
    })
  }

  if (employee)
    for (let x = start; x <= end; x.setDate(x.getDate() + 1)) {

      index++
      let _in = ''
      let _out = ''
      let earlyFlag = false // It represents lateness when working in the morning
      let lateFlag = false // It represents lateness when working in the evening
      let earlyOvertimeFlag = false ; // It represents overtime when working before work in the morning
      let lateOvertimeFlag = false ;// It represents overtime when working after work in the evening
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
      day = new Date(x).getDay() // index 
      let workingDay = working_days.includes(weekday[day]) // boolean
      let dateFormate = new Date(x).toLocaleDateString()
      if(company?.holidays)
        holidayDay = holidays.includes(dateFormate) // boolean
 

      // ----------------------- leaves ------------------------------------
      if(employee[0]?.leaves_info){ // each day we may have more than one leave 
        employee[0].leaves_info?.map(leave => {
            
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
      }
  
      // -----------------------------------------------------------------
      // console.log(employee[0]) ;
   
 
      const setUTCHours = (time)=>{
        let date = new Date('1/1/2023');
        date.setUTCHours(Number(time.split(':')[0]) ,  Number(time.split(':')[1]) );

        return date ;
      }
 
      let shift_in = setUTCHours(employee[0].shift_info[0].times[0].timeIn.toString() ) ; 
      let shift_out =  setUTCHours( employee[0].shift_info[0].times[0].timeOut.toString()  )
      let availableEarly =  setUTCHours( employee[0].shift_info[0].times[0].availableEarly.toString()  )// the amount of delay that doesn't count (in the morning)
      let availableLate =  setUTCHours( employee[0].shift_info[0].times[0].availableLate.toString()  )// the amount of delay that doesn't count (in the afternoon)
      let shiftOverTime1 =  setUTCHours( employee[0].shift_info[0].times[0]['1st'].toString()  )
      let shiftOverTime2 =  setUTCHours( employee[0].shift_info[0].times[0]['2nd'].toString()  )
      let shiftOverTime3 =  setUTCHours( employee[0].shift_info[0].times[0]['3rd'].toString()  )

      // ----------------------- Absence days -----------------------------------------

      if (!leaveDay && !holidayDay && workingDay) {
        lateFlag = true // initlizing it to true (assuming employee didn't attend ) then check if he did....
        lateHours = ((shift_out - shift_in) / 3600000).toFixed(2)
      }


      // -------------------------------------------------------------
      if(employee[0]?.attendances_info){
        if(!leaveDay){
            employee[0].attendances_info?.map(att => {
              if (new Date(x).toLocaleDateString() == new Date(att.date).toLocaleDateString() && !att.deleted_at ) {
                console.log(att.date , att.deleted_at) ;
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
                  earlyOvertimeFlag = true
                  earlyOverTimeHours = ((shift_in - new Date('1/1/2023 ' + _in.toString() + ' UTC')) / 3600000).toFixed(3)
                }
                if (new Date('1/1/2023 ' + _out.toString() + ' UTC') > shift_out) {
                  lateOvertimeFlag = true
                  lateOverTimeHours = ((new Date('1/1/2023 ' + _out.toString() + ' UTC') - shift_out) / 3600000).toFixed(3)
                }
              }
            })
          }
        }
      
      attendances.push({
        day: weekday[day],
        workingDay: workingDay,
        id: index,
        date: new Date(x),
        _in: _in,
        _out: _out,
        lateFlag: lateFlag,
        earlyFlag: earlyFlag,
        earlyOvertimeFlag: earlyOvertimeFlag,
        lateOverTimeHours: lateOverTimeHours,
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
    employee[0].hourlySalary = ( // ok
    employee[0].dailySalary /
    (
      (new Date('1/1/2023 ' + employee[0].shift_info[0].times[0].timeOut.toString() + ' UTC') -
        new Date('1/1/2023 ' + employee[0].shift_info[0].times[0].timeIn.toString() + ' UTC')) /
      3600000
    )
  )
  let totalEarlyOverTimeHours = 0 // overtime hours (morning)
  let totalLateOverTimeHours = 0// overtime hours (evening)

  attendances.map(att => { 
    totalEarlyOverTimeHours = totalEarlyOverTimeHours + Number(att.earlyOverTimeHours)
    totalLateOverTimeHours = totalLateOverTimeHours + Number(att.lateOverTimeHours)
  })

  employee[0].totalEarlyOverTimeHours = totalEarlyOverTimeHours
  employee[0].totalLateOverTimeHours = totalLateOverTimeHours

  employee[0].totalEarlyOverTimeValue = (
    +totalEarlyOverTimeHours *
    +employee[0].hourlySalary *
    +employee[0].salaryFormulas_info[0].firstOverTime
  )

  employee[0].totalLateOverTimeValue = (
    +totalLateOverTimeHours *
    +employee[0].hourlySalary *
    +employee[0].salaryFormulas_info[0].firstOverTime
  )

  let totalWorkingDaysCount =0 ;
  let totalholidayHours = 0
  let totalEarlyHours = 0 // lateness hours (morning)
  let totalLateHours = 0 // lateness hours (evening)
  let totalOffDayHours =0 ;

  attendances.map(att => {
    if (att._in) {
      totalWorkingDaysCount++
    }
    totalEarlyHours = totalEarlyHours + Number(att.earlyHours)
    totalLateHours = totalLateHours + Number(att.lateHours)
    if (att.holidayDay) {
      totalholidayHours = totalholidayHours + +Number(att.totalHours)
    }
    if (!att.holidayDay && !att.workingDay) { // ???????????? 
      totalOffDayHours = totalOffDayHours + Number(att.totalHours)
    }
  })
  employee[0].totalWorkingDaysCount = totalWorkingDaysCount
  employee[0].totalholidayHours = totalholidayHours

  employee[0].totalholidayValue = (
          +totalholidayHours *
          +employee[0].hourlySalary *
          +employee[0].salaryFormulas_info[0].holidayOverTime
  ).toFixed(2)

  employee[0].totalOffDayHours = totalOffDayHours
  employee[0].totalOffDayValue = (
          +totalOffDayHours *
          +employee[0].hourlySalary *
          +employee[0].salaryFormulas_info[0].weekendOverTime
  ).toFixed(2)
  employee[0].totalEarlyHours = totalEarlyHours
  employee[0].totalLateHours = totalLateHours
  employee[0].totalEarlyValue =
      (Number(employee[0].totalEarlyHours + employee[0].totalLateHours) *
      Number(employee[0].salaryFormulas_info[0].notJustifiedAbsenceHoure) * // those hours are not justified because justified hours (are in leaves)
      Number(employee[0].hourlySalary) *
      -1).toFixed(2)
    
  return res.status(200).json({ success: true, data: employee, attendances: attendances })
}

// to do
/*
  1. calculate the overall salary
     subtract the leaves:
      based on the salary formula
      add the overtime based on the salary formula 
      salary formula -> paid leaves , unpaid leaves , sick leaves(1,2,3) , parental leaves(1,2,3)
  ..
    
  2. getting the leaves is not correct:
      where are checking:
        from_date : {gte: from_date , lte: to_date };
      what if :
        the leave was before from_date and after to_date
        ...



*/