// -------------------------new imports ---------------------
import CardContent from '@mui/material/CardContent'
import LinearProgress from '@mui/material/LinearProgress'

import CustomAvatar from 'src/@core/components/mui/avatar'

// ** React Imports
import { useState, useRef, useEffect, forwardRef } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'

import Icon from 'src/@core/components/icon'
import CustomChip from 'src/@core/components/mui/chip'

import { Divider, Tab, Typography } from '@mui/material'

import toast from 'react-hot-toast'

// ** Rsuite Imports
import { Form, Schema, SelectPicker, DatePicker, Input } from 'rsuite'
import 'rsuite/dist/rsuite.min.css'

// ** Axios Imports
import axios from 'axios'

// import { EmployeeDeductionsType } from 'src/local-db'

// ** Store Imports
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import Loading from 'src/views/loading'
import NoPermission from 'src/views/noPermission'
import { DataGrid } from '@mui/x-data-grid'

const { StringType, NumberType, DateType } = Schema.Types

const Textarea = forwardRef((props, ref) => <Input {...props} as='textarea' ref={ref} />)

const types = [
  { label: 'Hourly', value: 'hourly' },
  { label: 'Daily', value: 'daily' }
]

const AddLeave = ({ popperPlacement, id }) => {
  // ** States
  const [loadingDescription, setLoadingDescription] = useState('')
  const [action, setAction] = useState('add')
  const [loading, setLoading] = useState(false)
  const [employeesDataSource, setEmployeesDataSource] = useState([])
  const router = useRouter()
  const { data: session, status } = useSession
  const formRef = useRef()
  const [formError, setFormError] = useState()

  // new states

  const [statusDs, setStatusDs] = useState([
    { label: 'Justified ', value: 'justified' },
    { label: 'Not Justified', value: 'notJustified' },
    { label: 'Sick', value: 'sick' }
  ])

  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  const [days, setDays] = useState([])
  const [holyDays, setholyDays] = useState([])
  const [selectedEmployee, setSelectedEmployee] = useState(null)

  // --------------forms values--------------------------------

  const default_value = {
    type: 'hourly',
    employee_id: '',
    date_from: null,
    date_to: null,
    resolution_number: 0,
    description: '',
    status_reason: 'justified',
    reason: ''
  }
  const [formValue, setFormValue] = useState(default_value)

  useEffect(() => {
    getEmployees(), getMyCompany()
  }, [])

  // ------------------------------ validate Mmodel ------------------------------------

  const validateMmodel = Schema.Model({
    type: StringType().isRequired('This field is required.'),
    reason: StringType().isRequired('This field is required.'),
    employee_id: StringType().isRequired('This field is required.'),
    date_from: DateType().isRequired('This field is required.'),
    date_to: DateType().isRequired('This field is required.'),
    employee_id: StringType().isRequired('This field is required.'),
    status_reason: StringType().isRequired('This field is required.')
  })

  // ------------------------------- Get Employees --------------------------------------

  const getMyCompany = () => {
    axios.get('/api/company/my-company', {}).then(res => {
      let val = res.data.data[0]

      if (!val.working_days) {
        val.working_days = []
      }
      if (!val.holidays) {
        val.holidays = []
      } else {
        let temp_holydays = []
        val.holidays = val.holidays.map(h => {
          let v = { ...h, date: new Date(h.date) }
          temp_holydays.push(v.date.toDateString())

          return v
        })
        setholyDays(temp_holydays)
      }
      let temp = []
      val.working_days = val.working_days.map(h => {
        temp.push(weekDays.indexOf(h))

        return h
      })
      setDays(temp)
    })
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

  function convertToMinutes(timeString) {
    const [hours, minutes] = timeString.split(':')

    return parseInt(hours) * 60 + parseInt(minutes)
  }

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
    console.log(employee)

    return employee
  }

  const getEmployees = () => {
    axios.get('/api/company-employee', {}).then(res => {
      let arr = []
      let employees = res.data.data
      employees = employees.map((employee , index) => {
   
        if (employee.shift_info[0]) {
          arr.push({
            label: employee.firstName + ' ' + employee.lastName + ' (' + employee.email + ')',
            value: employee._id
          })
          return calcLeaves(employee)
        }
      })
      setEmployeesDataSource(arr)
      setEmployeesFullInfo(employees)
    })
    setLoading(false)
  }

  // ------------------------------- Submit --------------------------------------

  const handleSubmit = () => {
    formRef.current.checkAsync().then(result => {
      if (!result.hasError) {
        let data = { ...formValue }
        const data_request = { ...formValue }

        const range1 = selectedEmployee.shift_info[0].times.map(time => {
          return { start: time.timeIn, end: time.timeOut }
        })

        const totalMinutes = range1.reduce((acc, cu) => {
          return acc + (convertToMinutes(cu.end) - convertToMinutes(cu.start))
        }, 0)

        const newRange = [
          {
            start: data.date_from.toString().substring(16, 21),
            end: data.date_to.toString().substring(16, 21)
          }
        ]

        const diffTime = Math.abs(data.date_to - data.date_from)
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        const newHours = +(1 - (totalMinutes - calculateIntersectionValue(range1, newRange)) / totalMinutes).toFixed(2)

        if (data.type == 'hourly') {
          if (data.status_reason == 'justified') {
            if (+selectedEmployee.availableJustifiedLeaves < newHours + +selectedEmployee.takenJustifiedLeaves) {
              toast.error('Error : Your justifaied leaves are over the limit  !', {
                delay: 3000,
                position: 'bottom-right'
              })

              return
            }
          }
          if (data.status_reason == 'notJustified') {
            if (+selectedEmployee.availableNotJustifiedLeaves < newHours + +selectedEmployee.takenNotJustifiedLeaves) {
              toast.error('Error : Your not justifaied leaves are over the limit  !', {
                delay: 3000,
                position: 'bottom-right'
              })

              return
            }
          }
          if (data.status_reason == 'sick') {
            if (+selectedEmployee.availableSickLeaves < newHours + +selectedEmployee.takenSickLeaves) {
              toast.error('Error : Your Sick leaves are over the limit  !', {
                delay: 3000,
                position: 'bottom-right'
              })

              return
            }
          }
        } else {
          if (data.status_reason == 'justified') {
            if (+selectedEmployee.availableJustifiedLeaves < diffDays + +selectedEmployee.takenJustifiedLeaves) {
              toast.error('Error : Your justifaied leaves are over the limit  !', {
                delay: 3000,
                position: 'bottom-right'
              })

              return
            }
          }
          if (data.status_reason == 'notJustified') {
            if (+selectedEmployee.availableNotJustifiedLeaves < diffDays + +selectedEmployee.takenNotJustifiedLeaves) {
              toast.error('Error : Your not justifaied leaves are over the limit  !', {
                delay: 3000,
                position: 'bottom-right'
              })

              return
            }
          }
          if (data.status_reason == 'sick') {
            if (+selectedEmployee.availableSickLeaves < diffDays + +selectedEmployee.takenSickLeaves) {
              toast.error('Error : Your Sick leaves are over the limit  !', {
                delay: 3000,
                position: 'bottom-right'
              })

              return
            }
          }
        }

        setLoading(true)
        setLoadingDescription('leaves is inserting')

        let newData = { ...data_request }
        newData.date_from = new Date(data_request.date_from).toLocaleString().toString()
        newData.date_to = new Date(data_request.date_to).toLocaleString().toString()
        axios
          .post('/api/employee-leave/add-leave', {
            data: newData
          })
          .then(function (response) {
            router.push('/company-dashboard/employee/leave')
            toast.success('leave (' + data.title + ') Inserted Successfully.', {
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
    })
  }

  const handleChange = (event, newValue) => {
    setTabValue(newValue)
  }

  // -------------------------------- Routes -----------------------------------------------

  const close = () => {
    router.push('/company-dashboard/employee/leave/')
  }

  function isTimeInRanges(time, ranges) {
    const timeInMinutes = convertToMinutes(time)

    for (let i = 0; i < ranges.length; i++) {
      const { start, end } = ranges[i]
      const startTime = convertToMinutes(start)
      const endTime = convertToMinutes(end)

      if (timeInMinutes >= startTime && timeInMinutes <= endTime) {
        return true
      }
    }

    return false
  }

  const disableDates = val => {
    const range1 = selectedEmployee.shift_info[0].times.map(time => {
      return { start: time.timeIn, end: time.timeOut }
    })

    return isTimeInRanges(val.toString().substring(16, 21), range1)
  }

  //---------------------table -------------------------------------
  const columns = [
    {
      flex: 0.02,
      minWidth: 50,
      field: 'index',
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
      flex: 0.08,
      field: 'reason',
      minWidth: 100,
      headerName: 'Reason',
      renderCell: ({ row }) => {
        return <>{row.reason}</>
      }
    },

    {
      flex: 0.08,
      field: 'type',
      minWidth: 100,
      headerName: 'Types',
      renderCell: ({ row }) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', height: 250 }}>
            <Icon fontSize={20} />
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              <CustomChip
                color='primary'
                skin='light'
                size='small'
                sx={{ mx: 0.5, mt: 0.5, mb: 0.5 }}
                label={row.type}
              />
            </div>
          </Box>
        )
      }
    },
    {
      flex: 0.08,
      field: 'status_reason',
      minWidth: 100,
      headerName: 'Status',
      renderCell: ({ row }) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', height: 250 }}>
            <Icon fontSize={20} />
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              <CustomChip
                color='primary'
                skin='light'
                size='small'
                sx={{ mx: 0.5, mt: 0.5, mb: 0.5 }}
                label={row.status_reason}
              />
            </div>
          </Box>
        )
      }
    },
    {
      flex: 0.11,
      minWidth: 120,
      field: 'date_from',
      headerName: 'From',
      renderCell: ({ row }) => {
        const [date, time, ...r] = row.date_from.split('T')

        return (
          <>
            {date} {time.substring(0, 5)}
          </>
        )
      }
    },
    {
      flex: 0.11,
      minWidth: 120,
      field: 'date_to',
      headerName: 'Date To',
      renderCell: ({ row }) => {
        const [date, time, ...r] = row.date_to.split('T')

        return (
          <>
            {date} {time.substring(0, 5)}
          </>
        )
      }
    },

    {
      flex: 0.11,
      minWidth: 120,
      field: 'end',
      headerName: 'Created at',
      renderCell: ({ row }) => {
        return <>{new Date(row.created_at).toISOString().substring(0, 10)}</>
      }
    }
  ]
  const [pageSize, setPageSize] = useState(10)
  const [employeesFullInfo, setEmployeesFullInfo] = useState([])
  const [leavesDataSource, setLeavesDataSource] = useState([])

  const fillTable = id => {
    console.log(employeesFullInfo)
    let val = employeesFullInfo.find(val => val._id == id)
    setSelectedEmployee({ ...val })
    val = val.leaves_info.map(e => {
      e.id = e._id
      return e
    })
    setLeavesDataSource(val)
  }

  //-------------------------components-----------------------------

  const changeEmployee = e => {
    fillTable(e)

    const employee = employeesFullInfo.find(val => {
      return val._id == e
    })
    let temp_reasons = []
    if (employee.takenJustifiedLeaves <= +employee.availableJustifiedLeaves) {
      temp_reasons.push({ label: 'Justified ', value: 'justified' })
    }
    if (employee.takenNotJustifiedLeaves <= +employee.availableNotJustifiedLeaves) {
      temp_reasons.push({ label: 'Not Justified', value: 'notJustified' })
    }
    if (employee.takenSickLeaves <= +employee.availableSickLeaves) {
      temp_reasons.push({ label: 'Sick', value: 'sick' })
    }
    setStatusDs(temp_reasons)
    setFormValue({
      ...formValue,
      employee_id: e,
      date_from: null,
      date_to: null,
      resolution_number: 0,
      description: '',
      status_reason: 'justified',
      reason: ''
    })
  }

  const RenderDate = () => {
    if (formValue.type == 'daily') {
      return (
        <>
          <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
            <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
              From Date :
            </Typography>
            <div>
              <Form.Control
                disabledDate={val => {
                  let i = !days.includes(val.getDay())

                  let j = holyDays.includes(val.toDateString())

                  return i || j
                }}
                controlId='date_from'
                format='yyyy-MM-dd '
                name='date_from'
                accepter={DatePicker}
                value={formValue.date_from}
              />
            </div>
            {/* <Form.Control
              controlId='date_from'
              format='HH:mm'
              name='date_from'
              accepter={DatePicker}
              value={formValue.date_from}
            /> */}
          </Box>
          <Box sx={{ mb: 1, display: 'flex', alignItems: 'end' }}>
            <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
              To Date :
            </Typography>
            <div>
              <Form.Control
                disabledDate={val => {
                  let i = !days.includes(val.getDay())

                  let j = holyDays.includes(val.toDateString())

                  return i || j
                }}
                controlId='date_to'
                format=' yyyy-MM-dd'
                name='date_to'
                accepter={DatePicker}
                value={formValue.date_to}
              />
            </div>
            {/* <Form.Control
              controlId='date_to'
              format=' HH:mm'
              name='date_to'
              accepter={DatePicker}
              value={formValue.date_to}
            /> */}
          </Box>
        </>
      )
    } else {
      return (
        <>
          <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
            <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
              From Date :
            </Typography>
            <div style={{ display: 'flex' }}>
              <Form.Control
                disabledDate={val => {
                  let i = !days.includes(val.getDay())

                  let j = holyDays.includes(val.toDateString())

                  return i || j
                }}
                controlId='date_from'
                format='yyyy-MM-dd '
                name='date_from'
                accepter={DatePicker}
                value={formValue.date_from}
                onChange={e => {
                  e.setHours(0, 0, 0, 0)
                  setFormValue({ ...formValue, date_to: e, date_from: e })
                }}
              />
              <Form.Control
                disabledDate={val => {
                  return !disableDates(val)
                }}
                controlId='date_from'
                format='HH:mm'
                name='date_from'
                accepter={DatePicker}
                value={formValue.date_from}
              />
            </div>
          </Box>
          <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
            <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
              To Date :
            </Typography>
            <div style={{ display: 'flex' }}>
              <Form.Control
                disabledDate={val => {
                  let i = !days.includes(val.getDay())

                  let j = holyDays.includes(val.toDateString())

                  return i || j
                }}
                controlId='date_to'
                format=' yyyy-MM-dd'
                name='date_to'
                accepter={DatePicker}
                value={formValue.date_to}
                disabled
              />
              <Form.Control
                disabledDate={val => {
                  return !disableDates(val)
                }}
                controlId='date_to'
                format=' HH:mm'
                name='date_to'
                accepter={DatePicker}
                value={formValue.date_to}
              />
            </div>
          </Box>
        </>
      )
    }
  }

  const ChartCard = ({ name, count, taken }) => {
    return (
      <Card sx={{ margin: '5px' }}>
        <CardContent>
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <Typography variant='body2'>{name}</Typography>
              <Typography variant='h6'>{count}</Typography>
            </Box>
          </Box>
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ mb: 2.5, display: 'flex', alignItems: 'center' }}>
                <Typography variant='body2'>Taken</Typography>
              </Box>
              <Typography variant='h6'>{((taken / count) * 100).toFixed(2)} %</Typography>
              <Typography variant='caption' sx={{ color: 'text.disabled' }}>
                {taken}
              </Typography>
            </Box>
            <Divider flexItem sx={{ m: 0 }} orientation='vertical'></Divider>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', flexDirection: 'column' }}>
              <Box sx={{ mb: 2.5, display: 'flex', alignItems: 'center' }}>
                <Typography sx={{ mr: 1.5 }} variant='body2'>
                  Left
                </Typography>
              </Box>
              <Typography variant='h6'>{(100 - (taken / count) * 100).toFixed(2)} %</Typography>
              <Typography variant='caption' sx={{ color: 'text.disabled' }}>
                {count - taken}
              </Typography>
            </Box>
          </Box>
          <LinearProgress
            value={((taken / count) * 100).toFixed(2)}
            variant='determinate'
            sx={{
              height: 10,
              '&.MuiLinearProgress-colorPrimary': { backgroundColor: 'primary.main' },
              '& .MuiLinearProgress-bar': {
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
                backgroundColor: 'error.main'
              }
            }}
          />
        </CardContent>
      </Card>
    )
  }

  // ------------------------------ View ---------------------------------

  if (loading) return <Loading header='Please Wait' description={loadingDescription}></Loading>

  if (session && session.user && !session.user.permissions.includes('AddEmployeeLeave'))
    return <NoPermission header='No Permission' description='No permission to add employees leaves'></NoPermission>

  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title='Add leave' sx={{ pb: 0, pt: 2 }} />
            <Divider />
            <Grid container>
              <Grid item xs={12} sm={8} md={8} sx={{ p: 2, px: 5, mb: 5 }}>
                <Form
                  fluid
                  ref={formRef}
                  onChange={setFormValue}
                  onCheck={setFormError}
                  formValue={formValue}
                  model={validateMmodel}
                >
                  <Grid container spacing={1} sx={{ px: 5 }}>
                    <Grid item sm={4} md={3} lg={3}>
                      <small>Type</small>
                      <Form.Control
                        size='sm'
                        controlId='type'
                        name='type'
                        accepter={SelectPicker}
                        data={types}
                        block
                        value={formValue.type}
                      />
                    </Grid>
                    <Grid item sm={8} md={5} lg={5}>
                      <small>Employee</small>
                      <Form.Control
                        size='sm'
                        controlId='employee_id'
                        name='employee_id'
                        accepter={SelectPicker}
                        data={employeesDataSource}
                        block
                        value={formValue.employee_id}
                        onChange={e => {
                          changeEmployee(e)
                        }}
                      />
                    </Grid>

                    <Grid item sm={12} md={12} sx={{ mt: 6, mb: 8 }}>
                      <Grid item sm={12} md={8}>
                        <RenderDate />
                        {/* </Box> */}
                        <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                          <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                            Status :
                          </Typography>
                          <Form.Control
                            size='sm'
                            controlId='status_reason'
                            name='status_reason'
                            accepter={SelectPicker}
                            data={statusDs}
                            block
                            value={formValue.status_reason}
                          />
                        </Box>
                        <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                          <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                            Reason :
                          </Typography>
                          <Form.Control
                            size='sm'
                            name='reason'
                            placeholder='reason '
                            controlId='reason'
                            value={formValue.reason}
                          />
                        </Box>
                        <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                          <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                            Description :
                          </Typography>

                          <Form.Control
                            controlId='description'
                            type='text'
                            size='sm'
                            name='description'
                            placeholder='description '
                            rows={3}
                            accepter={Textarea}
                            value={formValue.description}
                          />
                        </Box>
                        <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                          <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                            Resolution number :
                          </Typography>
                          <Form.Control
                            controlId='resolution_number'
                            type='number'
                            size='sm'
                            name='resolution_number'
                            placeholder='resolution Number'
                            value={formValue.resolution_number}
                          />
                        </Box>
                      </Grid>
                    </Grid>
                    <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 40, mt: 5 }}>
                      {!loading && (
                        <>
                          {action == 'add' && (
                            <Button color='success' onClick={handleSubmit} variant='contained' sx={{ mr: 3 }}>
                              Save
                            </Button>
                          )}
                          {action == 'edit' && (
                            <Button color='success' onClick={handleSubmit} variant='contained' sx={{ mr: 3 }}>
                              Update
                            </Button>
                          )}
                          <Button type='button' color='warning' variant='contained' sx={{ mr: 3 }} onClick={close}>
                            Close
                          </Button>
                        </>
                      )}
                    </Box>
                  </Grid>
                </Form>
              </Grid>
              {!selectedEmployee ? null : (
                <Grid item xs={12} sm={3} md={3}>
                  <div className='flex'>
                    <ChartCard
                      count={+selectedEmployee.availableJustifiedLeaves}
                      name={'Justified'}
                      taken={+selectedEmployee.takenJustifiedLeaves}
                    />
                    <ChartCard
                      count={+selectedEmployee.availableNotJustifiedLeaves}
                      name={'Not Justified'}
                      taken={+selectedEmployee.takenNotJustifiedLeaves}
                    />
                    <ChartCard
                      count={+selectedEmployee.availableSickLeaves}
                      name={'Sick'}
                      taken={+selectedEmployee.takenSickLeaves}
                    />
                  </div>
                </Grid>
              )}
            </Grid>
            {formValue.employee_id ? (
              <DataGrid
                autoHeight
                rows={leavesDataSource}
                columns={columns}
                pageSize={pageSize}
                disableSelectionOnClick
                rowsPerPageOptions={[10, 25, 50]}
                sx={{ '& .MuiDataGrid-columnHeaders': { borderRadius: 0 } }}
                onPageSizeChange={newPageSize => setPageSize(newPageSize)}
              />
            ) : null}
          </Card>
        </Grid>
      </Grid>
    </>
  )
}

AddLeave.getInitialProps = async ({ query: { id } }) => {
  return { id: id }
}

export default AddLeave
