import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

// ** Axios Imports
import axios from 'axios'

export default async function handler(req, res) {
  if(req.method != 'POST'){
    return res.status(405).json({success: false , message: 'Method is not allowed'});
  }
  const client = await connectToDatabase()

  // -------------------- Token ----------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('AddPayroll')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // -------------------- Insert ---------------------------------------------

  const payroll = req.body 
  if (!payroll.company_id || !payroll.employee_id || !payroll.idNo) {
    res.status(422).json({
      message: 'Invalid input'
    })
    
    return
  }
  payroll.company_id = myUser.company_id
  payroll.user_id = myUser._id
  payroll.created_at = new Date()

  const newPayroll = await client.db().collection('payrolls').insertOne(payroll)
  const insertedPayroll = await client.db().collection('payrolls').findOne({ _id: newPayroll.insertedId })


  // -------------------- logBook ------------------------------------------

  let log = {
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: 'Payroll',
    Action: 'Add',
    linked_id: insertedPayroll._id ,
    Description: 'Add Payroll for employee (' + payroll.name + ')',
    created_at: new Date()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  return res.status(201).json({ success: true, data: insertedPayroll })
}

//