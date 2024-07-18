import { ObjectId } from 'mongodb'
import { connectToDatabase } from 'src/configs/dbConnect'
import { getToken } from 'next-auth/jwt'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('ViewEmployee')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  const id = req.body.data.id

  // if(!req.body.data.compensations){ req.body.data.compensations =[]}
  // try {

  // ---------------------- Insert -----------------------------

  const employee = await client
    .db()
    .collection('employees')
    .aggregate([
      {
        $match: {
          _id: ObjectId(id),
          company_id: myUser.company_id.toString()
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
          pipeline: [{ $match: { $expr: { $eq: ['$employee_id', '$$employee_id'] } } },
          { $match: { $or: [ {deleted_at: {$exists: false } } , {deleted_at: null }]  }},
        ],
          as: 'leaves_info'
        }
      },
      {
        $lookup: {
          from: 'employeeDeductions',
          let: { employee_id: { $toString: '$_id' } },
          pipeline: [
            { $match: { $expr: { $eq: ['$employee_id', '$$employee_id'] } } }
            ,{ $match: { $or: [ {deleted_at: {$exists: false } } , {deleted_at: null }]  }},
        ],
          as: 'deductions_info'
        }
      },
      {
        $lookup: {
          from: 'employeeRewards',
          let: { employee_id: { $toString: '$_id' } },
          pipeline: [
            { $match: { $expr: { $eq: ['$employee_id', '$$employee_id'] } } },
            { $match: { $or: [ {deleted_at: {$exists: false } } , {deleted_at: null }]  }},
          ],
          as: 'rewards_info'
        }
      },
      {
        $lookup: {
          from: 'employeeSalaries',
          let: { employee_id: { $toString: '$_id' } },
          pipeline: [
            { $match: { $expr: { $eq: ['$employee_id', '$$employee_id'] } } },
            { $match: { $or: [ {deleted_at: {$exists: false } } , {deleted_at: null }]  }},
            { $sort: { startChangeDate: -1 } }],
          as: 'salaries_info'
        }
      },
      {
        $lookup: {
          from: 'salaryFormula',
          let: { salary_formula_id: { $toObjectId: '$salary_formula_id' } },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$salary_formula_id'] } } } , 
            { $match: { $or: [ {deleted_at: {$exists: false } } , {deleted_at: null }]  }},],
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
            } } },
            { $match: { $or: [ {deleted_at: {$exists: false } } , {deleted_at: null }]  }},
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
            { $in: ['$string_id', '$$compensations'] } ] } } },
            { $match: { $or: [ {deleted_at: {$exists: false } } , {deleted_at: null }]  }},
          ],
          as: 'compensations_array'
        }
      },
      {
        $lookup: {
          from: 'employeePositions',
          let: { employee_id: { $toString: '$_id' } },
          pipeline: [{ $match: { $expr: { $eq: ['$employee_id', '$$employee_id'] } } } , 
          { $match: { $or: [ {deleted_at: {$exists: false } } , {deleted_at: null }]  }},],
          as: 'employeePositions_info'
        }
      },
      {
        $lookup: {
          from: 'shifts',
          let: { shift_id: { $toObjectId: '$shift_id' } },
          pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$shift_id'] } } },
          { $match: { $or: [ {deleted_at: {$exists: false } } , {deleted_at: null }]  }},
        ],
          as: 'shift_info'
        }
      },
      {
        $lookup: {
          from: 'employeeDocuments',
          let: { employee_id: { $toString: '$_id' } },
          pipeline: [{ $match: { $expr: { $eq: ['$employee_id', '$$employee_id'] } } },
          { $match: { $or: [ {deleted_at: {$exists: false } } , {deleted_at: null }]  }},],
          as: 'documents_info'
        }
      }
    ])
    .toArray()

    if(employee && employee[0] && employee[0]?.salaries_info && employee[0]?.salaries_info[0] && employee[0].salaries_info[0].lumpySalary ){
      let prev = employee[0]?.salaries_info[0]?.lumpySalary ;
      employee[0].salaries_info.map((salary)=>{
            if(salary.lumpySalary >= prev ){
              salary.lumpySalaryPercentageChange = ((salary.lumpySalary - prev)/ prev * 100).toFixed(2);
            }
            else{
              salary.lumpySalaryPercentageChange = - ((prev - salary.lumpySalary)/ prev * 100).toFixed(2);
            }
            prev = salary.lumpySalary ;
      })
      let size = employee[0].salaries_info.length ;
      
      
      employee[0].salaries_info[size-1].totalSalary = Number( employee[0].salaries_info[size-1].lumpySalary ) ;
      employee[0].compensations_array.map((comp)=>{
        employee[0].salaries_info[size-1].totalSalary += Number(comp.fixedValue) ;
        employee[0].salaries_info[size-1].totalSalary += (Number(comp.percentageValue)/100) * employee[0].salaries_info[size-1].lumpySalary ;
      })
      employee[0].deductions_array.map((deduction )=>{
        employee[0].salaries_info[size-1].totalSalary -= Number(deduction.fixedValue) ;
        employee[0].salaries_info[size-1].totalSalary -= Number(( Number(deduction.percentageValue)/100 )* employee[0].salaries_info[size-1].lumpySalary) ;
      })
   
    }

  return res.status(200).json({ success: true, data: employee })
}
