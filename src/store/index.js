// ** Toolkit imports
import { configureStore } from '@reduxjs/toolkit'

// ** Reducers
import chat from 'src/store/apps/chat'
import user from 'src/store/apps/user'
import email from 'src/store/apps/email'
import invoice from 'src/store/apps/invoice'
import calendar from 'src/store/apps/calendar'
import permissions from 'src/store/apps/permissions'
import roles from 'src/store/apps/roles'
import company from 'src/store/apps/company'
import companyRole from 'src/store/apps/company-role'
import companyUser from 'src/store/apps/company-user'
import companyDepartment from 'src/store/apps/company-department'
import companyEmployee from 'src/store/apps/companyEmployee'
import employeePosition from 'src/store/apps/employeePosition'
import employeeSalary from 'src/store/apps/employeeSalary'
import employeeDocument from 'src/store/apps/employeeDocument'
import document from 'src/store/apps/document'
import event from 'src/store/apps/event'
import form from 'src/store/apps/form'
import request from 'src/store/apps/request'
import mail from 'src/store/apps/mail'
import salaryFormula from 'src/store/apps/salaryFormula'
import shift from 'src/store/apps/shift'
import compensation from 'src/store/apps/compensation'
import deduction from 'src/store/apps/deduction'
import employeeDeduction from 'src/store/apps/employeeDeduction'
import employeeReward from 'src/store/apps/employeeReward'
import attendance from 'src/store/apps/attendance'
import employeeLeave from 'src/store/apps/employeeLeave'
import payroll from 'src/store/apps/payroll'

export const store = configureStore({
  reducer: {
    user,
    chat,
    email,
    invoice,
    calendar,
    permissions,
    roles,
    company,
    companyRole,
    companyUser,
    companyDepartment,
    companyEmployee,
    employeePosition,
    employeeSalary,
    employeeDocument,
    document,
    event,
    form,
    request,
    mail,
    salaryFormula,
    shift,
    compensation,
    deduction,
    employeeDeduction,
    employeeReward,
    attendance,
    employeeLeave,
    payroll
  }
})
