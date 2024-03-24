import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
    if(req.method != 'POST'){
    return res.status(405).json({success: false , message: 'Method is not allowed'});
  }

  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('EditEmployee')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }
  const emp = await client.db().collection('employees').findOne({_id: ObjectId(id) , company_id: myUser.company_id.toString}) ;
  if(!emp){
    return res.status(404).json({success: false, message: 'Employee not found'});

  }

  // ------------------ Edit -------------------

  const employee = req.body.data
  const id = employee._id
  delete employee._id
  employee.dateOfBirth = new Date(employee.dateOfBirth)
  employee.joiningDate = new Date(employee.joiningDate)

  if (!employee.firstName || !employee.lastName) {
    return res.status(422).json({
      message: 'Invalid input'
    })
  }

  const updatEmployee = await client
    .db()
    .collection('employees')
    .updateOne({ _id: ObjectId(id) , company_id: myUser.company_id.toString()}, { $set: employee }, { upsert: false })
    
  const getEmployee = await client
    .db()
    .collection('employees')
    .findOne({ _id: ObjectId(id) })

  // ------------------ logBook -------------------

  let log = {
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: 'Employee',
    Action: 'Edit',
    Description: 'Edit employee (' + getEmployee.firstName + ' ' + getEmployee.lastName + ')',
    created_at: new Date()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  return res.status(201).json({ success: true, data: getEmployee })
}
