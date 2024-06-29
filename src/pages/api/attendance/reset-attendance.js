import { connectToDatabase } from 'src/configs/dbConnect'
import { getToken } from 'next-auth/jwt'
import { ObjectId } from 'mongodb'

export default async function handler(req, res) {
  if(req.method != 'POST' ){
    return res.status(405).json({success: false , message: 'Method is not allowed'});

  }
  const client = await connectToDatabase()

    

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('EditAttendance')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // --------------------- Post ---------------------------------------------------
  
  const att = await client.db().collection('attendances').findOne({_id: ObjectId( req.body.id ) });
  
  console.log(att);

  // return res.json(['d']);
   
  let employee = await client.db().collection('employees').aggregate([
    {
        $match: {_id: ObjectId(att?.employee_id)}
    },
    {
        $lookup: {
          from: 'shifts',
          let: { shift_id: { $toObjectId: '$shift_id' } },
          pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$shift_id'] } } }],
          as: 'shift_info'
        }
      },
    ]).toArray();
  if(!employee?.[0] ){
    return res.status(404).json({success:false,'message' : 'not found'});
  }
  
  employee = employee[0] ;
  console.log(employee);

  if(employee?.shift_info?.[0]?.times?.[0]){
    const updated = await client.db().collection('attendances').updateOne({_id: att._id } , 
        {$set: {timeIn: employee.shift_info[0].times[0].timeIn , timeOut: employee.shift_info[0].times[0].timeOut }  } , {$upsert:false });      
  }
  else{
    const timeIn = new Date('2000-01-01 ' + '08:00' + ' UTC').toISOString().substr(11, 8)
    const timeOut = new Date('2000-01-01 ' + '14:00' + ' UTC').toISOString().substr(11, 8)

    const updated = await client.db().collection('attendances').updateOne({_id: att._id } , 
        {$set: {timeIn: timeIn , timeOut: timeOut }  } , {$upsert:false });
  }
      


    return res.status(200).json({ success: true, data: []  });
}
