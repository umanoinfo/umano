import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // ---------------------------- Token -------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser ) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // -------------------------- View Roles ----------------------------------

  if (!req.query.q) {
    req.query.q = ''
  }

  let roles = myUser.roles.map(async (roleId)=>{
    return await client.db.collection('roles').findOne({_id: ObjectId(roleId)});
  })
  
  return res.status(200).json({ success: true, data: roles })
}
