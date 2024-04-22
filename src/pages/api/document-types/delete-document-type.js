import { connectToDatabase } from 'src/configs/dbConnect'
import { getToken } from 'next-auth/jwt'
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if(req.method != 'POST'){
    return res.status(405).json({success: false , message: 'Method is not allowed'});
  }
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------
  const {id} = req.body ;
  if(!id){
    return res.status(401).json({success: false , message : 'Document type ID is required'});
  }
  const token = await getToken({ req })
  
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || (!myUser.permissions.includes('AdminDeleteDocumentType') && !myUser.permissions.includes('DeleteDocumentType'))) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }
  let documentType ;
  let deleted ;
  if(myUser.type == 'admin'){
    documentType = await client.db().collection('documentTypes').findOne({_id: ObjectId(id)});
    if(!documentType){
        return res.status(401).json({success: false , message: 'No document type with this id'});
    }
    let toDelete = (documentType && documentType.deleted_at );
    let date = new Date();
    if(toDelete){
        toDelete = null ;
    }
    else{
        toDelete = date ;
    }
    deleted = await client.db().collection('documentTypes').updateOne({_id: ObjectId(id) } , {$set: {deleted_at: toDelete }} , {upsert:false} );
  }
  else{
    documentType = await client.db().collection('documentTypes').findOne({_id: ObjectId(id) , company_id: myUser.company_id});
    if(!documentType || documentType.company_id == 'general'){
        return res.status(401).json({success: false , message: 'No document type with this id'});
    }
    let toDelete = (documentType && documentType.deleted_at );
    let date = new Date();
    if(toDelete){
        toDelete = null ;
    }
    else{
        toDelete = date ;
    }
    documentType.deleted_at = toDelete ;
    delete documentType._id  ;
    deleted = await client.db().collection('documentTypes').updateOne({_id: ObjectId(id) , company_id: myUser.company_id} , {$set: documentType} , {upsert:false} );
    console.log(deleted);
  }

  const logBook = await client.db().collection('logBook').insertOne({
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: "documentTypes",
    Action:'Delete',
    Description:`Delete Document ${documentType.name}`,
    created_at: new Date(),
  });
  
return res.status(200).json({ success: true, data: deleted })
}
