// ** MUI Imports
import MuiChip from '@mui/material/Chip'

// ** React Imports
import { useEffect, useRef, useState } from 'react'

// ** Next Import
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { DatePicker, Form, InputNumber, Schema, SelectPicker } from 'rsuite'
import { useRouter } from 'next/router'

// ** Custom Components Imports
import { styled } from '@mui/material/styles'
import {
  Card,
  CardActions,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  ListItemSecondaryAction,
  Paper
} from '@mui/material'

// ** React Imports
import { Fragment } from 'react'

import { SalaryChange } from 'src/local-db'

// ** MUI Imports
import List from '@mui/material/List'
import Divider from '@mui/material/Divider'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import ListItemButton from '@mui/material/ListItemButton'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Axios Imports
import axios from 'axios'
import { toast } from 'react-hot-toast'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Actions Imports
import { fetchData } from 'src/store/apps/companyEmployee'
import { DataGrid } from '@mui/x-data-grid'

const { StringType } = Schema.Types

// Styled Grid component
const StyledGrid1 = styled(Grid)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  [theme.breakpoints.down('md')]: {
    paddingTop: '0 !important'
  },
  '& .MuiCardContent-root': {
    padding: theme.spacing(3, 4.75),
    [theme.breakpoints.down('md')]: {
      paddingTop: 0
    }
  }
}))

// Styled Grid component
const StyledGrid2 = styled(Grid)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  [theme.breakpoints.up('md')]: {
    paddingLeft: '0 !important'
  },
  [theme.breakpoints.down('md')]: {
    order: -1
  }
}))

// Styled component for the image
const Img = styled('img')(({ theme }) => ({
  height: '11rem',
  borderRadius: theme.shape.borderRadius
}))

