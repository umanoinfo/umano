import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const { method } = req

  const client = await connectToDatabase()

  if (!req.query.q) {
    req.query.q = ''
  }


  // ------------------------------- Token -------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('ViewCME')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  } 

  // ----------------------------- View Companies --------------------------------
  const employees = await client.db().collection('employees').find({
    $and: [ 
      { $or: [{ firstName: { $regex: req.query.q, '$options' : 'i'  } }, { lastName: { $regex: req.query.q , '$options' : 'i'  } }, { idNo: { $regex: req.query.q , '$options' : 'i'  } }] },
      { company_id: myUser.company_id },
      { $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }] }
    ]
  }).toArray();

  let ids  = employees.map((val)=>{
    return String(val._id);
  });
  
  const cme  =await client.db().collection('cme').aggregate(

    [
      {
        $match:{
          $and: [
            {
              employee_id: { $in: ids  }
            }
            ,
            {
              date : {
                $gte: (req.body.from_date ? new Date(req.body.from_date).toISOString(): new Date(0).toISOString()),
                $lte: (req.body.to_date ? new Date(req.body.to_date).toISOString():  new Date().toISOString() )
              }
            }
            ,
            { $or: [ {deleted_at: {$exists: false } } , {deleted_at: null }]  }
            ]
        }
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
  
  let total = new Map() ;
  let name = new Map() ;
  cme.map((val)=>{
    let key = val.employee_info[0]._id.toString() ;
    let amount = total.get(key) || 0;
    total.set(key , amount + Number(val.amount));
    if(!name.get(key))
      name.set(key, {employee:val.employee_info[0].firstName + " " + val.employee_info[0].lastName , type: val.employee_info[0].type  , idNo: val.employee_info[0].idNo} ) ;
  });
  
  let cmes = [] ; 
  for(let key of total){
    key = key[0];
    cmes.push({
      _id: key,
      employee_id: key,
      employee: name.get(key).employee,
      amount: total.get(key),
      type: name.get(key).type,
      idNo: name.get(key).idNo
    });
  }
  
  
  return res.status(200).json({ success: true, data: cmes })
  
}
