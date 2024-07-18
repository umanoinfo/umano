import { ObjectId } from 'mongodb'
import { connectToDatabase } from 'src/configs/dbConnect'
import { getToken } from 'next-auth/jwt'

export default async function handler(req, res) {
  const { method } = req
  if(method != 'POST'){
    return res.status(405).json({success: false , message: 'Method is not allowed'});
  }

  //-------------- token ----------
  const client = await connectToDatabase()

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('EditEmployee')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })  
  }   
  const data = req.body ; 
  if(data.action == 'terminate'){
    const employee = await client.db().collection('employees').updateOne({_id: ObjectId(data.employee_id)}, {$set:{
        terminationReason: data.terminationReason,
        terminationDate : data.terminationDate 
    }});

    const positions = await client.db().collection('employeePositions' ).find({employee_id: data.employee_id} ).toArray() ;
    let ids = [ ] ;
    positions?.map((position)=>{
        ids.push ( { _id: position._id })
    });
    if(ids?.length > 0)
        await client.db().collection('employeePositions' ).updateMany({$or: ids  } , {$set:{
            endChangeType: data.terminationReason,
            endChangeDate: data.terminationDate 
        }});

    return res.status(200).json({ success: true, data: 'user terminated successfully' })
  }
  else{
    const employee = await client.db().collection('employees').updateOne({_id: ObjectId(data.employee_id)}, {$set:{
        terminationReason: null,
        terminationDate : null
    }});

    return res.status(200).json({ success: true, data: 'user re-employed successfully' })
    
  }

  
}
