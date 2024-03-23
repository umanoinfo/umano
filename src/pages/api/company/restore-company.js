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
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('AdminDeleteCompany')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ------------------------------- Restore -------------------------------------

  const { id  } = req.body
  
  if (!id) {
    return res.status(422).json({
      success: false,
      message: 'Invalid input'
    })
  }
  
    const company = {
        deleted_at: null 
    };

  const newCompany = await client
    .db()
    .collection('companies')
    .updateOne({ _id: ObjectId(id)  }, { $set: company }, { upsert: false })

    

  // -------------------------- logBook ---------------------------

  let log = {
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: 'Company',
    Action: 'Restore',
    Description: 'Restore company with id (' + id + ')',
    created_at: new Date()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  return res.status(200).json({ success: true, message: 'sucess' })
}
