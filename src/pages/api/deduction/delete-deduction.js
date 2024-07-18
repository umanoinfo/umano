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
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('DeletePayrollDeduction')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ---------------- Delete --------------------

  const deduction = req.body.selectedDeduction
  const id = deduction._id
  delete deduction._id

  const selectedDeduction = await client
    .db()
    .collection('deductions')
    .findOne({ _id: ObjectId(id) , company_id: myUser.company_id.toString()})

  if(!selectedDeduction){
    return res.status(404).json({success: false, message: 'Deduction not found'});
  }

  if (selectedDeduction && selectedDeduction.deleted_at) {
    const deleteDeduction = await client
      .db()
      .collection('deductions')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: '' } }, { upsert: false })

    // ---------------- logBook ----------------

    let log = {
      user_id: myUser._id,
      company_id: myUser.company_id,
      Module: 'Deduction',
      Action: 'Restore',
      Description: 'Restore deduction (' + selectedDeduction.no + ')',
      created_at: new Date()
    }
    const newlogBook = await client.db().collection('logBook').insertOne(log)
  } else {
    const deleteDeduction = await client
      .db()
      .collection('deductions')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: new Date() } }, { upsert: false })
      await client.db().collection('employees').updateMany({ deductions: id  } , { $pull: {deductions: id} });

    // ---------------- logBook ----------------

    let log = {
      user_id: myUser._id,
      company_id: myUser.company_id,
      Module: 'Deduction',
      Action: 'Delete',
      Description: 'Delete deduction (' + selectedDeduction.no + ')',
      created_at: new Date()
    }
    const newlogBook = await client.db().collection('logBook').insertOne(log)
  }

  return res.status(201).json({ success: true, data: selectedDeduction })
}
