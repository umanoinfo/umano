import { connectToDatabase } from 'src/configs/dbConnect'
import { getToken } from 'next-auth/jwt'
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if(req.method != 'POST'){
    return res.status(405).json({success: false , message: 'Method is not allowed'});
  }
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------
  const documentType = req.body.data ;

  if(!documentType._id || !documentType.name || !documentType.category )
  {
    return res.status(401).json({success: false , message : 'Both id & name & category are required fields'});
  }

  const token = await getToken({ req })
  
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || (!myUser.permissions.includes('AdminEditDocumentType') && !myUser.permissions.includes('EditDocumentType'))) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  const document = await client.db().collection('documentTypes').findOne({_id: ObjectId(documentType._id)});
  
  if(!document ){
    return res.status(401).json({success:false , message : 'No Document Type with this id'});
  }
  if(document.name == documentType.name && document.category == documentType.category ){
    return res.status(401).json({sucess:false,  message: 'document type with the same name already exists'})
  }
  if(myUser.type != 'admin' && document.company_id.toString() != myUser.company_id.toString() ){
    return res.status(403).json({success:false , message : 'You do not have the enough permissions to do this operation'});
  }


  let updated ;
  const id = documentType._id ;
  delete documentType._id;
  if(myUser.type == 'admin'){
    updated = await client.db().collection('documentTypes').updateOne({_id: ObjectId(id)} , {$set: documentType});
  }
  else{
    updated = await client.db().collection('documentTypes').updateOne({_id: ObjectId(id) , company_id: myUser.company_id} , {$set: documentType});
  }

  const logBook = await client.db().collection('logBook').insertOne({
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: "documentTypes",
    Action:'Edit',
    Description:`Edit Document ${documentType.name}`,
    created_at: new Date(),
  });

  return res.status(200).json({ success: true, data: documentType })
}
