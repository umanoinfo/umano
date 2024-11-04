import { ObjectId } from 'mongodb'
import { connectToDatabase } from 'src/configs/dbConnect'
import { getToken } from 'next-auth/jwt'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('ViewPayroll')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  const {
    query: { id },
    method
  } = req

  // try {

  // ---------------------- Insert -----------------------------
  const year = Number(req.query.year );
  const employee_id = req.query.id ; 
  const fromDate =(year  + '-01-01T00:00:00.000Z' );
  const toDate =  (year  + '-12-31T00:00:00.000Z' );
  console.log(employee_id , year , fromDate )

  let  payrolls = await client
    .db()
    .collection('payrolls')
    .aggregate([
      {
        $match: {
          $and :[
          { fromDate: {$gte: fromDate , $lte:toDate }},
          { employee_id: employee_id},
          { company_id: myUser.company_id },
        ]}
      }
    ])
    .toArray();

    console.log(payrolls);
    payrolls = payrolls.map((payroll)=>{
      payroll.total = payroll.workingHoursDifference
      payroll.employee_no = payroll.idNo ;
      
      return payroll ;
    });


    return res.status(200).json({ success: true, data: payrolls })

}
