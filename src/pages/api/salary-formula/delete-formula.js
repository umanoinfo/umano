import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  if (req.method != 'POST') {
    return res.status(405).json({ success: false, message: 'Method is not allowed' });
  }
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('DeletePayrollFormula')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ---------------- Delete --------------------

  const formula = req.body.selectedFormula
  const id = formula._id
  delete formula._id

  const selectedFormula = await client
    .db()
    .collection('salaryFormula')
    .findOne({ _id: ObjectId(id), company_id: myUser.company_id.toString() })

  if (!selectedFormula) {
    return res.status(404).json({ success: false, message: 'Payroll not found' });
  }

  if (selectedFormula && selectedFormula.deleted_at) {
    const deleteFormula = await client
      .db()
      .collection('salaryFormula')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: '' } }, { upsert: false })

    // ---------------- logBook ----------------

    let log = {
      user_id: myUser._id,
      company_id: myUser.company_id,
      Module: 'Salary Formula',
      Action: 'Restore',
      Description: 'Restore salary formula (' + selectedFormula.title + ')',
      created_at: new Date().toISOString()()
    }
    const newlogBook = await client.db().collection('logBook').insertOne(log)
  } else {
    const deleteFormula = await client
      .db()
      .collection('salaryFormula')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: new Date() } }, { upsert: false })
    await client.db().collection('employees').updateMany({ salary_formula_id: id }, { $set: { salary_formula_id: null } });

    // ---------------- logBook ----------------

    let log = {
      user_id: myUser._id,
      company_id: myUser.company_id,
      Module: 'Salary Formula',
      Action: 'Delete',
      Description: 'Delete salary formula (' + selectedFormula.title + ')',
      created_at: new Date().toISOString()()
    }
    const newlogBook = await client.db().collection('logBook').insertOne(log)
  }

  return res.status(201).json({ success: true, data: selectedFormula })
}
