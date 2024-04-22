import { connectToDatabase } from 'src/configs/dbConnect'
import { getToken } from 'next-auth/jwt'

export default async function handler(req, res) {
  if(req.method != 'POST'){
    return res.status(405).json({success: false , message: 'Method is not allowed'});
  }
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------
  const documentType = req.body.data ;

  if(!documentType.name || !documentType.category )
  {
    return res.status(401).json({success: false , message : 'Both name & category are required'});
  }

  const token = await getToken({ req })
  
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  
  if (!myUser || !myUser.permissions || (!myUser.permissions.includes('AdminAddDocumentType') && !myUser.permissions.includes('AddDocumentType') ) ) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  let insertedDocument ;

  if(myUser.type == 'admin'){
    insertedDocument = await client.db().collection('documentTypes').insertOne({company_id:'general' , category: documentType.category , name:documentType.name });
  }
  else{
    insertedDocument = await client.db().collection('documentTypes').insertOne({company_id: myUser.company_id  , category: documentType.category , name : documentType.name}) ;
  }

  const logBook = await client.db().collection('logBook').insertOne({
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: "documentTypes",
    Action:'Add',
    Description:`Add Document ${documentType.name}`,
    created_at: new Date(),
  });
  
return res.status(200).json({ success: true, data: insertedDocument })
}
