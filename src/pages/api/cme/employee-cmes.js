import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const { method } = req

  const client = await connectToDatabase()
  
  if (!req.query.employee_id) {
    return res.status(400).json({success : false,  message: 'Employee ID is required'});

  }


  // ------------------------------- Token -------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('ViewCME')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  } 

  // ----------------------------- View Companies --------------------------------
  
  const cme  =await client.db().collection('cme').aggregate(
    [
      {
        $match:{
          $and: [
            {
              employee_id: req.query.employee_id,
              company_id: myUser.company_id
            },
            { $or: [ {deleted_at: {$exists: false } } , {deleted_at: null }]  }
            ]
            
        },
        
      },

      {
        $lookup: {
          from: 'employees',
          let: { employee_id: { $toObjectId: '$employee_id' } },
          pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$employee_id'] } } }],
          as: 'employee_info'
        }
      }
      
    ]
  ).toArray();
    
  
  return res.status(200).json({ success: true, data: cme })
  
}
