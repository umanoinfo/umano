import { connectToDatabase } from 'src/configs/dbConnect'
import { getToken } from 'next-auth/jwt'
import { ObjectId} from 'mongodb'

export default async function handler(req, res) {
  if (!req.query.q) {
    req.query.q = ''
  }

  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('ViewEmployee')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // --------------------- Post ------------------------------------------

  const salaries = await client
    .db()
    .collection('employeeSalaries')
    .aggregate([
      {
        $match: {
          $and: [
            { employee_id: req.query.employeeId },
            { company_id: myUser.company_id },
            { $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }] }
          ]
        }
      },
      {
        $sort: {
          startChangeDate: 1
        }
      }
    ])
    .toArray()

    const employee = await client.db().collection('employees').aggregate([
      {
        $match: {
          $and: [{ _id: ObjectId(req.query.employeeId) }, { company_id: myUser.company_id }]
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
          from: 'deductions',
          let: { deductions: '$deductions' },
          pipeline: [
            { $addFields: { string_id: { $toString: '$_id' } } },
            { $match: { $expr: { $and: [{ $isArray: '$$deductions' }, { $in: ['$string_id', '$$deductions'] }] } } }
          ],
          as: 'deductions_array'
        }
      },
    ]).toArray();
    

    salaries.map((salary , index)=>{
      if(index == 0){
        salary.lumpySalaryPercentageChange = '-' 
        salary.overtimeSalaryPercentageChange = '-' 
      }else{

        let lastLumpySalary = salaries[index-1].lumpySalary
        let lastOvertimeSalary = salaries[index-1].overtimeSalary

        salary.lumpySalaryPercentageChange = (((salary.lumpySalary - lastLumpySalary) / (lastLumpySalary))*100).toFixed(0)
        salary.overtimeSalaryPercentageChange = (((salary.overtimeSalary - lastOvertimeSalary) / lastOvertimeSalary)*100).toFixed(0)
      }
    })

    let size = salaries.length ;
    salaries[size-1].lumpySalary = Number( salaries[size-1].lumpySalary) ;
    salaries[size-1].totalSalary = Number( salaries[size-1].lumpySalary) ;
    employee[0].compensations_array.map((comp)=>{
      if(comp.type == 'Daily')
      {
        comp.fixedValue *= 30;
        comp.percentageValue*= 30 ; 
      }
      salaries[size-1].totalSalary += Number(comp.fixedValue) ;
      salaries[size-1].totalSalary += (Number(comp.percentageValue)/100) * salaries[size-1].lumpySalary ;
    })
    employee[0].deductions_array.map((deduction )=>{
      if(deduction.type == 'Daily')
      {
        deduction.fixedValue *= 30;
        deduction.percentageValue*= 30 ; 
      }
      salaries[size-1].totalSalary -= Number(deduction.fixedValue) ;
      salaries[size-1].totalSalary -= Number(( Number(deduction.percentageValue)/100 )* salaries[size-1].lumpySalary) ;
    })
 


  return res.status(200).json({ success: true, data: salaries })
}
