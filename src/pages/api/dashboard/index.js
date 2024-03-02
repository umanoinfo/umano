import { connectToDatabase } from 'src/configs/dbConnect'
import { getToken } from 'next-auth/jwt'

export default async function handler(req, res) {
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
  console.log(token);
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions ) {
    res.status(401).json({ success: false, message: 'Not Auth' })

    return ;
  }

  const from3Date =new Date()
  from3Date.setDate(new Date().getDate() - 3);
  const to3Date = new Date()
  to3Date.setDate(new Date().getDate() + 3);
  
  const from30Date =new Date()
  from30Date.setDate(new Date().getDate() - 30);
  const to30Date = new Date()
  to30Date.setDate(new Date().getDate() + 30);

  // --------------------- Post ------------------------------------------

  const employees = await client
    .db()
    .collection('employees')
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

    const users = await client
    .db()
    .collection('users')
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


    const expiary30Documents = await client
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
                $gt: new Date(from30Date)
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
                $gt: new Date(from30Date)
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
                $gt: new Date(from3Date),
                $lte: new Date(to3Date)
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
    data.documents_count = documents.length ;
    data.expiaryDocuments_count = expiaryDocuments.length ;
    data.birthdays = birthdays ;
    let documentsExpired = []
    expiary30Documents.map((doc , index)=>{
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

    data.documentsExpired = documentsExpired

  res.status(200).json({ success: true, data })
  
return ;
}
