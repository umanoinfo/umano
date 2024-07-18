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
  const [selectedEmployeeID, setSelectedEmployeeID] = useState()
  const { data: session, status } = useSession()

  const myRef = createRef()

  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [SelectedEditRow, setSelectedEditRow] = useState()

  let [fromDate, setFromDate] = useState(new Date())
  let [toDate, setToDate] = useState(new Date())

  const [employeesList, setEmployeesList] = useState([])

  const [employee , setEmployee ] = useState() ;
  const [lumpySalary , setLumpySalary] = useState(0);

  // ** Hooks

  const [openExcel, setOpenExcel] = useState(false)
  const [Unvalid, setUnvalid] = useState([])
  const [update, setupdate] = useState(new Date())
  const [employeesDataSource, setEmployeesDataSource] = useState([])
  const [attendances, setAttendances] = useState([])
  const [employeesFullInfo, setEmployeesFullInfo] = useState([])
  const [done , setDone ] = useState(false) ;
  const router = useRouter()
  const [notAuthorized, setNotAuthorized ] = useState([]) ;
  const dispatch = useDispatch()
  const store = useSelector(state => state.attendance)

  useEffect(() => {
    setLoading(true);
      dispatch(
        fetchData({
          fromDate: fromDate,
          toDate: toDate,
          employee_no: value
        })
      ).then( () => {
        getEmployees().then(()=>{
          setLoading(false)
        })
      })
  }, [dispatch, value])

  //   ----------------------------------------------------------------------------------

  const calcLeaves = ({...employee},type='year') => {
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

    console.log(leaves,type);
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
      }), type
    ).map(val => {
      if (val.type == 'daily') {
        employee.takenPaidLeaves += val.leave_value

        return val
      } else {
        rangePaidLeave.push({ start: val.date_from.substring(11, 16), end: val.date_to.substring(11, 16) })

        return val
      }
    })
    console.log('1',rangePaidLeave);

    let totalMinutes = range1.reduce((acc, cu) => {
      return acc + (convertToMinutes(cu.end) - convertToMinutes(cu.start))
    }, 0)
    console.log('2',totalMinutes);
    employee.takenPaidLeaves += +(
      1 -
      (totalMinutes - calculateIntersectionValue(range1, rangePaidLeave)) / totalMinutes
    ).toFixed(2)
    console.log(employee.takenPaidLeaves);

    // Unpaid Leave

    const unpaidLeave = calcDeffTime(
      leaves.filter(val => {
        return val.status_reason == 'unpaidLeave'
      }), type
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
      }), type
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
      }), type
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
      }), type
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

  // ------------------------------- Get Employees --------------------------------------

  const getEmployees = async () => {
    setLoading(true);
    axios.get('/api/company-employee', {}).then(res => {
      let arr = []
      let employees = res.data.data
      employees.map(employee => {
        // if (employee.shift_info[0]) {
        let salaryFormulaType =  '' 
        if(employee?.salaryFormulas_info[0]?.type )
          salaryFormulaType =  employee.salaryFormulas_info[0].type;
        arr.push({
          label: employee.idNo + ' - ' + employee.firstName + ' ' + employee.lastName + ' (' + employee.email + ')',
          value: {id: employee._id , salaryFormulaType }
        })

        // }
      })
      setEmployeesDataSource(arr)
      setEmployeesFullInfo(employees)
      setLoading(false)

    }).catch(err=>{
      let message = err?.response?.data?.message || err.toString() ;
      setEmployeesDataSource([{
        label: <div style={{color:'red'}}> no permission to view Employees </div>,
        value: undefined
      }])
      if(err.response.status == 401){
        setNotAuthorized([...notAuthorized , 'ViewEmployee' ])
        message = 'Error : Failed to fetch employeees ( not Permissin'
      }
      toast.error(message , {duration : 5000 , position: 'bottom-right'}) ; 
      setLoading(false);
    })
  }

  function convertToMinutes(timeString) {
    const [hours, minutes] = timeString.split(':')

    return parseInt(hours) * 60 + parseInt(minutes)
  }

  const calcDeffTime = (val,type='year') => {
   
    return val.map(val => {
      if (val.type == 'daily') {
        const diffTime = Math.abs(new Date(val.date_to) - new Date(val.date_from))+1
        const diffDays =  (diffTime / (1000 * 60 * 60 * 24))
        let curDate = new Date( val.date_from ) ;
        let totalDays =0  ;
        for(let i =0  ;i < diffDays ;i++){
          if(type == 'year'){
            if(curDate.getFullYear() == new Date().getFullYear())
              totalDays++;
          }
          else{
            if(curDate >= fromDate && curDate <= toDate){
              totalDays++; 
            }
          }
          curDate= new Date(curDate.getTime() + 1000 * 60 * 60 * 24 ) ; 
        }
        
        return { ...val, leave_value: totalDays }
      } else {
        const diffTime = Math.abs(new Date(val.date_to) - new Date(val.date_from))
        const diffDays = (diffTime / (1000 * 60))
        if(type == 'year'){
          if(new Date(val.date_from).getFullYear() == new Date().getFullYear()){
            return { ...val, leave_value: diffDays };
          }
          else{
            return {...val , leave_value: 0 } ;
          }  
        }
        else{
          if(new Date(val.date_from) >= fromDate && new Date(val.date_from) <= toDate){
            return {...val , leave_value: diffDays} ;
          }
          else{
            return {...val , leave_value: 0 } ; 
          }
        }

      }
    })
  }

  function calculateIntersectionValue(timeRanges1, timeRanges2) { // return total intersection in minutes

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
        
        if(start2 >= start1 && end2 >= end1 ){
          const intersection = Math.max(0, end - start)
          totalIntersection += intersection
        }
      }
    }

    return totalIntersection
  }
  

  const calculate = async (e) => {
    let data = {}
    data._id = e.id
    setFromDate( new Date(fromDate.getTime() + Math.abs(fromDate.getTimezoneOffset() * 60000) ))
    let from_date = new Date(fromDate.getFullYear() , fromDate.getMonth() , 1 ) ;
    fromDate = from_date ;
    setFromDate(from_date);
    data.fromDate = from_date ;
    let to_date = new Date(fromDate.getFullYear() , fromDate.getMonth() + 1, 0 );
    to_date = new Date(to_date.getTime() + Math.abs(to_date.getTimezoneOffset() * 60000 )) ;
    toDate = to_date; 
    
    setToDate(to_date);
    data.toDate = to_date;
    console.log(fromDate, toDate);
    data.lumpySalary = lumpySalary ;
    if(e.salaryFormulaType == 'Flexible' && lumpySalary == 0 ){
      setSelectedEmployeeID(e);
      setDone(1);
      
      return ;
    }
    
    setLoading(true);
    try{
      let res = await axios.post('/api/payroll/byEmployee', { data });
      
      // .then(res => 
        // checked: daily salary , taken leaves , 
        // not checked:
        let error = 0 ;
        if(!res.data?.data || res.status != 200 ){
          error = 1 ;
          toast.error(res.data.message , {duration:5000, position:'bottom-right'});
          
          return ;
        }
        let employee = res.data.data[0]
         if(employee.flexible || e.salaryFormulaType == 'Flexible'){
            employee.salaries_info= [{lumpySalary}]

            // employee.totalWorkingDaysCount = Math.abs(new Date(fromDate) - new Date(toDate)) / (1000 * 60 * 60 * 24) ;
            
         }
        
        // if(!employee.flexible && (!employee.salaries_info || employee.salaries_info.length == 0)){
        //     throw new Error('Add salary first (no salary defined!)')
        // }
        

        //   ----------------------- Assume Leave -------------------------------
        if(!employee.flexible){
          let employeeLeavesForThisYear = calcLeaves(employee,'year');
          employee = calcLeaves(employee,'range');
          employee.yearlyTakenPaidLeaves = employeeLeavesForThisYear.takenPaidLeaves ; 
          employee.yearlyTakenUnpaidLeaves = employeeLeavesForThisYear.takenUnpaidLeaves ; 
          employee.yearlyTakenSickLeaves = employeeLeavesForThisYear.takenSickLeaves ; 
          employee.yearlyTakenParentalLeaves = employeeLeavesForThisYear.takenParentalLeaves ; 
        }
 
        //   --------------------------- Assume OverTime -------------------------------------------------
 
        setSelectedEmployee(employee)
        if(!employee.flexible)
          setAttendances(res.data.attendances)
        setDone(2);
    }
    catch(err){
      // console.log(err?.response?.data?.message , err.toString());
      console.log('err');
      if(err?.response?.data?.message)
      {
        err.response.data.message.map((msg)=>{
          toast.error( msg , {duration:5000 , position:'bottom-right'});
        })
      }
      else{
         toast.error(err.toString(), {duration:5000 , position:'bottom-right'});
      }
      setSelectedEmployee(null);
    }
    setLoading(false);
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

  if (loading) return <Loading header='Please Wait' description='Payroll is loading'></Loading>

  if (session && session.user && !session.user.permissions.includes('ViewPayroll'))
    return <NoPermission header='No Permission' description='No permission to view payroll'></NoPermission>

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
          <Grid item sm={4} xs={12}>
              <FormControl fullWidth size='small' sx={{ mt: 0 }}>
                <small>Employee</small>
                <SelectPicker
                  name='employee_id'
                  data={employeesDataSource}
                  block

                  // value={selectedEmployee.firstName}
                  // valueKey={selectedEmployee?.firstName}
                  onChange={e => {
                    setSelectedEmployeeID(e.id);
                    calculate(e)
                  }}
                />
              </FormControl>
            </Grid>
            <Grid item sm={2} xs={6}>
              <FormControl fullWidth size='small' sx={{ mt: 0 }}>
                <small>Date From</small>
                <DatePicker
                  oneTap
                  value={new Date(fromDate)}
                  onChange={e => {
                    setFromDate(e)
                  }}
                  format='MMM/yyyy'
                  
                />
              </FormControl>
            </Grid>
            {/*
              old payroll technique
            <Grid item sm={2} xs={6}>
              <FormControl fullWidth size='small' sx={{ mt: 0 }}>
                <small>Date To</small>
                <DatePicker
                  oneTap
                  value={new Date(toDate)}
                  onChange={e => {
                    
                    setToDate(e)
                  }}
                />
              </FormControl>
            </Grid> */}
          
            {
              done == 1?
                  <Grid item sm={2} xs={12}>
                    <FormControl  size='sm' sx={{ mt: 0 }}>
                      <small>Basic Salary </small>
                      <TextField
                        value={lumpySalary}
                        onChange={e => {
                            setLumpySalary(e.target.value)
                        }}
                        type='number'
                        size='small'

                        // label='Lumpy Salary'
                        placeholder='Lumpy Salary'
                        />
                    </FormControl>
                    
                  </Grid>
                  :
                <></>
            }
            <Grid item sm={2} xs={12}>
              <Button
              sx={{ mt: 8 }}
              size='sm'
              variant='contained'
              onClick={() => {
                if(selectedEmployeeID)
                  calculate({id:selectedEmployeeID})
              }}
            >
              Calculate
            </Button>
            </Grid>
          </Grid>

          <Divider />

          {/* -------------------------- Table ----------------------------------- */}
          {
            selectedEmployee && 
            <Preview employee={selectedEmployee} attendances={attendances} fromDate={fromDate} toDate={toDate} lumpySalary={lumpySalary}/>
          }
        </Card>
      </Grid>
      {/* -------------------------- Delete Dialog -------------------------------------- */}
      {/* <Dialog
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
      ) : null} */}
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
