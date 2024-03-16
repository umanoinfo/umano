import { connectToDatabase } from 'src/configs/dbConnect'
import { getToken } from 'next-auth/jwt'

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



  return res.status(200).json({ success: true, data: salaries })
}
