import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  if(req.method != 'POST'){
    return res.status(405).json({success: false , message: 'Method is not allowed'});
  }
  const client = await connectToDatabase()

  // ------------------------------- Token -------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || ( !myUser.permissions.includes('EditAttendanceDays') )) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ------------------------------- Edit -------------------------------------

  let company = req.body.data
  const id = company._id
  delete company._id
  company = {
    working_days: company.working_days,
    holidays: company.holidays
  };
  console.log(myUser.company_id);
 
  const currentCompany = await client.db().collection('companies').findOne({_id: ObjectId(myUser.company_id) });
  if(!currentCompany){
    return res.status(404).json({success: false, message : 'company not found'});
  }

  const newCompany = await client
    .db()
    .collection('companies')
    .updateOne({ _id: ObjectId(myUser.company_id) }, { $set: company }, { upsert: false })

  //------------------------ Holidy Event -------------------------

  const holidyEvents = await  client.db().collection('events').aggregate(
    [
      {
        $match: {
        company_id:myUser.company_id  ,
        type: 'Holiday'   ,
      }}
    ]).toArray()

    await Promise.all(holidyEvents.map ( async (e)=>{
      await client.db().collection('events').deleteOne( {_id:ObjectId(e._id)})
    }))

    
    if(company.holidays){
        await Promise.all(
            company.holidays.map( async (day)=>{
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
              const newEvent = await client.db().collection('events').insertOne(event)
            })
        )
    }


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

  return res.status(201).json({ success: true, data: company })
}
