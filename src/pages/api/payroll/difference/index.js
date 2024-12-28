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
  const fromDate =(year  + '-01-01T00:00:00.000Z' );
  const toDate =  (year  + '-12-31T00:00:00.000Z' );

  // console.log(year);

  let  payrolls = await client
    .db()
    .collection('payrolls')
    .aggregate([
      {
        $match: {
          $and :[
          { fromDate: {$gte: fromDate , $lte:toDate }},
          { company_id: myUser.company_id },
        ]}
      }
      ,
      {
        $lookup: {
          from: 'employees',
          let: { employee_id: { $toObjectId: '$employee_id' } },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$employee_id'] } } } , 
            { $match: { $or: [ {deleted_at: {$exists: false } } , {deleted_at: null }]  }},
        ],
          as: 'employee_info'
        }
      }
    ])
    .toArray();

    let payrollsByUser = new Map() ;
    let employeesById = new Map() ; 

    payrolls.map((payroll)=>{
        let key = payroll.idNo  + '_' + payroll.employee_id;
        if(payrollsByUser.has(key)){
            let count = payrollsByUser.get(key);
            count += Number( payroll.workingHoursDifference ) ;
            payrollsByUser.set( key , count  );
        }
        else{
            payrollsByUser.set(key , Number(payroll.workingHoursDifference)) ;
        }
        employeesById.set(payroll.employee_id , payroll.employee_info) ;

    });

   

    payrolls = [] ;
    for(const [key , value ] of payrollsByUser){
        let employee_id = key.split('_')[1]; 
        let employee_no = key.split('_')[0] ;
        payrolls.push({
            employee_id, 
            employee_no,
            total: value ,
            employee_info: employeesById.get(employee_id)
        });
    }


    return res.status(200).json({ success: true, data: payrolls })

}
