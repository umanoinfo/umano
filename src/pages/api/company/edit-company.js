import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // ------------------------------- Token -------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('AdminEditCompany')) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ------------------------------- Edit -------------------------------------

  const company = req.body.data
  const id = company._id
  delete company._id

  if (!company.name) {
    res.status(422).json({
      message: 'Invalid input'
    })

    return
  }
  
  // when done set the (oldCompany.user_id to null)
  
  const newManager = await client.db().collection('users').findOne({_id: ObjectId(company.user_id) , type:'manager' , company_id: {$exists:true}} );
  if(newManager){
    return res.status(402).json({
      success: false,
      message:'User is already a manger of another company ( if You want to make him a manager of The current company then assign his company to admin or new user and try again)'
    });
  }

  // updating old manager info
  const oldManager = await client.db().collection('users').findOne({company_id:id , type:'manager'});
  
  if(oldManager){
    delete oldManager.company_id ;
    const oldManagerId = oldManager._id;
    delete oldManager.company_info;  
    const updatedOldManager = await client.db().collection('users').replaceOne({_id:oldManagerId} , oldManager);
  }

  const newCompany = await client
    .db()
    .collection('companies')
    .updateOne({ _id: ObjectId(id) }, { $set: company }, { upsert: false })

  // --------------------- Update Manager --------------------------------------

  const user = await client
    .db()
    .collection('users')
    .findOne({ _id: ObjectId(company.user_id) })

  const user_id = company.user_id
  user.company_id = id
  delete user._id

  const newUser = await client
    .db()
    .collection('users')
    .updateOne({ _id: ObjectId(user_id) }, { $set: user }, { upsert: false })

  

  //------------------------ Holidy Event -------------------------

  const holidyEvents = await  client.db().collection('events').aggregate(
    [
      {$match: {
        company_id: { $regex: myUser.company_id } ,
        type: { $regex: 'Holiday' } ,
      }}
    ]).toArray()
    holidyEvents.map ( async (e)=>{
      await client.db().collection('events').deleteOne( {_id:ObjectId(e._id)})
    })

    
    if(company.holidays)
      company.holidays.map((day)=>{
        let event ={}
        event.title = day.name
        event.allDay = true
        event.description = day.name
        event.startDate = new Date (day.date)
        event.endDate = new Date (day.date)
        event.type = 'Holiday'
        event.users = []
        event.status = 'active'
        event.created_at = new Date ()
        event.company_id = myUser.company_id
        event.user_id = myUser._id
        const newEvent = client.db().collection('events').insertOne(event)
      })


  // -------------------------- logBook ---------------------------

  let log = {
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: 'Company',
    Action: 'Edit',
    Description: 'Edit company (' + company.name + ')',
    created_at: new Date()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  res.status(201).json({ success: true, data: company })
}
