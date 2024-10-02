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
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('AdminEditRole')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ------------------ Edit -------------------

  const role = req.body.data
  const id = role._id
  delete role._id

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

  const newRole = await client
    .db()
    .collection('roles')
    .updateOne({ _id: ObjectId(id) }, { $set: role }, { upsert: false })

  const updatedRole = await client
    .db()
    .collection('roles')
    .findOne({ _id: ObjectId(id) })

  const users = await client
    .db()
    .collection('users')
    .aggregate([
      {
        $match: {
          roles: { $elemMatch: { $eq: id } }
        }
      }
    ])
    .toArray()

  console.log(id, users);

  // deleting permissions 
  for (const user of users) {
    user.permissions = []
    const user_id = user._id

    // itterating over the updated roles of that user and adding them to his list of permissions.
    for (const role_id of user.roles) {
      const selectedRole = await client
        .db()
        .collection('roles')
        .findOne({ _id: ObjectId(role_id) })

      if (selectedRole && selectedRole.permissions) {
        for (const permission of selectedRole.permissions) {
          if (!user.permissions.includes(permission)) {
            user.permissions.push(permission)
          }
        }
      }
    }

    delete user._id

    // updating the permissions list
    const updatedUser = await client
      .db()
      .collection('users')
      .updateOne({ _id: ObjectId(user_id) }, { $set: user }, { upsert: false })
    if (user.type != 'admin') {
      /* query roles for that company */
      const roles = await client.db().collection('roles').find({
        company_id: user.company_id
      }).toArray();

      /* itterating over all the roles that was created by this manager and removing all permissions that are higher in
       privilages than the updated permissions that are being assigned
      */
      for (let role of roles) {
        const id = role._id;
        delete role._id;
        let permissions = [];
        for (const permission of role.permissions) {
          if (updatedRole.permissions.includes(permission)) { // if the new assigned role does have that permission then add it to that role
            permissions.push(permission);
          }
        }
        role.permissions = permissions;
        const updated = await client.db().collection('roles').updateOne({ _id: ObjectId(id) }, { $set: role }, { upsert: false });
      }

      /* query users for that company */
      const companyUsers = await client.db().collection('users').find({
        company_id: user.company_id
      }).toArray();

      for (let companyUser of companyUsers) {
        if (companyUser._id == myUser._id || myUser.type == 'admin') continue;
        let id = companyUser._id;
        delete companyUser._id;
        let permissions = [];

        /* itterating over the permissions of the users in that company and removing all permissions that are higher in
          privilages than the updated permissions that are being assigned */
        for (const permission of companyUser.permissions) {
          if (updatedRole.permissions.includes(permission)) { // if the new assigned role does have that permission then add it to that user
            permissions.push(permission);
          }
        }
        companyUser.permissions = permissions;

        const updated = await client.db().collection('users').updateOne({ _id: ObjectId(id) }, { $set: companyUser }, { upsert: false });
      }
    }
  }

  // ---------------- logBook ----------------

  let log = {
    user_id: req.body.user._id,
    Module: 'Role',
    Action: 'Edit',
    Description: 'Edit role (' + role.title + ')',
    created_at: new Date().toISOString()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  return res.status(201).json({ success: true, data: users })
}
