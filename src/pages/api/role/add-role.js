import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  if (req.method != 'POST') {
    return res.status(405).json({ success: false, message: 'Method is not allowed' });
  }
  const client = await connectToDatabase()

  // ---------------------------- Token -------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('AdminAddRole')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ---------------- Insert ----------------
  const role = req.body.data
  role.company_id = req.body.user.company_id
  if (!role.title) {
    res.status(422).json({
      message: 'Invalid input'
    })

    return
  }
  if (myUser.email != 'admin@admin.com') {
    role.permissions = role?.permissions?.filter((permission) => {
      return myUser.permissions.includes(permission);
    });
  }
  const newRole = await client.db().collection('roles').insertOne(role)
  const insertedRole = await client.db().collection('roles').findOne({ _id: newRole.insertedId })

  // ---------------- logBook ----------------

  let log = {
    user_id: req.body.user._id,
    Module: 'Role',
    Action: 'Add',
    Description: 'Add role (' + insertedRole.title + ')',
    created_at: new Date().toISOString()()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  return res.status(201).json({ success: true, data: insertedRole })
}

//