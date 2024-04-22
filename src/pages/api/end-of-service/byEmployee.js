import { connectToDatabase } from 'src/configs/dbConnect'
import { getToken } from 'next-auth/jwt'
import { ObjectId } from 'mongodb'

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

  const fromDate = new Date(new Date(new Date(selectedEmployee.fromDate).setUTCHours(0,0,0,0)).toISOString());
  const toDate = new Date( new Date(new Date(selectedEmployee.toDate).setUTCHours(23,59,59,999)).toISOString());




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
            { $match: { $expr: { $eq: ['$employee_id', '$$employee_id'] } } },
            { $sort: { startChangeDate: 1 } }
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
          from: 'employeeLeaves',
          let: { employee_id: { $toString: '$_id' } },
          pipeline: [
            { $match: { $expr: { $eq: ['$employee_id', '$$employee_id'] } } },

            {
              $match: {
                date_from: { $gte: fromDate, $lte: toDate },
                $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }] 
              }
            }
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
    
    let holidays = [] ; 
    if(company.holidays){
      holidays = company.holidays.map(day => {
        let holidayDate = new Date(day.date).toLocaleDateString().split('/');
  
        return holidayDate[0] + '/' + holidayDate[1] ;      
      })
    }
    const working_days = company.working_days

    if(!employee || !employee[0]){
      return res.status(404).json({success: false , data: [] , message : 'Employee not found'});
    }
    employee = employee[0] ;
    employee.absenseDays = 0;
    let index = 0;
    let start = new Date(fromDate);
    let end = new Date(toDate);
    const weekday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    employee.allDays = 0;
    for (let x = new Date(start); x <= end; x.setDate(x.getDate() + 1)) {

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
      if(company?.holidays){
        let isHoliday = dateFormate.split('/');

        holidayDay = holidays.includes(isHoliday[0] + '/' + isHoliday[1]) // boolean
      }
      
      if(employee?.attendances_info){
        if(!leaveDay){
            employee.attendances_info?.map(att => {
              if (new Date(x).toLocaleDateString() == new Date(att.date).toLocaleDateString() ) {
                
                _in = setUTCHours( att.timeIn.toString() ) ;
                _out = setUTCHours( att.timeOut.toString() ) ;
                
                earlyFlag = false
                earlyHours =0
                lateFlag = false
                lateHours = 0

                
                totalHours = (
                  ( Math.min(shift_out , _out ) -  Math.max(shift_in , _in )) / 3600000
                )
                
                // ---------------- late ---------------------
                if(!holidayDay && workingDay) // in holidays & off days lateness doesn't count
                  if (_in > availableEarly) {
                    lateFlag = true
                    lateHours = (Math.abs(_in - shift_in) / 3600000).toFixed(2)
                  }
                if(!holidayDay && workingDay) // in holidays & off days lateness doesn't count
                  if (_out < availableLate) {
                    earlyFlag = true
                    earlyHours = (Math.abs(shift_out - _out ) / 3600000).toFixed(2)
                  }
      
                // -------------------- overtime -----------------------
                if(workingDay)
                {  
                  if (_in < shift_in) {
                    earlyOvertimeFlag = true
                    earlyOverTimeHours = ((shift_in - _in ) / 3600000).toFixed(2)
                  }
                  if (_out  > shift_out) {
                    lateOvertimeFlag = true
                    lateOverTimeHours = ((_out - shift_out) / 3600000).toFixed(2)
                  }
                }
                else{
                  if(_in < shift_in ){
                    earlyOvertimeFlag = true ;
                    if(holidayDay){
                      earlyOverTimeHours = (((shift_in - _in) / 3600000).toFixed(2) * employee.salaryFormulas_info[0].holidayOverTime ).toFixed(2);
                    }
                    else if(!workingDay){ // off day ( weekend )
                      earlyOverTimeHours = (((shift_in - _in) / 3600000).toFixed(2) * employee.salaryFormulas_info[0].weekendOverTime).toFixed(2) ;
                    }

                  }
                }
                _in = _in.toISOString().substr(11,8)
                _out = _out.toISOString().substr(11,8)

              }
              
            })
          }
        }
      
   
      // -------------------------------------------------------------

      // here when there are no attendances 
      if( workingDay && ! _in ){ // absense day
        employee.absenseDays++;
        continue ;
      }
      
      employee.allDays++ ;
     
    }
    if (employee?.leaves_info) {

      let unpaidLeaveTotal = 0 ; 
      let parentalLeaveTotal =0 ;
      let parentalLeave = new Map() ; 

      // add leaves before adding to system & check ( there is a paretnal leave that is not returned when calculating end of service for rew@emil.com)

      employee.leaves_info.map(leave => {
      if(leave.type == "daily" && leave.status_reason == 'unpaidLeave')
        {
          let from =  new Date(leave.date_from).setUTCHours(0,0,0,0)
          let to =  new Date(leave.date_to).setUTCHours(0,0,0,0)
          let days = ((to-from)/ (1000 * 60 * 60 * 24))+1
          unpaidLeaveTotal = unpaidLeaveTotal +  days
        }
      else if(leave.type == 'daily' && leave.status_reason == 'parentalLeave'){
          let from = new Date(leave.date_from).setUTCHours(0,0,0,0) ;
          let to = new Date(leave.date_to).setUTCHours(0,0,0,0) ;
          let days = ((to-from)/ (1000 * 60 * 60 * 24))+1;
          
          let curDate = new Date(leave.date_from) ;
          for(let i= 0 ; i < days ;i++){
              let val = (parentalLeave.get(curDate.getFullYear())  || 0) 
              parentalLeave.set( curDate.getFullYear()  , val + 1) ;
              curDate.setDate( curDate.getDate() + 1 )
          }
      }
      })
      parentalLeave.forEach((count)=> {
        if(count > 60 ){
          parentalLeaveTotal = parentalLeaveTotal + (count - 60 );
        }
      });

      employee.parentalLeaveOver60 = parentalLeaveTotal ;
      employee.unpaidLeaveTotal = unpaidLeaveTotal
  }
  employee.actualDays = employee.allDays - employee.parentalLeaveOver60 - employee.unpaidLeaveTotal - (employee?.unpaidLeavesBeforeAddingToSystem ?? 0 )- (employee?.parentalLeavesBeforeAddingToSystem ?? 0);
  employee.actualYears =  ((employee.actualDays)/365).toFixed(2) ;
  


  return res.status(200).json({ success: true, data: [employee]})
}
