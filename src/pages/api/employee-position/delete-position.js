import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  if(req.method != 'POST'){
    return res.status(405).json({success: false , message: 'Method is not allowed'});
  }
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('EditEmployee')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }
  
  // ---------------- Delete --------------------

  const employeePosition = req.body.selectedPosition
  const id = employeePosition._id
  delete employeePosition._id

  const selectedEmployeePosition = await client
    .db()
    .collection('employeePositions')
    .findOne({ _id: ObjectId(id), company_id: myUser.company_id.toString() })
  if(!selectedEmployeePosition){
    return res.status(404).json({success: false, message: 'Employee position not found'});
  }

  if (selectedEmployeePosition && selectedEmployeePosition.deleted_at) {
    const deletePosition = await client
      .db()
      .collection('employeePositions')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: '' } }, { upsert: false })

    // ---------------- logBook ----------------

    let log = {
      user_id: myUser._id,
      company_id: myUser.company_id,
      Module: 'Employee position',
      Action: 'Restore',
      Description: 'Restore employee position (' + selectedEmployeePosition.positionTitle + ')',
      created_at: new Date()
    }
    const newlogBook = await client.db().collection('logBook').insertOne(log)
  } else {
    const deletePosition = await client
      .db()
      .collection('employeePositions')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: new Date() } }, { upsert: false })
    console.log(selectedEmployeePosition.isManager);
    if(selectedEmployeePosition.isManager) {
      console.log('in')
      const department = await client.db().collection('departments').updateOne({_id: ObjectId(selectedEmployeePosition.department_id)} , {$set: {user_id : null }} , {upsert: false });
    }

    // ---------------- logBook ----------------

    let log = {
      user_id: myUser._id,
      company_id: myUser.company_id,
      Module: 'Employee position',
      Action: 'Delete',
      Description: 'Delete employee position (' + selectedEmployeePosition.positionTitle + ')',
      created_at: new Date()
    }
    const newlogBook = await client.db().collection('logBook').insertOne(log)
  }

  return res.status(201).json({ success: true, data: selectedEmployeePosition })
}
