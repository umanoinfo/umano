// ** React Imports
import { useState, useEffect, useCallback, createRef, Fragment } from 'react'

// ** Next Imports
import Link from 'next/link'

import * as XLSX from 'xlsx'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Menu from '@mui/material/Menu'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import { DataGrid } from '@mui/x-data-grid'
import { styled } from '@mui/material/styles'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContentText from '@mui/material/DialogContentText'
import toast from 'react-hot-toast'
import Loading from 'src/views/loading'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Custom Components Imports
import CustomChip from 'src/@core/components/mui/chip'
import Preview from './preview/Preview'

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials'

import { fetchData } from 'src/store/apps/attendance'

// ** Actions Imports
import { FormType } from 'src/local-db'

// ** Third Party Components
import axios from 'axios'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import NoPermission from 'src/views/noPermission'
import { right } from '@popperjs/core'
import { Breadcrumbs, List, ListItem, ListItemSecondaryAction, ListItemText, useMediaQuery } from '@mui/material'
import DialogEditAttendance from './../attendance/list/edit-attendance-dialog'
import { DatePicker, Input, SelectPicker } from 'rsuite'

// ** Status Obj

const StatusObj = {
  active: 'success',
  pending: 'warning',
  blocked: 'error'
}

// ** Day Color

const dayColor = days => {
  if (days > 30) {
    return 'success'
  }
  if (days < 30 && days > 6) {
    return 'warning'
  }
  if (days <= 5) {
    return 'error'
  }
}