const StepAttendance = ({ handleNext, employee, getEmployee, shifts }) => {
  const [employeeId, setEmployeeId] = useState('')
  const [plan, setPlan] = useState('')
  const [userStatus, setUserStatus] = useState('')
  const [value, setValue] = useState('')
  const [form, setForm] = useState(false)
  const [action, setAction] = useState('add')
  const [positionChangeType, setPositionChangeType] = useState()
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const [positionChangeStartTypes, setPositionChangeStartTypes] = useState([])
  const [shiftsOptions, setShiftsOptions] = useState([])
  const [selectedShift, setSelectedShift] = useState()
  const [selectedShiftID, setSelectedShiftID] = useState()
  const [selectedTimes, setSelectedTimes] = useState([])

  const [salaryChanges, setSalaryChanges] = useState()
  const [salaryChange, setSalaryChange] = useState()
  const [startChangeDate, setStartChangeDate] = useState(new Date().toISOString().substring(0, 10))
  const formRef = useRef()
  const [formError, setFormError] = useState()

  const dispatch = useDispatch()
  const router = useRouter() ;

  const default_value = {
    availablePaidLeave: 14,
    availableUnpaidLeave: 30,
    availableSickLeave: 90,
    availableParentalLeave: 105,

    // availableSickLeave: 30,
    // availableMaternityLeave: 60,
    // availableParentalLeave: 7,
  }
  const [formValue, setFormValue] = useState(default_value)

  // ------------------------------ validate Mmodel ------------------------------------

  const validateMmodel = Schema.Model({
    title: StringType().isRequired('This field is required.'),
    type: StringType().isRequired('This field is required.')
  })

  // ----------------------- bulid -----------------------------

  useEffect(() => {
    if (!employee) {
      return (
        <>
          <Typography
            sx={{
              mt: 2,
              mb: 3,
              px: 2,
              fontWeight: 400,
              fontSize: 15,
              color: 'red',
              textAlign: 'center',
              fontStyle: 'italic'
            }}
          >
            You must insert employee ..
          </Typography>
        </>
      )
    } else {
        getOptions()
    }
       // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])




  // ----------------------------- Get Options ----------------------------------

  const getOptions = async () => {
    let tempShift = []
    if (shifts) {
      shifts.map(e => {
        tempShift.push({ label: e.title, value: e._id })
      })

      setShiftsOptions(tempShift)
      console.log(shifts);
      setSelectedShift(shifts.find(x => x._id == employee.shift_id))
      if (employee.shift_id && shifts && shifts?.find && shifts[0]  && shifts[0]._id != undefined) {
        setSelectedShiftID(employee.shift_id)
        setSelectedTimes(shifts.find(x => x._id == employee.shift_id).times[0])
        setFormValue({
          availablePaidLeave: employee.availablePaidLeave,
          availableUnpaidLeave: employee.availableUnpaidLeave,
          availableSickLeave: employee.availableSickLeave,
          availableMaternityLeave: employee.availableMaternityLeave,
          availableParentalLeave: employee.availableParentalLeave
        })
      }
    }
  }

  // ------------------------------- Submit --------------------------------------

  const handleSubmit = () => {
    setLoading(true);
    if (!selectedShift) {
      toast.error('Error : ' + ' No selected shift' + ' !', {
        delay: 3000,
        position: 'bottom-right'
      })
      
      return
    }
    let data = {}
    data._id = employee._id
    data.shift_id = selectedShift._id

    data.availablePaidLeave = formValue.availablePaidLeave
    data.availableUnpaidLeave = formValue.availableUnpaidLeave
    data.availableSickLeave = formValue.availableSickLeave
    data.availableMaternityLeave = formValue.availableMaternityLeave
    data.availableParentalLeave = formValue.availableParentalLeave

    axios
      .post('/api/company-employee/edit-shift/', {
        data
      })
      .then(e => {
        getEmployee(3).then(() => {
          toast.success('Shift Updated Successfully.', {
            delay: 3000,
            position: 'bottom-right'
          })
          setLoading(false)
        })
      }).catch((err)=>{})
  }

  const changeShift = e => {
    setSelectedShift(shifts.find(x => x._id == e))
    setSelectedShiftID(shifts.find(x => x._id == e)._id)
    setSelectedTimes(shifts.find(x => x._id == e).times[0])
  }

  // ------------------------------- handle Edit --------------------------------------

  if (!employee) {
    return <Typography  sx={{mt: 2,mb: 3,px: 2,fontWeight: 400,fontSize: 15,color: 'red',textAlign: 'center',fontStyle: 'italic'}}>You must insert employee ..</Typography>
  }
  
  return (
    <Grid spacing={6}>
      <Grid item xs={12} lg={12}>
        <Grid container spacing={1}>
          {/* --------------------------- View ------------------------------------ */}
          <Typography sx={{ mt: 2, mb: 3, px: 2, fontWeight: 600, fontSize: 20, color: 'blue' }} style={{cursor:'pointer'}} onClick={()=>router.push('/company-dashboard/attendance/list')}>Attendance</Typography>
          <Grid xs={12} md={7} lg={12} sx={{ px: 1, mt: 2 }}>
            <small>Change Shift</small>

            <SelectPicker
              data={shiftsOptions}
              value={selectedShiftID}
              onChange={e => {
                changeShift(e)
              }}
              block
            />

            {selectedTimes.timeIn && (
              <Card xs={12} md={12} lg={12} sx={{ mt: 3 }}>
                <Grid item sm={12} md={12}>
                  <Typography sx={{ mt: 2, mb: 3, px: 2, fontWeight: 600 }}>Times</Typography>
                  {selectedTimes.timeIn && (
                    <Box sx={{ p: 2, mb: 1, display: 'flex', alignItems: 'center' }}>
                      <Grid container spacing={1}>
                        <Grid item sm={12} md={1.7}>
                          <small>Time in</small>
                          <Typography sx={{ mb: 3, fontWeight: 500 }}>{selectedTimes.timeIn}</Typography>
                        </Grid>
                        <Grid item sm={12} md={1.7}>
                          <small>Time out</small>
                          <Typography sx={{ mb: 3, fontWeight: 500 }}>{selectedTimes.timeOut}</Typography>
                        </Grid>

                        <Grid item sm={12} md={1.7}>
                          <small>Max Time in</small>
                          <Typography sx={{ mb: 3, fontWeight: 500 }}>{selectedTimes.availableLate}</Typography>
                        </Grid>
                        <Grid item sm={12} md={1.7}>
                          <small>Min Time out</small>
                          <Typography sx={{ mb: 3, fontWeight: 500 }}>{selectedTimes.availableEarly}</Typography>
                        </Grid>

                        {/* <Grid item sm={12} md={1.7}>
                          <small>1st overtime</small>
                          <Typography sx={{ mb: 3, fontWeight: 500 }}>{selectedTimes['1st']}</Typography>
                        </Grid> */}
                        {/* <Grid item sm={12} md={1.7}>
                          <small>2nd overtime</small>
                          <Typography sx={{ mb: 3, fontWeight: 500 }}>{selectedTimes['2nd']}</Typography>
                        </Grid> */}
                        {/* <Grid item sm={12} md={1.7}>
                          <small>3rd overtime</small>
                          <Typography sx={{ mb: 3, fontWeight: 500 }}>{selectedTimes['3rd']}</Typography>
                        </Grid> */}
                      </Grid>
                    </Box>
                  )}
                </Grid>
              </Card>
            )}
            {selectedTimes.timeIn && (
              <>
                <Divider sx={{ pt: 2 }}></Divider>
                <small>Available Leaves</small>
                <Form
                  fluid
                  ref={formRef}
                  onChange={setFormValue}
                  onCheck={setFormError}
                  formValue={formValue}
                  model={validateMmodel}
                >

                  <Grid container spacing={1} sx={{ px: 2, mt: 3 }}>
                    <Grid item sm={12} md={3}>
                      <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                        <Typography variant='body2' sx={{  width: '100%' }}>
                          Paid :
                        </Typography>
                        <Form.Control
                          controlId='availablePaidLeave'
                          size='sm'
                          type='number'
                          name='availablePaidLeave'
                          placeholder='Paid leave'
                        />
                        <Typography variant='body2' sx={{ ml: 2, width: '100%' }}>
                          day
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item sm={12} md={3}>
                      <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                        <Typography variant='body2' sx={{  width: '100%' }}>
                          Unpaid :
                        </Typography>
                        <Form.Control
                          controlId='availableUnpaidLeave'
                          type='number'
                          size='sm'
                          name='availableUnpaidLeave'
                          placeholder='Unpaid Leave'
                        />
                        <Typography variant='body2' sx={{ ml: 2, width: '100%' }}>
                          day
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item sm={12} md={3}>
                      <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                        <Typography variant='body2' sx={{  width: '100%' }}>
                          Sick :
                        </Typography>
                        <Form.Control
                          controlId='availableSickLeave'
                          type='number'
                          size='sm'
                          name='availableSickLeave'
                          placeholder='Sick'
                          sx={{ mr: 1, width: '100%' }}
                        />
                        <Typography variant='body2' sx={{ ml: 2, width: '100%' }}>
                          day
                        </Typography>
                      </Box>
                    </Grid>
                    { employee.gender == 'female' && <Grid item sm={12} md={3}>
                      <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                        <Typography variant='body2' sx={{  width: '100%' }}>
                        Maternity :
                        </Typography>
                        <Form.Control
                          controlId='availableMaternityLeave'
                          type='number'
                          size='sm'
                          name='availableMaternityLeave'
                          placeholder='Maternity Leave'
                          sx={{ mr: 1, width: '100%' }}
                        />
                        <Typography variant='body2' sx={{ ml: 2, width: '100%' }}>
                          day
                        </Typography>
                      </Box>
                    </Grid>}
                    { employee.gender == 'male' && <Grid item sm={12} md={3}>
                      <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                        <Typography variant='body2' sx={{  width: '100%' }}>
                        Parental :
                        </Typography>
                        <Form.Control
                          controlId='availableParentalLeave'
                          type='number'
                          size='sm'
                          name='availableParentalLeave'
                          placeholder='Parental Leave'
                          sx={{ mr: 1, width: '100%' }}
                        />
                        <Typography variant='body2' sx={{ ml: 2, width: '100%' }}>
                          day
                        </Typography>
                      </Box>
                    </Grid>}
                  </Grid>
                </Form>
              </>
            )}
            <Box sx={{ display: 'flex', alignItems: 'right', minHeight: 40, mt: 7 }}>
              {!loading && (
                <>
                  {selectedTimes.timeIn && (
                    <Button color='success' onClick={handleSubmit} variant='contained' sx={{ mr: 3 }}>
                      Save
                    </Button>
                  )}
                  {/* <Button type='button' color='warning' variant='contained' sx={{ mr: 3 }} onClick={() => cancel()}>
                    Cancel
                  </Button> */}
                </>
              )}
            </Box>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default StepAttendance
