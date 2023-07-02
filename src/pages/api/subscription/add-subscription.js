import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const { method } = req
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('ViewRole')) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ------------------ Add Subscription --------------------------------------------

  const subscription = req.body.data
  if (!subscription.company_id || !subscription.start_at || !subscription.end_at || !subscription.availableUsers) {
    res.status(422).json({
      message: 'Invalid input'
    })
    
    return
  }
  const newSubscription = await client.db().collection('subscriptions').insertOne(subscription)

  // ------------------ update company  -----------------------------------------

  const company = await client
    .db()
    .collection('companies')
    .findOne({ _id: ObjectId(subscription.company_id) })

  company.end_at = subscription.end_at

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
    created_at: new Date()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  const insertedSubscription = await client
    .db()
    .collection('subscriptions')
    .findOne({ _id: newSubscription.insertedId })

  res.status(201).json({ success: true, data: insertedSubscription })
}
