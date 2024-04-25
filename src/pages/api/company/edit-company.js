import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  if(req.method != 'POST'){
    return res.status(405).json({success: false , message: 'Method is not allowed'});
  }
  const client = await connectToDatabase()

  // ------------------------------- Token -------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('AdminEditCompany')  ) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ------------------------------- Edit -------------------------------------

  const company = req.body.data
  const id = company._id
  delete company._id

  if (!company.name) {
    return res.status(422).json({
      message: 'Invalid input'
    })
  }
  const currentCompany = await client.db().collection('companies').findOne({_id: ObjectId(id)});
  if( !currentCompany  ){
    return res.status(404).json({success: false , message: 'Company not found'});
  }
 
  // when done set the (oldCompany.user_id to null)
  const newManager = await client.db().collection('users').findOne({_id: ObjectId(company.user_id)  } );
  if(!newManager){
    return res.status(404).json({success: false, message: 'user not found'});
  }
  if(newManager && newManager?.company_id && newManager?.type == 'manager' && ObjectId(newManager.company_id).toString() != ObjectId(id).toString() ){
      
      return res.status(402).json({
          success: false,
          message:'User is already a manger of another company ( if You want to make him a manager of The current company then assign his company to fake@company.com or new user and try again)'
      });
  }

    // updating old manager info
    const oldManager = await client.db().collection('users').findOne({company_id:id });
    if(oldManager){
      delete oldManager.company_id ;
      const oldManagerId = oldManager._id;
      delete oldManager.company_info;  
      const updatedOldManager = await client.db().collection('users').replaceOne({_id:oldManagerId} , oldManager);
    }
    
  const newCompany = await client
    .db()
    .collection('companies')
    .updateOne({ _id: ObjectId(id) }, { $set: company }, { upsert: false })

 
    // --------------------- Update Manager --------------------------------------
  
    const user = await client
      .db()
      .collection('users')
      .findOne({ _id: ObjectId(company.user_id) })
  
    const user_id = company.user_id
    user.company_id = id
    delete user._id
  
    const newUser = await client
      .db()
      .collection('users')
      .updateOne({ _id: ObjectId(user_id) }, { $set: user }, { upsert: false })

 
  


  // -------------------------- logBook ---------------------------

  let log = {
    user_id: myUser._id,
    company_id: id ,
    Module: 'Company',
    Action: 'Edit',
    Description: 'Edit company (' + company.name + ')',
    created_at: new Date()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  return res.status(201).json({ success: true, data: company })
}