const AllDocumentsList = () => {
  // ** State
  const [employeeType, setEmployeeType] = useState('')
  const [value, setValue] = useState('')
  const [type, setType] = useState('')

  const [pageSize, setPageSize] = useState(10)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedEmployee, setSelectedEmployee] = useState()
  const { data: session, status } = useSession()

  const myRef = createRef()

  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [SelectedEditRow, setSelectedEditRow] = useState()

  const [fromDate, setFromDate] = useState(new Date())
  const [toDate, setToDate] = useState(new Date())

  const [employeesList, setEmployeesList] = useState([])

  // ** Hooks

  const [openExcel, setOpenExcel] = useState(false)
  const [Unvalid, setUnvalid] = useState([])
  const [update, setupdate] = useState(new Date())
  const [employeesDataSource, setEmployeesDataSource] = useState([])
  const [attendances, setAttendances] = useState([])
  const [employeesFullInfo, setEmployeesFullInfo] = useState([])
  const router = useRouter()

  const dispatch = useDispatch()
  const store = useSelector(state => state.attendance)

  useEffect(() => {
    getEmployees(),
      dispatch(
        fetchData({
          fromDate: fromDate,
          toDate: toDate,
          employee_no: value
        })
      ).then(setLoading(false))
  }, [dispatch, fromDate, toDate, value])

  //   ----------------------------------------------------------------------------------

  const calcLeaves = employee => {
    employee = {
      ...employee,
      takenJustifiedLeaves: 0,
      takenNotJustifiedLeaves: 0,
      takenSickLeaves: 0
    }
    const leaves = employee.leaves_info

    const range1 = employee.shift_info[0].times.map(time => {
      return { start: time.timeIn, end: time.timeOut }
    })
    const rangeJustified = []
    const rangeNotJustified = []
    const rangeSick = []

    const justified = calcDeffTime(
      leaves.filter(val => {
        return val.status_reason == 'justified'
      })
    ).map(val => {
      if (val.type == 'daily') {
        employee.takenJustifiedLeaves += val.leave_value

        return val
      } else {
        rangeJustified.push({ start: val.date_from.substring(11, 16), end: val.date_to.substring(11, 16) })

        return val
      }
    })

    const notJustified = calcDeffTime(
      leaves.filter(val => {
        return val.status_reason == 'notJustified'
      })
    ).map(val => {
      if (val.type == 'daily') {
        employee.takenNotJustifiedLeaves += val.leave_value

        return val
      } else {
        rangeNotJustified.push({ start: val.date_from.substring(11, 16), end: val.date_to.substring(11, 16) })

        return val
      }
    })

    const sick = calcDeffTime(
      leaves.filter(val => {
        return val.status_reason == 'sick'
      })
    ).map(val => {
      if (val.type == 'daily') {
        employee.takenSickLeaves += val.leave_value

        return val
      } else {
        rangeSick.push({ start: val.date_from.substring(11, 16), end: val.date_to.substring(11, 16) })

        return val
      }
    })

    const totalMinutes = range1.reduce((acc, cu) => {
      return acc + (convertToMinutes(cu.end) - convertToMinutes(cu.start))
    }, 0)

    employee.takenJustifiedLeaves += +(
      1 -
      (totalMinutes - calculateIntersectionValue(range1, rangeJustified)) / totalMinutes
    ).toFixed(2)
    employee.takenNotJustifiedLeaves += +(
      1 -
      (totalMinutes - calculateIntersectionValue(range1, rangeNotJustified)) / totalMinutes
    ).toFixed(2)

    employee.takenSickLeaves += +(
      1 -
      (totalMinutes - calculateIntersectionValue(range1, rangeSick)) / totalMinutes
    ).toFixed(2)

    return employee
  }

  // ------------------------------- Get Employees --------------------------------------

  const getEmployees = () => {
    axios.get('/api/company-employee', {}).then(res => {
      let arr = []
      let employees = res.data.data
      employees.map(employee => {
        if (employee.shift_info[0]) {
        arr.push({
          label: employee.firstName + ' ' + employee.lastName + ' (' + employee.email + ')',
          value: employee._id
        })
        }
      })
      setEmployeesDataSource(arr)
      setEmployeesFullInfo(employees)

    })
    setLoading(false)
  }

  function convertToMinutes(timeString) {
    const [hours, minutes] = timeString.split(':')

    return parseInt(hours) * 60 + parseInt(minutes)
  }


  const calcDeffTime = val => {
   
    return val.map(val => {
      if (val.type == 'daily') {
        const diffTime = Math.abs(new Date(val.date_to) - new Date(val.date_from))
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        
        return { ...val, leave_value: diffDays }
      } else {
        const diffTime = Math.abs(new Date(val.date_to) - new Date(val.date_from))
        const diffDays = Math.ceil(diffTime / (1000 * 60))

        return { ...val, leave_value: diffDays }
      }
    })
  }

  function calculateIntersectionValue(timeRanges1, timeRanges2) {

    let totalIntersection = 0

    for (let i = 0; i < timeRanges1.length; i++) {
      const range1 = timeRanges1[i]
      const start1 = convertToMinutes(range1.start)
      const end1 = convertToMinutes(range1.end)

      for (let j = 0; j < timeRanges2.length; j++) {
        const range2 = timeRanges2[j]
        const start2 = convertToMinutes(range2.start)
        const end2 = convertToMinutes(range2.end)

        const start = Math.max(start1, start2)
        const end = Math.min(end1, end2)

        const intersection = Math.max(0, end - start)
        totalIntersection += intersection
      }
    }

    return totalIntersection
  }

    const calcTakenLeaves = employee => {
      employee = {
        ...employee,
        takenPaidLeaves: 0,
        takenUnpaidLeaves: 0,
        takenSickLeaves: 0,
        takenMaternityLeaves: 0,
        takenParentalLeaves: 0,
        takenOthers: 0
      }
      const leaves = employee.all_leaves_info
      
      const range1 = employee.shift_info[0].times.map(time => {
        return { start: time.timeIn, end: time.timeOut }
      })
  
  
      const rangePaidLeave = []
      const rangeUnpaidLeave = []
      const rangeSick = []
      const rangeMaternityLeave = []
      const rangeParentalLeave = []
      const rangeOthers = []
  
      // Paid Leave
  
      const paidLeave = calcDeffTime(
        leaves.filter(val => {
          return val.status_reason == 'paidLeave'
        })
      ).map(val => {
        if (val.type == 'daily') {
          employee.takenPaidLeaves += val.leave_value
  
          return val
        } else {
          rangePaidLeave.push({ start: val.date_from.substring(11, 16), end: val.date_to.substring(11, 16) })
  
          return val
        }
      })
  
      let totalMinutes = range1.reduce((acc, cu) => {
        return acc + (convertToMinutes(cu.end) - convertToMinutes(cu.start))
      }, 0)
  
      employee.takenPaidLeaves += +(
        1 -
        (totalMinutes - calculateIntersectionValue(range1, rangePaidLeave)) / totalMinutes
      ).toFixed(2)
  
      // Unpaid Leave
  
      const unpaidLeave = calcDeffTime(
        leaves.filter(val => {
          return val.status_reason == 'unpaidLeave'
        })
      ).map(val => {
        if (val.type == 'daily') {
          employee.takenUnpaidLeaves += val.leave_value
  
          return val
        } else {
          rangeUnpaidLeave.push({ start: val.date_from.substring(11, 16), end: val.date_to.substring(11, 16) })
  
          return val
        }
      })
      totalMinutes = range1.reduce((acc, cu) => {
        return acc + (convertToMinutes(cu.end) - convertToMinutes(cu.start))
      }, 0)
      employee.takenUnpaidLeaves += +(
        1 -
        (totalMinutes - calculateIntersectionValue(range1, rangeUnpaidLeave)) / totalMinutes
      ).toFixed(2)
  
      // Sick Leave
  
      const sickLeave = calcDeffTime(
        leaves.filter(val => {
          return val.status_reason == 'sickLeave'
        })
      ).map(val => {
        if (val.type == 'daily') {
          employee.takenSickLeaves += val.leave_value
  
          return val
        } else {
          rangeSick.push({ start: val.date_from.substring(11, 16), end: val.date_to.substring(11, 16) })
  
          return val
        }
      })
      totalMinutes = range1.reduce((acc, cu) => {
        return acc + (convertToMinutes(cu.end) - convertToMinutes(cu.start))
      }, 0)
      employee.takenSickLeaves += +(
        1 -
        (totalMinutes - calculateIntersectionValue(range1, rangeSick)) / totalMinutes
      ).toFixed(2)
  
      // Maternity Leave
  
      const maternityLeave = calcDeffTime(
        leaves.filter(val => {
          return val.status_reason == 'maternityLeave'
        })
      ).map(val => {
        if (val.type == 'daily') {
          employee.takenMaternityLeaves += val.leave_value
  
          return val
        } else {
          rangeMaternityLeave.push({ start: val.date_from.substring(11, 16), end: val.date_to.substring(11, 16) })
  
          return val
        }
      })
      totalMinutes = range1.reduce((acc, cu) => {
        return acc + (convertToMinutes(cu.end) - convertToMinutes(cu.start))
      }, 0)
      employee.takenMaternityLeaves += +(
        1 -
        (totalMinutes - calculateIntersectionValue(range1, rangeMaternityLeave)) / totalMinutes
      ).toFixed(2)
  
      // Parental Leave
  
      const parentalLeave = calcDeffTime(
        leaves.filter(val => {
          return val.status_reason == 'parentalLeave'
        })
      ).map(val => {
        if (val.type == 'daily') {
          employee.takenParentalLeaves += val.leave_value
  
          return val
        } else {
          rangeParentalLeave.push({ start: val.date_from.substring(11, 16), end: val.date_to.substring(11, 16) })
  
          return val
        }
      })
      totalMinutes = range1.reduce((acc, cu) => {
        return acc + (convertToMinutes(cu.end) - convertToMinutes(cu.start))
      }, 0)
      employee.takenParentalLeaves += +(
        1 -
        (totalMinutes - calculateIntersectionValue(range1, rangeParentalLeave)) / totalMinutes
      ).toFixed(2)
  
      return employee
  
    }


  const calculate = e => {
    let data = {}
    data._id = e
    data.fromDate = fromDate
    data.toDate = toDate
    axios.post('/api/payroll/byEmployee', { data }).then(res => {
      let employee = res.data.data[0]

      employee.dailySalary = (employee.salaries_info[0].lumpySalary / 30).toFixed(2) //  Daily Salary

      //   ----------------------- Assume Leave -------------------------------

      employee = calcTakenLeaves(employee)

      //   ----------------------- Assume hourly Salary -------------------------------

      employee.hourlySalary = (
        employee.dailySalary /
        (
          (new Date('1/1/2023 ' + employee.shift_info[0].times[0].timeOut.toString() + ' UTC') -
            new Date('1/1/2023 ' + employee.shift_info[0].times[0].timeIn.toString() + ' UTC')) /
          3600000
        ).toFixed(2)
      ).toFixed(2)


      let totalEarlyHours = 0
      let totalLateHours = 0
      let totalholidayHours = 0
      let totalOffDayHours = 0
      let totalCompensations = 0
      let totalDeductions = 0
      let totalEmployeeDeductions = 0
      let totalEmployeeRewards = 0
      let totalWorkingDaysCount = 0
      let totalLeave = 0

     //   ----------------------- Assume Early & Late Hours -------------------------------

      res.data.attendances.map(att => {
        if (att._in) {
          totalWorkingDaysCount++
        }
        totalEarlyHours = totalEarlyHours + Number(att.earlyHours)
        totalLateHours = totalLateHours + Number(att.lateHours)
        if (att.holidayDay) {
          totalholidayHours = totalholidayHours + +Number(att.totalHours)
        }
        if (!att.holidayDay && !att.workingDay) {
          totalOffDayHours = totalOffDayHours + Number(att.totalHours)
        }
      })
      employee.totalWorkingDaysCount = totalWorkingDaysCount
      employee.totalholidayHours = totalholidayHours
      employee.totalholidayValue = (
        +totalholidayHours *
        +employee.hourlySalary *
        +employee.salaryFormulas_info[0].holidayOverTime
      ).toFixed(3)

      employee.totalOffDayHours = totalOffDayHours
      employee.totalOffDayValue = (
        +totalOffDayHours *
        +employee.hourlySalary *
        +employee.salaryFormulas_info[0].weekendOverTime
      ).toFixed(3)

      employee.totalEarlyHours = totalEarlyHours
      employee.totalLateHours = totalLateHours
      employee.totalEarlyValue =
        (Number(employee.totalEarlyHours + employee.totalLateHours) *
        Number(employee.salaryFormulas_info[0].notJustifiedAbsenceHoure) *
        Number(employee.hourlySalary) *
        -1).toFixed(3)

      //   -------------------------- Assume Compensations -------------------------------------

      if (employee.compensations_array) {
        employee.compensations_array.map(comp => {
          let totalValue = 0

          if (comp.type == 'Monthly') {
            totalValue = totalValue + Number(comp.fixedValue)
            totalValue = totalValue + Number((comp.percentageValue * employee.salaries_info[0].lumpySalary) / 100)
          }
          if (comp.type == 'Daily') {
            totalValue = totalValue + Number(comp.fixedValue * employee.totalWorkingDaysCount)
            totalValue =
              totalValue + Number((comp.percentageValue * employee.totalWorkingDaysCount * employee.dailySalary) / 100)
          }
          comp.totalValue = totalValue
          totalCompensations = totalCompensations + totalValue
        })

        employee.totalCompensations = totalCompensations
      }

      //   -------------------------- Assume Deduction -------------------------------------

      if (employee.deductions_array) {
        employee.deductions_array.map(deduction => {
          let totalValue = 0

          if (deduction.type == 'Monthly') {
            totalValue = totalValue + Number(deduction.fixedValue)
            totalValue = totalValue + Number((deduction.percentageValue * employee.salaries_info[0].lumpySalary) / 100)
          }
          if (deduction.type == 'Daily') {
            totalValue = totalValue + Number(deduction.fixedValue * employee.totalWorkingDaysCount)
            totalValue =
              totalValue +
              Number((deduction.percentageValue * employee.totalWorkingDaysCount * employee.dailySalary) / 100)
          }
          deduction.totalValue = totalValue
          totalDeductions = totalDeductions + totalValue
        })

        employee.totalDeductions = totalDeductions
      }

      //   -------------------------- Assume Employee Deduction -------------------------------------

      if (employee.employee_deductions_info) {
        employee.employee_deductions_info.map(deduction => {
          let totalDeductionsValue = 0
          totalDeductionsValue = totalDeductionsValue + Number(deduction.value)
          totalEmployeeDeductions = totalEmployeeDeductions + totalDeductionsValue
        })
        employee.totalEmployeeDeductions = totalEmployeeDeductions
      }

      //   -------------------------- Assume Employee Rewards -------------------------------------

      if (employee.employee_rewards_info) {
        employee.employee_rewards_info.map(reward => {
          let totalRewardsValue = 0
          totalRewardsValue = totalRewardsValue + Number(reward.value)
          totalEmployeeRewards = totalEmployeeRewards + totalRewardsValue
        })
        employee.totalEmployeeRewards = totalEmployeeRewards
      }

        //   -------------------------- Assume Leaves -------------------------------------

        if (employee.leaves_info) {
          let totalWorkingDaysCount = 0

          let shift_out = new Date('1/1/2023 ' + employee.shift_info[0].times[0].timeOut.toString() + ' UTC')
          let shift_in = new Date('1/1/2023 ' + employee.shift_info[0].times[0].timeIn.toString() + ' UTC')

          employee.leaves_info.map(leave => {
          if(leave.type == "daily")
          {
            let from =  new Date(leave.date_from).setUTCHours(0,0,0,0)
            let to =  new Date(leave.date_to).setUTCHours(0,0,0,0)
            let days = ((to-from)/ (1000 * 60 * 60 * 24))+1
            leave.time = (((shift_out - shift_in)*days) / 3600000).toFixed(2)
            leave.days = days
            totalLeave = totalLeave + Number(((days*employee.dailySalary * (100 - leave.paidValue))/100).toFixed(3))
          }
          if(leave.type == "hourly")
            {
              leave.time = ((new Date(leave.date_to) - new Date(leave.date_from)) / 3600000).toFixed(2)
              totalLeave = totalLeave + Number((((leave.time*employee.hourlySalary) * (100 - leave.paidValue))/100).toFixed(3))
            }
          })

          employee.totalLeave = (totalLeave)
      }

      setSelectedEmployee(employee)
      setAttendances(res.data.attendances)
    })
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleFilter = useCallback(val => {
    setValue(val)
  }, [])

  const handleStatusChange = useCallback(e => {
    setType(e.target.value)
  }, [])

  const handleTypeChange = useCallback(e => {
    setEmployeeType(e.target.value)
  }, [])

  const handleCloseExcel = () => {
    setOpenExcel(false)
  }

  // -------------------------- Delete Form --------------------------------

  const deleteAttendance = () => {
    axios
      .post('/api/attendance/delete-attendance', {
        selectedAttendance
      })
      .then(function (response) {
        dispatch(fetchData({})).then(() => {
          toast.success('Attendance Deleted Successfully.', {
            delay: 1000,
            position: 'bottom-right'
          })
          setOpen(false)
        })
      })
      .catch(function (error) {
        toast.error('Error : ' + error.response.data.message + ' !', {
          delay: 1000,
          position: 'bottom-right'
        })
        setLoading(false)
      })
  }

  // -------------------------- Add Document -----------------------------------------------

  const addAttendance = () => {
    router.push('/company-dashboard/form/add-form')
  }

  // -------------------------- Row Options -----------------------------------------------

  const RowOptions = ({ row }) => {
    // ** State
    const [anchorEl, setAnchorEl] = useState(null)
    const rowOptionsOpen = Boolean(anchorEl)

    const handleRowOptionsClick = event => {
      setAnchorEl(event.currentTarget)
    }

    const handleRowOptionsClose = () => {
      setAnchorEl(null)
    }

    const handleEditRowOptions = () => {
      setSelectedEditRow(row)
      setOpenEditDialog(true)
      handleRowOptionsClose()
    }

    const handleRowView = () => {
      router.push('/company-dashboard/form/' + row._id)
      handleRowOptionsClose()
    }

    const handleDelete = () => {
      setSelectedAttendance(row)
      setOpen(true)
    }

    // ------------------------------ Table Definition ---------------------------------

    return (
      <>
        <IconButton size='small' onClick={handleRowOptionsClick}>
          <Icon icon='mdi:dots-vertical' />
        </IconButton>
        <Menu
          keepMounted
          anchorEl={anchorEl}
          open={rowOptionsOpen}
          onClose={handleRowOptionsClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right'
          }}
          PaperProps={{ style: { minWidth: '8rem' } }}
        >
          {/* {session && session.user && session.user.permissions.includes('ViewForm') && (
            <MenuItem onClick={handleRowView} sx={{ '& svg': { mr: 2 } }}>
              <Icon icon='mdi:eye-outline' fontSize={20} />
              View
            </MenuItem>
          )} */}
          {session && session.user && session.user.permissions.includes('EditAttendance') && (
            <MenuItem onClick={handleEditRowOptions} sx={{ '& svg': { mr: 2 } }}>
              <Icon icon='mdi:pencil-outline' fontSize={20} />
              Edit
            </MenuItem>
          )}
          {session && session.user && session.user.permissions.includes('DeleteAttendance') && (
            <MenuItem onClick={handleDelete} sx={{ '& svg': { mr: 2 } }}>
              <Icon icon='mdi:delete-outline' fontSize={20} />
              Delete
            </MenuItem>
          )}
        </Menu>
      </>
    )
  }

  // ----------------------------excel ------------------------------------------

  const importExcel = () => {
    myRef.current.click()
  }

  function ExcelDateToJSDate(date) {
    return isNaN(date) ? null : new Date(Math.round((date - 25569) * 86400 * 1000))
  }

  function excelDateToJSDate(excel_date, time = false) {
    let day_time = excel_date % 1
    let meridiem = 'AMPM'
    let hour = Math.floor(day_time * 24)
    let minute = Math.floor(Math.abs(day_time * 24 * 60) % 60)
    let second = Math.floor(Math.abs(day_time * 24 * 60 * 60) % 60)
    if (isNaN(second) || isNaN(minute) || isNaN(hour) || isNaN(day_time)) {
      return null
    }
    hour >= 12 ? (meridiem = meridiem.slice(2, 4)) : (meridiem = meridiem.slice(0, 2))
    hour > 12 ? (hour = hour - 12) : (hour = hour)
    hour = hour < 10 ? '0' + hour : hour
    minute = minute < 10 ? '0' + minute : minute
    second = second < 10 ? '0' + second : second
    let daytime = '' + hour + ':' + minute + ':' + second + ' ' + meridiem

    return time
      ? daytime
      : new Date(0, 0, excel_date, 0, -new Date(0).getTimezoneOffset(), 0).toLocaleDateString(navigator.language, {}) +
          ' ' +
          daytime
  }

  const onFileChange = event => {
    /* wire up file reader */
    const target = event.target

    if (target.files.length != 0) {
      if (target.files.length !== 1) {
        throw new Error('Cannot use multiple files')
      } else {
        const reader = new FileReader()
        reader.readAsBinaryString(target.files[0])
        reader.onload = e => {
          /* create workbook */
          const binarystr = e.target.result
          const wb = XLSX.read(binarystr, { type: 'binary' })

          /* selected the first sheet */
          const wsname = wb.SheetNames[0]
          const ws = wb.Sheets[wsname]

          /* save data */
          const data = XLSX.utils.sheet_to_json(ws) // to get 2d array pass 2nd parameter as object {header: 1}

          let d = data.map((val, index) => {
            return {
              'Emp No.': val['Emp No.'],
              Date: ExcelDateToJSDate(val.Date),
              'Clock Out': excelDateToJSDate(val['Clock Out'], true),
              'Clock In': excelDateToJSDate(val['Clock In'], true),
              index: index + 1,
              Name: val.Name
            }
          })

          let ids = employeesList.map(val => {
            return val.idNo
          })

          let unValid = d.filter(val => {
            let i = !val['Emp No.']
            let i2 = !val.Date
            let i3 = !val['Clock Out']
            let i4 = !val['Clock In']
            let j = !ids.includes(val['Emp No.'].toString())

            val.reasons = []
            val.reasons = i ? [...val.reasons, 'Emp No.'] : val.reasons
            val.reasons = i2 ? [...val.reasons, 'Date'] : val.reasons
            val.reasons = i3 ? [...val.reasons, 'Clock Out'] : val.reasons
            val.reasons = i4 ? [...val.reasons, 'Clock In'] : val.reasons
            val.reasons = j ? [...val.reasons, 'not in the system'] : val.reasons

            return i || i2 || i3 || j
          })

          if (unValid.length > 0) {
            setOpenExcel(true)
            setUnvalid(unValid)
          } else {
            handleSubmit(d)
          }
        }
      }
    }
  }

  const handleSubmit = data => {
    data = data.map(({ reasons, index, Name, ...item }) => {
      return {
        date: new Date(item.Date),
        timeOut: item['Clock Out'],
        timeIn: item['Clock In'],
        employee_no: item['Emp No.']
      }
    })
    setLoading(true)

    axios
      .post('/api/attendance/add-attendances', {
        data
      })
      .then(function (response) {
        toast.success('Form (' + data.title + ') Inserted Successfully.', {
          delay: 3000,
          position: 'bottom-right'
        })
        setLoading(false)
      })
      .catch(function (error) {
        toast.error('Error : ' + error.response.data.message + ' !', {
          delay: 3000,
          position: 'bottom-right'
        })
        setLoading(false)
      })
  }

  // ------------------------------- Table columns --------------------------------------------

  const columns = [
    {
      flex: 0.02,
      minWidth: 50,
      field: '#',
      headerName: '#',
      renderCell: ({ row }) => {
        return (
          <Typography variant='subtitle1' noWrap sx={{ textTransform: 'capitalize' }}>
            {row.index}
          </Typography>
        )
      }
    },
    {
      flex: 0.11,
      minWidth: 120,
      field: 'noId',
      headerName: 'Id',
      renderCell: ({ row }) => {
        return (
          <Typography variant='subtitle1' noWrap sx={{ textTransform: 'capitalize' }}>
            {row.employee_no}
          </Typography>
        )
      }
    },
    {
      flex: 0.17,
      minWidth: 100,
      field: 'name',
      headerName: 'Name',
      renderCell: ({ row }) => {
        return (
          <Typography variant='subtitle1' noWrap sx={{ textTransform: 'capitalize' }}>
            {row.employee_info[0].firstName + ' ' + row.employee_info[0].lastName}
          </Typography>
        )
      }
    },
    {
      flex: 0.11,
      minWidth: 120,
      field: 'date',
      headerName: 'Date',
      renderCell: ({ row }) => {
        return <>{new Date(row.date).toISOString().substring(0, 10)}</>
      }
    },
    {
      flex: 0.11,
      minWidth: 120,
      field: 'timeIn',
      headerName: 'Time in',
      renderCell: ({ row }) => {
        return <>{row.timeIn}</>
      }
    },
    {
      flex: 0.11,
      minWidth: 120,
      field: 'timeOut',
      headerName: 'Time out',
      renderCell: ({ row }) => {
        return <>{row.timeOut}</>
      }
    },
    {
      flex: 0.11,
      minWidth: 120,
      field: 'time',
      headerName: 'Time',
      renderCell: ({ row }) => {
        var timeStart = new Date('01/01/2007 ' + row.timeIn)
        var timeEnd = new Date('01/01/2007 ' + row.timeOut)

        return <>{((timeEnd - timeStart) / 60 / 60 / 1000).toFixed(2)}</>
      }
    },

    {
      flex: 0.07,
      minWidth: 45,
      field: 'status',
      headerName: 'Status',
      renderCell: ({ row }) => {
        return (
          <CustomChip
            skin='light'
            size='small'
            label={row.status}
            color={StatusObj[row.status]}
            sx={{ textTransform: 'capitalize', '& .MuiChip-label': { lineHeight: '18px' } }}
          />
        )
      }
    },
    {
      flex: 0.01,
      minWidth: 45,
      sortable: false,
      field: 'actions',
      headerName: '',
      renderCell: ({ row }) => <RowOptions row={row} />
    }
  ]

  // ------------------------------------ View ---------------------------------------------

  if (loading) return <Loading header='Please Wait' description='Attendances is loading'></Loading>

  if (session && session.user && !session.user.permissions.includes('ViewAttendance'))
    return <NoPermission header='No Permission' description='No permission to view attendance'></NoPermission>

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <Breadcrumbs aria-label='breadcrumb' sx={{ pb: 0, p: 3 }}>
            <Link underline='hover' color='inherit' href='/'>
              Home
            </Link>
            <Link underline='hover' color='inherit' href='/company-dashboard/payroll/'>
              Payroll List
            </Link>
            <Typography color='text.primary' sx={{ fontSize: 18, fontWeight: '500' }}>
              Calculate
            </Typography>
          </Breadcrumbs>
          <Divider sx={{ pb: 0, mb: 0 }} />
          <Grid container spacing={2} sx={{ px: 5, pt: 0, mt: -2 }}>
            <Grid item sm={2} xs={6}>
              <FormControl fullWidth size='small' sx={{ mt: 0 }}>
                <small>Date From</small>
                <DatePicker
                  value={new Date(fromDate)}
                  onChange={e => {
                    setFromDate(e)
                  }}
                />
              </FormControl>
            </Grid>
            <Grid item sm={2} xs={6}>
              <FormControl fullWidth size='small' sx={{ mt: 0 }}>
                <small>Date To</small>
                <DatePicker

                  value={new Date(toDate)}
                  onChange={e => {
                    setToDate(e)
                  }}
                />
              </FormControl>
            </Grid>
            <Grid item sm={4} xs={12}>
              <FormControl fullWidth size='small' sx={{ mt: 0 }}>
                <small>Employee</small>
                <SelectPicker
                  name='employee_id'
                  data={employeesDataSource}
                  block
                  onChange={e => {
                    calculate(e)
                  }}
                />
              </FormControl>
            </Grid>
            <Grid item sm={2} xs={12}>
              <Button
              sx={{ mt: 6 }}
              size='sm'
              variant='contained'
              onClick={() => {
                calculate(selectedEmployee._id)
              }}
            >
              Calculate
            </Button>
            </Grid>
          </Grid>

          <Divider />

          {/* -------------------------- Table -------------------------------------- */}

          <Preview employee={selectedEmployee} attendances={attendances} fromDate={fromDate} toDate={toDate} />
        </Card>
      </Grid>
      {/* -------------------------- Delete Dialog -------------------------------------- */}
      <Dialog
        open={open}
        disableEscapeKeyDown
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            handleClose()
          }
        }}
      >
        <DialogTitle id='alert-dialog-title text'>Warning</DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>
            Are you sure , you want to delete this Attendance
          </DialogContentText>
        </DialogContent>
        <DialogActions className='dialog-actions-dense'>
          <Button onClick={deleteAttendance}>Yes</Button>
          <Button onClick={handleClose}>No</Button>
        </DialogActions>
      </Dialog>
      <DialogShareProject openExcel={openExcel} setOpenExcel={setOpenExcel} Unvalid={Unvalid} />
      {openEditDialog ? (
        <DialogEditAttendance
          open={openEditDialog}
          setOpen={setOpenEditDialog}
          employee={SelectedEditRow}
          setupdate={setupdate}
        />
      ) : null}
    </Grid>
  )
}

