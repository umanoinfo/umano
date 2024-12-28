import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  console.log(req.query.id)

  const {
    query: { id }
  } = req
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('AdminEditCompany')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  //   ---------------------------------------------------------------

  const subscriptions = await client.db().collection('subscriptions').findOne({ _id: ObjectId(id)  })

  return res.status(200).json({ success: true, data: subscriptions })
}
