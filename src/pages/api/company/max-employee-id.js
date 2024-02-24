import { ObjectId } from 'mongodb'
import { connectToDatabase } from 'src/configs/dbConnect'
import { getToken } from 'next-auth/jwt'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  const {
    query: { id },
    method
  } = req


  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })

  const company = await client
  .db()
  .collection('companies')
  .aggregate([
    {
      $match: {
        _id: ObjectId(myUser.company_id)
      }
    },
    {
      $lookup: {
        from: 'employees',
        let: { company_id: { $toString: '$_id' } },
        pipeline: [{ $match: { $expr: { $eq: ['$company_id', '$$company_id'] } } }],
        as: 'employees_info'
      }
    }
  ])
  .toArray()

  const employeesIds  = [] 

  company[0].employees_info.map((emp)=>{
    if(company[0].employeeID){
      const newId = emp.idNo.replace(company[0].employeeID, '');
      employeesIds.push(+newId)
    }
    else{
      employeesIds.push(+emp.idNo)
    }
  })
  console.log(employeesIds)  ;
  res.status(200).json({ 
    success: true, 
    max: employeesIds.sort(function (a, b) {  return a - b;  })[employeesIds.length-1],
    companyEmployeeID : company[0].employeeID
  })
}
