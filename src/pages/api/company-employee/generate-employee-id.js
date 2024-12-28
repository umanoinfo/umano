
// import { ObjectId } from 'mongodb'
// import { getToken } from 'next-auth/jwt'
// import { connectToDatabase } from 'src/configs/dbConnect'

// export default async function handler(req, res) {
//   const client = await connectToDatabase()

//   // -------------------- Token --------------------------------------------------

//   const token = await getToken({ req })
//   const myUser = await client.db().collection('users').findOne({ email: token.email })
//   if (!myUser || !myUser.permissions || !myUser.permissions.includes('AddEmployee')) {
//     return res.status(401).json({ success: false, message: 'Not Auth' })
//   }
  
//   let employeesCountInCompany = await client.db().collection('employees').countDocuments({company_id: myUser.company_id}) ; 
//   employeesCountInCompany++ ; 
  

//   return res.status(201).json({ success: true, data: insertedEmployee })
// }
