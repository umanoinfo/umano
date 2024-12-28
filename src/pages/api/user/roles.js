
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

  // let roles = await myUser.roles.map(async (roleId)=>{
    
    
  //   return role.title ;
  // });

  let roles = [];
  if(myUser?.roles){
    for(let i =0 ;i < myUser.roles.length ;i++){
      let role = await client.db().collection('roles').findOne({_id: ObjectId(myUser.roles[i])});
      roles.push(role.title);
    }
  }

  
  
  return res.status(200).json({ success: true, data: roles })
}
