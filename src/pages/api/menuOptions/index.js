import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const { method } = req

  const client = await connectToDatabase()

  // ------------------------------- Token -------------------------------------

  const token = await getToken({ req })

  if (!token || !token.email) {

    return res.status(206).json({ success: false, message: 'Not Auth' })

  }

  const myUser = await client.db().collection('users').findOne({ email: token.email })

  if (!myUser || !myUser.permissions) {
    return res.status(206).json({ success: false, message: 'Not Auth' })
  }

  // ------------------------------ Fill View --------------------------------------
  const userDocuments = await client
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
        $lookup: {
          from: 'files',
          let: { id: { $toObjectId: '$_id' } },
          pipeline: [
            { $addFields: { linked_id: { $toObjectId: '$linked_id' } } },
            {
              $match: { $expr: { $eq: ['$linked_id', '$$id'] } }
            },
            { $match: { $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }] } },
          ],
          as: 'files_info'
        }
      },
      {
        $sort: {
          created_at: -1
        }
      }
    ])
    .toArray()

  const options = []

  // -------------------------------- Admin Dashboard -------------------------------------
  let checkPermissions = [];
  if (myUser && myUser.type == 'admin') {
    options.push({ sectionTitle: 'Admin Dashboard' })
  }
  if (myUser && myUser.permissions.includes('AdminViewCompany') && myUser.type == 'admin') {
    options.push({ title: 'Companies', icon: 'mdi:google-circles-extended', path: '/admin-dashboard/company/' })
  }
  if (myUser && myUser.permissions.includes('AdminViewUser') && myUser.type == 'admin') {
    options.push({
      title: 'Users',
      icon: 'mdi:account-outline',
      path: '/admin-dashboard/user/'
    })
  }

  const checkForPermissions = (array, permissions) => {

    return array.map((val) => permissions.includes(val)).filter((val) => val == true).length > 0;
  }

  checkPermissions = ['AdminViewRole', 'AdminViewPermission'];

  if (myUser && myUser.type == 'admin' && checkForPermissions(checkPermissions, myUser.permissions)) {
    let children = [];
    if (myUser.permissions.includes('AdminViewPermission')) {
      children.push({
        title: 'Permissions',
        path: '/admin-dashboard/permission/'
      });
    }
    if (myUser.permissions.includes('AdminViewRole')) {
      children.push({
        title: 'Roles',
        path: '/admin-dashboard/role/'
      });
    }
    options.push({
      title: 'Roles & Permissions',
      icon: 'mdi:shield-outline',
      children: children
    })
  }
  if (myUser && myUser.type == 'admin' && (myUser.permissions.includes('AdminViewDocumentType'))) {
    options.push(
      {
        title: 'Documents',
        icon: 'mdi:checkbox-multiple-blank-outline',
        path: '/admin-dashboard/documents/'
      }
    );

  }
  if (myUser.type == 'admin' && !myUser.company_id) { // if there is no active company you are visiting -> do not show company dashboard
    return res.status(200).json({ success: true, data: options })
  }

  // -------------------------------- Company Dashboard -------------------------------------
  checkPermissions = ['ViewEmployee', 'ViewEmployeeLeave', 'ViewEmployeeReward', 'ViewEmployeeDeduction',
    'ViewCME', 'ViewEvent', 'ViewPayroll', 'ViewPayrollFormula', 'ViewPayrollAllowance', 'ViewPayrollDeduction',
    'ViewAttendance', 'ViewAttendanceShift', 'ViewAttendanceDays', 'ViewForm', 'ViewFormRequest',
    'ViewDepartment', 'ViewDocument', 'ViewMail', 'ViewUser', 'ViewRole', 'ViewCompany', 'ViewDocumentType'
  ];
  if ((myUser && myUser.company_id) || checkForPermissions(checkPermissions, myUser.permissions)) {
    options.push({ sectionTitle: 'Company Dashboard' })
  }

  if (myUser && myUser.permissions.includes('ViewEvent')) {
    options.push({
      title: 'Calender',
      icon: 'mdi-calendar-multiple-check',
      path: '/company-dashboard/calender/'
    })
  }

  if (myUser && (myUser.permissions.includes('ViewDepartment') || myUser.permissions.includes('ViewPosition'))) {
    let children = [];
    if (myUser.permissions.includes('ViewDepartment')) {
      children.push(
        {
          title: 'List',
          path: '/company-dashboard/department/'
        }
      )
      children.push(
        {
          title: 'Structure',
          path: '/company-dashboard/department/organizational-structure/'
        }
      )
    }
    if (myUser.permissions.includes('ViewPosition')) {
      children.push({
        title: 'Positions',
        path: '/company-dashboard/position'
      })
    }
    options.push({
      title: 'Departments',
      icon: 'mdi-view-module',
      children: children
    })
  }
  checkPermissions = ['ViewEmployee', 'ViewEmployeeLeave', 'ViewEmployeeReward', 'ViewEmployeeDeduction', 'ViewCME'];
  if (myUser && checkForPermissions(checkPermissions, myUser.permissions)) {
    let children = [];
    if (myUser && myUser.permissions.includes('ViewEmployee')) {
      children.push({
        title: 'List',
        path: '/company-dashboard/employee/'
      })
    }
    if (myUser && myUser.permissions.includes('ViewEmployeeLeave')) {
      children.push({
        title: 'Leave',
        path: '/company-dashboard/employee/leave/'
      })
    }
    if (myUser && myUser.permissions.includes('ViewEmployeeReward')) {
      children.push({
        title: 'Rewards',
        path: '/company-dashboard/employee/rewards/'
      })
    }
    if (myUser && myUser.permissions.includes('ViewEmployeeDeduction')) {
      children.push({
        title: 'Deductions',
        path: '/company-dashboard/employee/deduction/'
      })
    }
    if (myUser && myUser.permissions.includes('ViewCME')) {
      children.push({
        title: 'CME',
        path: '/company-dashboard/cme/'
      })
    }

    options.push({
      title: 'Employees',
      icon: 'mdi:badge-account-horizontal-outline',
      children: children

    })
  }


  const documents = await client.db().collection('documentTypes')
    .find({
      $or: [{
        company_id: 'general',
        $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }]
      },
      { company_id: myUser.company_id }]
    }).toArray();

  documents.sort((a, b) => {
    if (!a?.order && !b?.order) return 0;
    if (!a?.order) return 1;
    if (!b?.order) return -1;

    return Number(a.order) - Number(b.order);
  });

  if (myUser && (myUser.permissions.includes('ViewDocument'))) {
    documents.map((documentType) => {
      let counter = 0;
      userDocuments.map((userDocument) => {
        if (userDocument?.type?.includes(documentType?.name)) {
          counter++;
        }
      })
      documentType.count = counter;
    })

    const children = documents.map((document) => {
      let title = document.name + (document.count ? (" (" + document.count + ")") : '')

      return { title: title, category: document.category, path: `/company-dashboard/document/category/${document.category}/${document.name}/` }
    });



    options.push({
      title: 'Documents',
      icon: 'mdi:checkbox-multiple-blank-outline',
      children: [
        {
          title: 'Third Party Contracts',
          children: children.filter(val => val.category == 'Third Party Contracts')

        },
        {
          title: 'Entity Documents',
          children: children.filter(val => val.category == 'Entity Documents')

        },
        {
          title: 'Ownership Documents',
          children: children.filter(val => val.category == 'Ownership Documents')

        },
        {
          title: 'Vendors',
          children: children.filter(val => val.category == 'Vendors')
        },
        {
          title: 'All Documents',
          path: '/company-dashboard/document/'
        },
        {
          title: 'All Files',
          path: '/company-dashboard/document/files/'
        }
      ]
    })
  }

  if (myUser && myUser.permissions.includes('ViewVendor')) {
    options.push({
      title: 'Vendors List',
      icon: 'mdi:account-tie-outline',
      path: '/company-dashboard/vendors-list/'
    })
  }

  checkPermissions = ['ViewForm', 'ViewFormRequest']
  if (myUser && checkForPermissions(checkPermissions, myUser.permissions)) {
    let children = [];
    if (myUser.permissions.includes('ViewForm')) {
      children.push({
        title: 'List',
        path: '/company-dashboard/form/'
      })
    }
    if (myUser.permissions.includes('ViewFormRequest')) {
      children.push({
        title: 'Requests',
        path: '/company-dashboard/form-request/'
      })
    }
    options.push({
      title: 'Forms',
      icon: 'ri:input-cursor-move',
      children: children
    })
  }

  checkPermissions = ['ViewAttendance', 'ViewAttendanceShift', 'ViewAttendanceDays'];
  if (myUser && checkForPermissions(checkPermissions, myUser.permissions)) {
    let children = [];
    if (checkForPermissions(['ViewAttendance'], myUser.permissions)) {
      children.push({
        title: 'List',
        path: '/company-dashboard/attendance/list/'
      })
    }
    if (checkForPermissions(['ViewAttendanceDays'], myUser.permissions)) {
      children.push({
        title: 'Days',
        path: '/company-dashboard/attendance/days/'
      })
    }
    if (checkForPermissions(['ViewAttendanceShift'], myUser.permissions)) {
      children.push({
        title: 'Shifts',
        path: '/company-dashboard/attendance/shift/'
      })
    }

    options.push({
      title: 'Attendance',
      icon: 'material-symbols:date-range-outline-rounded',
      children: children
    })
  }
  checkPermissions = ['ViewPayroll', 'ViewPayrollFormula', 'ViewPayrollAllowance', 'ViewPayrollDeduction'];
  if (myUser && checkForPermissions(checkPermissions, myUser.permissions)) {
    let children = [];
    if (checkForPermissions(['ViewPayroll'], myUser.permissions)) {
      children.push({
        title: 'Payroll List',
        path: '/company-dashboard/payroll'
      })
      children.push({
        title: 'Payroll Difference',
        path: '/company-dashboard/payroll/new'
      })
      children.push({
        title: 'End of service',
        path: '/company-dashboard/payroll/endOfService/'
      });
    }
    if (checkForPermissions(['ViewPayrollFormula'], myUser.permissions)) {
      children.push({
        title: 'Salary Formula',
        path: '/company-dashboard/payroll/formula/'
      });
    }
    if (checkForPermissions(['ViewPayrollAllowance'], myUser.permissions)) {
      children.push({
        title: 'Allowances',
        path: '/company-dashboard/payroll/compensation/'
      });
    }
    if (checkForPermissions(['ViewPayrollDeduction'], myUser.permissions)) {
      children.push({
        title: 'Deductions',
        path: '/company-dashboard/payroll/deduction/'
      });
    }
    options.push({
      title: 'Payroll',
      icon: 'mdi:money',
      children: children
    })
  }
  if (myUser && myUser.permissions.includes('ViewMail')) {
    options.push({
      title: 'Mails',
      icon: 'ic:baseline-mail-outline',
      path: '/company-dashboard/mail/'
    })
  }
  if (myUser && myUser.permissions.includes('ViewUser')) {
    options.push({
      title: 'Users',
      icon: 'mdi:account-outline',
      path: '/company-dashboard/user/'
    })
  }
  if (myUser && myUser.permissions.includes('ViewRole')) {
    options.push({
      title: 'Roles',
      icon: 'mdi:shield-outline',
      path: '/company-dashboard/role/'
    })
  }

  // Settings

  if (myUser && myUser.permissions && (myUser.permissions.includes('ViewDocumentType') || myUser.permissions.includes('ViewCompany'))) {
    let children = [];

    if (myUser.permissions.includes('ViewCompany')) {
      children.push({
        title: 'Company',
        path: '/company-dashboard/settings/company/'
      });
    }
    if (myUser.permissions.includes('ViewDocumentType')) {
      children.push({
        title: 'Documents',
        path: '/company-dashboard/settings/document-types/'
      })
    }
    options.push({
      title: 'Settings',
      icon: 'mdi:settings-outline',
      children: children
    })
  }

  return res.status(200).json({ success: true, data: options })

}
