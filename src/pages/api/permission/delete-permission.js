import { ObjectId } from 'mongodb'
import { connectToDatabase } from 'src/configs/dbConnect'
import { getToken } from 'next-auth/jwt'


export default async function handler(req, res) {
  const client = await connectToDatabase()
  
  // ---------------- Token ----------------

  const secret = process.env.NEXT_AUTH_SECRET
  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  
  if (!token) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ---------------- Delete ----------------

  const selectedPermission = req.body.deleteValue

  const id = selectedPermission._id


  
  const permission = await client
    .db()
    .collection('permissions')
    .findOne({ _id: ObjectId(id) })

  // ---------------- logBook ----------------

  let log = {
    user_id: req.body.user._id,
    Module: 'Permission',
    created_at: new Date()
  }

  if (permission?.deleted_at) {
    
    
    const deletPermissions = await client
      .db()
      .collection('permissions')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: null } }, { upsert: false })

    const roles = await client.db().collection('roles').find({permissions:permission.alias}).toArray();
    
    for(let i = 0 ;i < roles.length ;i++){
      let role = roles[i];
      const roleId = ObjectId(role._id).toString() ;
      const users = await client.db().collection('users').find({roles:roleId}).toArray();
      
      for(let j =0 ;j < users.length ;j++){
        let user = users[j] ;
        if(!user.permissions.includes(permission.alias))
          user.permissions.push(permission.alias);
        const userId = user._id ;
        delete user._id ;
        const updatedUser = await client.db().collection('users').replaceOne({_id: userId } , user );
      }
    }

    log.Action= 'Restore';
    log.Description =  'Restore Permission (' + selectedPermission.title + ') from group (' + selectedPermission.group + ')';
  } else {
    

    const deletPermissions = await client
      .db()
      .collection('permissions')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: new Date() } }, { upsert: false })

    const users = await client.db().collection('users').find({permissions: permission?.alias  }).toArray();
    
    users.map(async (user)=>{
      if(user.permissions && Array.isArray(user.permissions) ){
        let idx = user.permissions.indexOf(permission?.alias);
        if(idx > -1 ){
            user.permissions.splice(idx , 1 ) ;
        }
      }
      const userId = user._id ;
      delete user._id ;

      await client.db().collection('users').replaceOne({_id: ObjectId(userId) } , user );
    });
    
    
    
    log.Action = 'Delete';
    log.Description =  'Delete Permission (' + selectedPermission.title + ') from group (' + selectedPermission.group + ')';
  }


  const newlogBook = await client.db().collection('logBook').insertOne(log)

  res.status(200).json({ success: true, data: selectedPermission })
}
