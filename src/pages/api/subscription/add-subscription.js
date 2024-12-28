import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  if (req.method != 'POST') {
    return res.status(405).json({ success: false, message: 'Method is not allowed' });
  }
  const { method } = req
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('AdminEditCompany')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ------------------ Add Subscription --------------------------------------------

  const subscription = req.body.data
  if (!subscription.company_id || !subscription.start_at || !subscription.end_at || !subscription.availableUsers) {
    return res.status(422).json({
      message: 'Invalid input'
    })
  }
  const usersCount = await client.db().collection('users').countDocuments({ company_id: subscription.company_id, status: 'active', $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }] });
  if (usersCount > subscription.availableUsers) {
    return res.status(400).json({
      success: false, message: `The current active users in that company is (${usersCount}) 
    which excceeds the specified avaiable users value ${subscription.availableUsers} 
    disable/delete some accounts or increase the available users`})
  }
  const newSubscription = await client.db().collection('subscriptions').insertOne(subscription)

  // ------------------ update company  -----------------------------------------

  const company = await client
    .db()
    .collection('companies')
    .findOne({ _id: ObjectId(subscription.company_id) })

  // company.end_at = subscription.end_at

  const newCompany = await client
    .db()
    .collection('companies')
    .updateOne({ _id: ObjectId(company._id) }, { $set: company }, { upsert: false })

  // ------------------ logBook ---------------------------------------------------

  let log = {
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: 'Subscription',
    Action: 'ADD',
    Description: 'ADD Subscription (' + subscription.start_at + ' ' + subscription.end_at + ')',
    created_at: new Date().toISOString()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  const insertedSubscription = await client
    .db()
    .collection('subscriptions')
    .findOne({ _id: newSubscription.insertedId })

  return res.status(201).json({ success: true, data: insertedSubscription })
}

//