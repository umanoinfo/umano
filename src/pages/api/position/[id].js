import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // ---------------------------- Token -------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('ViewPosition')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // -------------------------- View Roles ----------------------------------


  const position = await client
    .db()
    .collection('positions')
    .findOne({
        company_id: myUser.company_id ,
        _id: req.body.id 
    })
    
    if(!position){
        return res.status(404).json({success: false , message : 'position not found'});
    }
    
    return res.status(200).json({ success: true, data: position })
}
