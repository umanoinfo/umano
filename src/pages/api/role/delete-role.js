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
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('AdminDeleteRole')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ---------------- Delete --------------------

  const role = req.body.selectedRole

  const id = role._id
  delete role._id

  const selectedRole = await client
    .db()
    .collection('roles')
    .findOne({ _id: ObjectId(id) })

  if (!selectedRole) {
    return res.status(404).json({ success: false, message: 'role not found' });
  }
  const operation = (selectedRole.deleted_at ? 'delete' : 'restore');
  if (selectedRole && selectedRole.deleted_at) {
    const deletRole = await client
      .db()
      .collection('roles')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: '' } }, { upsert: false })

    // ---------------- logBook ----------------

    let log = {
      user_id: req.body.user._id,
      Module: 'Role',
      Action: 'Delete',
      Description: 'Restore role (' + selectedRole.title + ')',
      created_at: new Date().toISOString()()
    }
    const newlogBook = await client.db().collection('logBook').insertOne(log)
  } else {
    const deletRole = await client
      .db()
      .collection('roles')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: new Date() } }, { upsert: false })

    // ---------------- logBook ----------------

    let log = {
      user_id: req.body.user._id,
      Module: 'Role',
      Action: 'Delete',
      Description: 'Delete role (' + selectedRole.title + ')',
      created_at: new Date().toISOString()()
    }
    const newlogBook = await client.db().collection('logBook').insertOne(log)
  }


  // --- deleting that role form users ---------

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
  if (operation == 'delete') {

    for (const user of users) {
      // deleting that role from roles list.

      var index = user.roles.indexOf(id)
      user.roles.splice(index, 1)



      user.permissions = []
      const user_id = user._id

      // itterating over the rest of roles and adding their permissions to the list.
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

      const updatedUser = await client
        .db()
        .collection('users')
        .updateOne({ _id: ObjectId(user_id) }, { $set: user }, { upsert: false })

      if (user.type != 'admin') {

        /* query roles for that company */
        const roles = await client.db().collection('roles').find({
          company_id: user.company_id, $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }]
        }).toArray();

        /* itterating over all the roles that was created by this manager and removing all permissions that are higher in
         privilages than the updated permissions that are being assigned
        */
        for (let role of roles) {
          const id = role._id;
          delete role._id;
          let permissions = []; // now you are deleting the root role (then -> manager have no permissin & any of his roles/users) ...

          // for(const permission of role.permissions ){
          //   if(updatedRole.permissions.includes(permission)){ // if the new assigned role does have that permission then add it to that role
          //     permissions.push(permission);
          //   }
          // }
          role.permissions = permissions;
          const updated = await client.db().collection('roles').updateOne({ _id: ObjectId(id) }, { $set: role }, { upsert: false });
        }

        /* query users for that company */
        const companyUsers = await client.db().collection('users').find({
          company_id: user.company_id
        }).toArray();

        for (let companyUser of companyUsers) {
          let id = companyUser._id;
          delete companyUser._id;
          let permissions = [];

          /* itterating over the permissions of the users in that company and removing all permissions that are higher in
            privilages than the updated permissions that are being assigned */
          // for(const permission of companyUser.permissions ){
          //   if(updatedRole.permissions.includes(permission)){ // if the new assigned role does have that permission then add it to that user
          //     permissions.push(permission);
          //   }
          // }

          // now you are deleting the root role (then -> manager have no permissin & any of his roles/users) ...
          companyUser.permissions = permissions;

          const updated = await client.db().collection('users').updateOne({ _id: ObjectId(id) }, { $set: companyUser }, { upsert: false });
        }
      }
    }
  }



  return res.status(201).json({ success: true, data: users })
}
