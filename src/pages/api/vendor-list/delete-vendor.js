import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const client = await connectToDatabase()
  if (req.method != 'POST') {
    return res.status(405).json({ success: false, message: 'unsupported method ' });
  }

  // ---------------------------- Token -------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('DeleteVendor')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // -------------------------- Delete Vendor ----------------------------------


  const vendor = await client.db().collection('vendors').findOne({
    _id: ObjectId(req.body.id),
    company_id: myUser.company_id
  });

  if (!vendor) {
    return res.status(404).json({ success: false, message: 'vendor not found' });
  }
  let log = {};
  if (vendor.deleted_at) {
    const deletedVendor = await client
      .db()
      .collection('vendors')
      .updateOne({ _id: ObjectId(req.body.id) }, { $set: { deleted_at: null } });

    log = {
      user_id: myUser.id,
      Module: 'Vendor',
      Action: 'Restore',
      Description: 'Restore Positoin (' + deletedVendor.name + ')',
      created_at: new Date().toISOString()
    }
  }
  else {
    const deletedVendor = await client.db()
      .collection('vendors').
      updateOne({ _id: ObjectId(req.body.id) }, { $set: { deleted_at: new Date() } });

    log = {
      user_id: myUser.id,
      Module: 'Vendor',
      Action: 'Delete',
      Description: 'Delete Vendor (' + deletedVendor.name + ')',
      created_at: new Date().toISOString()
    }
  }


  const newlogBook = await client.db().collection('logBook').insertOne(log)



  return res.status(200).json({ success: true, message: 'success' });
}
