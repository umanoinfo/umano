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
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('ViewPosition')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // -------------------------- View Roles ----------------------------------
  console.log('innnn', req.body.id);

  const position = await client.db().collection('positions').findOne({
    _id: ObjectId(req.body.id),
    company_id: myUser.company_id
  });
  if (!position) {
    return res.status(404).json({ success: false, message: 'position not found' });
  }
  let log = {};
  if (position.deleted_at) {
    const positions = await client
      .db()
      .collection('positions')
      .updateOne({ _id: ObjectId(req.body.id) }, { $set: { deleted_at: null } });

    log = {
      user_id: myUser.id,
      Module: 'Position',
      Action: 'Restore',
      Description: 'Restore Positoin (' + position.title + ')',
      created_at: new Date()
    }
  }
  else {
    const position = await client.db()
      .collection('positions').
      updateOne({ _id: ObjectId(req.body.id) }, { $set: { deleted_at: new Date() } });

    log = {
      user_id: myUser.id,
      Module: 'Position',
      Action: 'Delete',
      Description: 'Delete Positoin (' + position.title + ')',
      created_at: new Date()
    }
  }


  const newlogBook = await client.db().collection('logBook').insertOne(log)



  return res.status(200).json({ success: true, message: 'success' });
}
