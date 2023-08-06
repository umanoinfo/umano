import { ObjectId } from 'mongodb'
import { connectToDatabase } from 'src/configs/dbConnect'
import { getToken } from 'next-auth/jwt'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('ViewPayroll')) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }

  const {
    query: { id },
    method
  } = req

  // try {

  // ---------------------- Insert -----------------------------

  const payroll = await client
    .db()
    .collection('payrolls')
    .aggregate([
      {
        $match: {
          $and :[
          {_id: ObjectId(id)},
          { company_id: myUser.company_id },
        ]}
      }
    ])
    .toArray()

  res.status(200).json({ success: true, data: payroll })

}