const DialogShareProject = ({ openExcel, setOpenExcel, Unvalid }) => {
  // ** States

  const handleClose = () => {
    setOpenExcel(false)
  }

  return (
    <Dialog
      fullWidth
      open={openExcel}
      maxWidth='md'
      scroll='body'
      onClose={() => setOpenExcel(false)}
      onBackdropClick={() => setOpenExcel(false)}
    >
      <DialogContent sx={{ px: { xs: 8, sm: 15 }, py: { xs: 8, sm: 12.5 }, position: 'relative' }}>
        <IconButton
          size='small'
          onClick={() => setOpenExcel(false)}
          sx={{ position: 'absolute', right: '1rem', top: '1rem' }}
        >
          <Icon icon='mdi:close' />
        </IconButton>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant='h5' sx={{ mb: 3, lineHeight: '2rem' }}>
            Errors
          </Typography>
          <Typography variant='body2'>Errors with the file you want to upload fix them than retry again </Typography>
        </Box>

        <Typography variant='h6'>{`${Unvalid.length} Errors`}</Typography>
        <List dense sx={{ py: 4 }}>
          {Unvalid.map((val, index) => {
            return (
              <ListItem
                key={index}
                sx={{
                  p: 0,
                  display: 'flex',
                  flexWrap: 'wrap',
                  '.MuiListItem-container:not(:last-child) &': { mb: 4 },
                  borderBottom: '1px dashed black',
                  padding: '5px'
                }}
              >
                <ListItemText
                  primary={'line number ' + val.index}
                  secondary={'user :' + val.Name}
                  sx={{ m: 0, '& .MuiListItemText-primary, & .MuiListItemText-secondary': { lineHeight: '1.25rem' } }}
                />
                <ListItemSecondaryAction sx={{ right: 0 }}>
                  {val.reasons.map((val, index) => {
                    return <CustomChip key={index} label={val} skin='light' color='error' />
                  })}
                </ListItemSecondaryAction>
              </ListItem>
            )
          })}
        </List>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
          <Button variant='contained' onClick={handleClose}>
            ok
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default AllDocumentsList
