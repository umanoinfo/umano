import { ObjectId } from 'mongodb'
import { connectToDatabase } from 'src/configs/dbConnect'
import { getToken } from 'next-auth/jwt'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  const {
    query: { id },
    method
  } = req

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('ViewAttendanceDays')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  let company = await client
    .db()
    .collection('companies')
    .findOne({
        _id: ObjectId(myUser.company_id)
    })
  let working_days = company.working_days   ;
  let holidays = company.holidays ;
  company = {
    working_days,
    holidays
  }

  return res.status(200).json({ success: true, data: [company] })
}
