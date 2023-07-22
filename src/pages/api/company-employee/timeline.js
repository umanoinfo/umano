import { ObjectId } from 'mongodb'
import { connectToDatabase } from 'src/configs/dbConnect'
import { getToken } from 'next-auth/jwt'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('ViewEmployee')) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }

  const id = req.body.data.id

  // ---------------------- Insert -----------------------------

  const employee = await client
    .db()
    .collection('employees')
    .aggregate([
      {
        $match: {
          _id: ObjectId(id)
        }
      },
      {
        $lookup: {
          from: 'countries',
          let: { contry_id: { $toObjectId: '$countryID' } },
          pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$contry_id'] } } }],
          as: 'country_info'
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
          from: 'employeeDeductions',
          let: { employee_id: { $toString: '$_id' } },
          pipeline: [{ $match: { $expr: { $eq: ['$employee_id', '$$employee_id'] } } }],
          as: 'deductions_info'
        }
      },
      {
        $lookup: {
          from: 'employeeRewards',
          let: { employee_id: { $toString: '$_id' } },
          pipeline: [{ $match: { $expr: { $eq: ['$employee_id', '$$employee_id'] } } }],
          as: 'rewards_info'
        }
      },
      {
        $lookup: {
          from: 'employeeSalaries',
          let: { employee_id: { $toString: '$_id' } },
          pipeline: [{ $match: { $expr: { $eq: ['$employee_id', '$$employee_id'] } } }],
          as: 'salaries_info'
        }
      },
      {
        $lookup: {
          from: 'salaryFormula',
          let: { salary_formula_id: { $toObjectId: '$salary_formula_id' } },
          pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$salary_formula_id'] } } }],
          as: 'salary_formula_info'
        }
      },
      {
        $lookup: {
          from: 'deductions',
          let: { deductions: '$deductions' },
          pipeline: [
            { $addFields: { string_id: { $toString: '$_id' } } },
            { $match: { $expr: 
              {$and: [
                { $isArray: '$$deductions' },
                { $in: ['$string_id', '$$deductions'] } 
              ]
            } } }
          ],
          as: 'deductions_array'
        }
      },
      {
        $lookup: {
          from: 'compensations',
          let: { compensations: '$compensations' } ,
          pipeline: [
            { $addFields: { string_id: { $toString: '$_id' } } },
            { $match: { $expr: {$and: [{ $isArray: '$$compensations' },
            { $in: ['$string_id', '$$compensations'] } ] } } }
          ],
          as: 'compensations_array'
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
          from: 'shifts',
          let: { shift_id: { $toObjectId: '$shift_id' } },
          pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$shift_id'] } } }],
          as: 'shift_info'
        }
      },
      {
        $lookup: {
          from: 'employeeDocuments',
          let: { employee_id: { $toString: '$_id' } },
          pipeline: [{ $match: { $expr: { $eq: ['$employee_id', '$$employee_id'] } } }],
          as: 'documents_info'
        }
      }
    ])
    .toArray()


    let timeline = []

    if(employee[0].joiningDate)
    {timeline.push({color:'success' , date : new Date (employee[0].joiningDate) , title : "Joining Date" , description : ""  })}

    employee[0].employeePositions_info.map((position)=>{
      timeline.push({color:'primary' , date : new Date (position.startChangeDate) , title : "New Position" , description : " Position " + position.positionTitle+ " " +position.startChangeDate+ " - " +position.endChangeDate })
    })

    employee[0].salaries_info.map((salary)=>{
      timeline.push({color:'warning' , date : new Date (salary.startChangeDate) , title : "New Salary" , description : " Salary Change ( " + salary.salaryChange+ " ) "  , subTitle :  " Basic Salary : " +salary.lumpySalary })
    })

    employee[0].deductions_info.map((deduction)=>{
      timeline.push({color:'error' , date : new Date (deduction.date) , title : "Deduction" , description :  deduction.reason + " : " +deduction.description  , subTitle : "Value : " + deduction.value })
    })

    employee[0].rewards_info.map((reward)=>{
      timeline.push({color:'info' , date : new Date (reward.date) , title : "Reward" , description : reward.reason + " : " +reward.description  , subTitle : "Value : " + reward.value })
    })

    function compare( a, b ) {
      if ( a.date < b.date ){
        return -1;
      }
      if ( a.date > b.date ){
        return 1;
      }
      return 0;
    }

    timeline.sort( compare );

  res.status(200).json({ success: true, data: employee , timeline:timeline})
}
