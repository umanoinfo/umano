import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const { method } = req

  const client = await connectToDatabase()

  // ------------------------------- Token -------------------------------------

  const token = await getToken({ req })

  if( !token || !token.email ){

    res.status(401).json({ success: false, message: 'Not Auth' })
  }

  const myUser = await client.db().collection('users').findOne({ email: token.email })

  if (!myUser || !myUser.permissions ) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ------------------------------ Fill View --------------------------------------

  const options = []

  // -------------------------------- Admin Dashboard -------------------------------------

  if (myUser && myUser.type == 'admin') {
    options.push({ sectionTitle: 'Admin Dashboard' })
  }
  if (myUser && myUser.permissions.includes('AdminViewCompany') && myUser.type == 'admin') {
    options.push({ title: 'Companies', icon: 'mdi:google-circles-extended', path: '/admin-dashboard/company' })
  }
  if (myUser && myUser.permissions.includes('AdminViewUser') && myUser.type == 'admin') {
    options.push({
      title: 'Users',
      icon: 'mdi:account-outline',
      path: '/admin-dashboard/user'
    })
  }
  if (myUser &&  myUser.type == 'admin' &&(myUser.permissions.includes('AdminViewRole') || myUser.permissions.includes('AdminViewPermission'))) {
    options.push({
      title: 'Roles & Permissions',
      icon: 'mdi:shield-outline',
      children: [
        {
          title: 'Roles',
          path: '/admin-dashboard/role'
        },
        {
          title: 'Permissions',
          path: '/admin-dashboard/permission'
        }
      ]
    })
  }

  // -------------------------------- Company Dashboard -------------------------------------

  if (myUser && myUser.company_id) {
    options.push({ sectionTitle: 'Company Dashboard' })
  }

  if (myUser && myUser.permissions.includes('ViewEvent')) {
    options.push({
      title: 'Calender',
      icon: 'mdi-calendar-multiple-check',
      path: '/company-dashboard/calender'
    })
  }

  if (myUser && myUser.permissions.includes('ViewDepartment')) {
    options.push({
      title: 'Departments',
      icon: 'mdi-view-module',
      children: [
        {
          title: 'List',
          path: '/company-dashboard/department'
        },
        {
          title: 'Structure',
          path: '/company-dashboard/department/organizational-structure'
        }
      ]
    })
  }
  if (myUser && myUser.permissions.includes('ViewEmployee')) {
    options.push({
      title: 'Employees',
      icon: 'mdi:badge-account-horizontal-outline',

      children: [
        {
          title: 'List',
          path: '/company-dashboard/employee'
        },
        {
          title: 'Leave',
          path: '/company-dashboard/employee/leave/'
        },
        {
          title: 'Deductions',
          path: '/company-dashboard/employee/deduction/'
        },
        {
          title: 'Rewards',
          path: '/company-dashboard/employee/rewards/'
        }
      ]
    })
  }
  if (myUser && myUser.permissions.includes('ViewDocument')) {
    options.push({
      title: 'Documents',
      icon: 'mdi:checkbox-multiple-blank-outline',
      children: [
        {
          title: 'DOH',
          path: '/company-dashboard/document/doh-list'
        },
        {
          title: 'Civil Defense',
          path: '/company-dashboard/document/civil-list'
        },
        {
          title: 'Waste Management',
          path: '/company-dashboard/document/waste-list'
        },
        {
          title: 'MCC',
          path: '/company-dashboard/document/mcc-list'
        },
        {
          title: 'Tasneef',
          path: '/company-dashboard/document/tasneef-list'
        },
        {
          title: 'Oshad',
          path: '/company-dashboard/document/oshad-list'
        },
        {
          title: 'ADHICS',
          path: '/company-dashboard/document/adhics-list'
        },
        {
          title: 'Third Party Contracts',
          path: '/company-dashboard/document/third-list'
        },
        {
          title: 'Others',
          path: '/company-dashboard/document/others'
        },
        {
          title: 'All Documents',
          path: '/company-dashboard/document'
        },
        {
          title: 'All Files',
          path: '/company-dashboard/document/files'
        }
      ]
    })
  }
  if (myUser && myUser.permissions.includes('ViewForm')) {
    options.push({
      title: 'Forms',
      icon: 'ri:input-cursor-move',
      children: [
        {
          title: 'List',
          path: '/company-dashboard/form/'
        },
        {
          title: 'Requests',
          path: '/company-dashboard/form-request/'
        }
      ]
    })
  }
  if (myUser && myUser.permissions.includes('ViewAttendance')) {
    options.push({
      title: 'Attendance',
      icon: 'material-symbols:date-range-outline-rounded',
      children: [
        {
          title: 'List',
          path: '/company-dashboard/attendance/list/'
        },
        {
          title: 'Days',
          path: '/company-dashboard/attendance/days/'
        },
        {
          title: 'Shifts',
          path: '/company-dashboard/attendance/shift/'
        }
      ]
    })
  }
  if (myUser && myUser.permissions.includes('ViewPayroll')) {
    options.push({
      title: 'Payroll',
      icon: 'mdi:money',
      children: [
        {
          title: 'Payroll List',
          path: '/company-dashboard/payroll/'
        },
        {
          title: 'End of service',
          path: '/company-dashboard/payroll/endOfService/'
        },
        {
          title: 'Salary Formula',
          path: '/company-dashboard/payroll/formula/'
        },
        {
          title: 'Compensations',
          path: '/company-dashboard/payroll/compensation/'
        },
        {
          title: 'Deductions',
          path: '/company-dashboard/payroll/deduction/'
        }
      ]
    })
  }
  if (myUser && myUser.permissions.includes('ViewMail')) {
    options.push({
      title: 'Mails',
      icon: 'ic:baseline-mail-outline',
      path: '/company-dashboard/mail'
    })
  }
  if (myUser && myUser.permissions.includes('ViewCompanyUser')) {
    options.push({
      title: 'Users',
      icon: 'mdi:account-outline',
      path: '/company-dashboard/user'
    })
  }
  if (myUser && myUser.permissions.includes('ViewCompanyRole')) {
    options.push({
      title: 'Roles',
      icon: 'mdi:shield-outline',
      path: '/company-dashboard/role'
    })
  }

  res.status(200).json({ success: true, data: options })

}
