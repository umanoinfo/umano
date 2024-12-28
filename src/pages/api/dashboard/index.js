import { connectToDatabase } from 'src/configs/dbConnect'
import { getToken } from 'next-auth/jwt'

export default async function handler(req, res) {
  console.log('dashboard',req.user);
  if (!req.query.q) {
    req.query.q = ''
  }
  if (!req.query.documentStatus) {
    req.query.documentStatus = ''
  }

  if (req.query.documentTypes) {
    let arr = req.query.documentTypes.split(',')
    req.query.type = arr
  }
  

  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions ) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  const from3Date =new Date(new Date() - 3 * (1000 * 60 * 60 * 24 ) )
  const to3Date = new Date(new Date()  + 3 * ( 1000 * 60 * 60 * 24 ))
  const from90Date =new Date(new Date() - 30 * (1000 * 60 * 60 * 24  ));

  // --------------------- Post ------------------------------------------

  const employees = await client
    .db()
    .collection('employees')
    .aggregate([
      {
        $match: {
          $and: [
            { company_id: myUser.company_id },
            { $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }] },
          ]
        }
      }
    ])
    .toArray()

    const users = await client
    .db()
    .collection('users')
    .aggregate([
      {
        $match: {
          $and: [
            { company_id: myUser.company_id },
            { $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }] },
            { $or: [{ type : 'employee' } , { type : 'manager'}] }
          ]
        }
      }
    ])
    .toArray()

    const activeUsers = await client
    .db()
    .collection('users')
    .aggregate([
      {
        $match: {
          $and: [
            { company_id: myUser.company_id },
            { $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }] },
            { $or: [{ type : 'employee' } , { type : 'manager'}] },
            { status: 'active'}
          ]
        }
      }
    ])
    .toArray()

    const documents = await client
    .db()
    .collection('documents')
    .aggregate([
      {
        $match: {
          $and: [
            { company_id: myUser.company_id },
            { $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }] }
          ]
        }
      }
    ])
    .toArray()

    const recentDocuments = await client
    .db()
    .collection('documents')
    .aggregate([
      {
        $match: {
          $and: [
            { company_id: myUser.company_id },
            { $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }] }
          ]
        }
      },
      {
        $sort: { updated_at: -1},
      }
    ])
    .limit(10)
    .toArray()

    const expiaryDocuments = await client
    .db()
    .collection('documents')
    .aggregate([
      {
        $match: {
          $and: [
            { company_id: myUser.company_id },
            { expiryDateFlag: {$ne: true} },
            { $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }] },
            {
              expiryDate: {
                $lte: new Date()
              }
            },
          ]
        }
      }
    ])
    .toArray()


    const expiary90Documents = await client
    .db()
    .collection('documents')
    .aggregate([
      {
        $match: {
          $and: [
            { company_id: myUser.company_id },
            { $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }] },
            {
              expiryDate: {
                $lte: new Date(from90Date).toISOString(),
                $gte: new Date().toISOString()
              }
            },
          ]
        }
      }
    ])
    .toArray()


    const expiary30EmployeeDocuments = await client
    .db()
    .collection('employeeDocuments')
    .aggregate([
      {
        $match: {
          $and: [
            { company_id: myUser.company_id },
            { $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }] },
            {
              expiryDate: {
                $lt: new Date(from90Date).toISOString(),
                $gt: new Date().toISOString()
              }
            },
          ]
        }
      },
      {
        $lookup: {
          from: 'employees',
          let: { employee_id: { $toObjectId: '$employee_id' } },
          pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$employee_id'] } } }],
          as: 'employee_info'
        }
      },

    ])
    .toArray()

    const birthdays = await client
    .db()
    .collection('employees')
    .aggregate([
      {
        $match: {
          $and: [
            { company_id: myUser.company_id },
            { $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }] },
            {
              dateOfBirth: {
                $gt: new Date(from3Date).toISOString(),
                $lte: new Date(to3Date).toISOString()
              }
            },
          ]
        }
      }
    ])
    .toArray()

    let data = {}
    data.employees_count = employees.length ;
    data.users_count = users.length ;
    data.active_users_count = activeUsers.length ;
    data.documents_count = documents.length ;
    data.expiaryDocuments_count = expiaryDocuments.length ;
    data.birthdays = birthdays ;
    let documentsExpired = []
    expiary90Documents.map((doc , index)=>{
      let docTemp ={}
      docTemp.id = doc._id ;
      docTemp.icon = 'document'
      docTemp.title = doc.title
      docTemp.version = doc.version
      docTemp.type = doc.type
      docTemp.expiryDate = doc.expiryDate
      docTemp.notifyBefore = doc.notifyBefore
      documentsExpired.push(docTemp)
    })
    expiary30EmployeeDocuments.map((doc , index)=>{
      let docTemp ={}
      docTemp.id = doc._id ;
      docTemp.icon = 'employee'
      docTemp.title = doc.documentTitle
      docTemp.version = doc.documentNo
      docTemp.type = [doc.employee_info[0].firstName +' '+doc.employee_info[0].lastName] 
      docTemp.expiryDate = doc.expiryDate
      docTemp.notifyBefore = doc.notifyBefore
      documentsExpired.push(docTemp)
    })
    console.log(expiary90Documents , myUser.company_id)

    data.documentsExpired = documentsExpired
    let index = 1;
    data.recentDocuments = recentDocuments.map((document)=>{
      document.id = index++ ; 
      
      return document ;
    });
    
return res.status(200).json({ success: true, data })
  
}
