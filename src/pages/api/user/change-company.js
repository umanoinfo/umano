import { ObjectId } from 'mongodb'
import { connectToDatabase } from 'src/configs/dbConnect'
import { getToken } from 'next-auth/jwt'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // ---------------------------- Token -------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('AdminVisitCompany')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // --------------------------- Change Password ---------------------------------

  let company ;
  const user = myUser


  if(!req.body.visit){ // loging out of company
    user.company_id = null ; 
    user.company_info = null ; 
  }
  else{
    company = req.body.selectedCompany ;
    user.company_id = company._id
    user.company_info = [company]
  }
  const id = myUser._id
  delete user._id
 

  try {
    
    
    const newUser = await client
      .db()
      .collection('users')
      .updateOne({ _id: ObjectId(id) }, { $set: user }, { upsert: false })

    const updatedUser = await client
      .db()
      .collection('users')
      .findOne({ _id: ObjectId(id) })

    // ---------------- logBook ----------------
    console.log(updatedUser);

    let log = {
      user_id: myUser._id,
      company_id: myUser.company_id,
      Module: 'User',
      Action: `${req.body.visit ? 'visit' : 'leave'} company`,
      Description: `${myUser.name} ${req.body.visit ? 'visited' : 'left'} company with id: ${myUser.company_id}  `,
      created_at: new Date()
    }

    return  res.status(200).json({ success: true, data: user })
  } catch (error) {
    console.log(error);
  
    return  res.status(400).json({ success: false })
  }
}
