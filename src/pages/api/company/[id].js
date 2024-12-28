import { ObjectId } from 'mongodb'
import { connectToDatabase } from 'src/configs/dbConnect'
import { getToken } from 'next-auth/jwt'

export default async function handler(req, res) {
  const {
    query: { id },
    method
  } = req

  const client = await connectToDatabase()
 

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('AdminViewCompany')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  const company = await client
    .db()
    .collection('companies')
    .aggregate([
      {
        $match: {
          _id: ObjectId(id)
        }
      },
      {
        $lookup: {
          from: 'employees',
          let: { mng_id: { $toObjectId: '$user_id' } },
          pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$mng_id'] } } }],
          as: 'user_info'
        }
      },
      {
        $lookup: {
          from: 'countries',
          let: { contry_id: { $toObjectId: '$country_id' } },
          pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$contry_id'] } } }],
          as: 'country_info'
        }
      }
    ])
    .toArray()

    const employeesCount = await client.db().collection('employees').countDocuments({
      company_id: (id) , 
      $or: [{deleted_at : {$exists: false }} , { deleted_at: null }]
    });

    const usersCount = await client.db().collection('users').countDocuments({
      company_id: (id),
      $or: [{deleted_at : {$exists: false }} , { deleted_at: null }],
      type: {$ne:'admin'}
    }) ;
    console.log(id , employeesCount, usersCount);

  return res.status(200).json({ success: true, data: company , employeesCount , usersCount})
}
