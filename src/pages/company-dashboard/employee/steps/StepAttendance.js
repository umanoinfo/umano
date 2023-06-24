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

  const default_value = {
    availableNotJustifiedLeaves: 30,
    availableJustifiedLeaves: 14,
    availableSickLeaves: 30
  }
  const [formValue, setFormValue] = useState(default_value)

  // ------------------------------ validate Mmodel ------------------------------------

  const validateMmodel = Schema.Model({
    title: StringType().isRequired('This field is required.'),
    type: StringType().isRequired('This field is required.')
  })

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
    useEffect(() => {
      getOptions()
    }, [])
  }

  // ----------------------------- Get Options ----------------------------------

  const getOptions = async () => {
    let tempShift = []
    if (shifts) {
      shifts.map(e => {
        tempShift.push({ label: e.title, value: e._id })
      })

      setShiftsOptions(tempShift)
      setSelectedShift(shifts.find(x => x._id == employee.shift_id))
      if (employee.shift_id) {
        setSelectedShiftID(employee.shift_id)
        setSelectedTimes(shifts.find(x => x._id == employee.shift_id).times[0])
        setFormValue({
          availableNotJustifiedLeaves: employee.availableNotJustifiedLeaves,
          availableJustifiedLeaves: employee.availableJustifiedLeaves,
          availableSickLeaves: employee.availableSickLeaves
        })
      }
    }
  }

  // ------------------------------- Submit --------------------------------------

  const handleSubmit = () => {
    if (!selectedShift) {
      toast.error('Error : ' + error.response.data.message + ' !', {
        delay: 3000,
        position: 'bottom-right'
      })
      return
    }
    let data = {}
    data._id = employee._id
    data.shift_id = selectedShift._id
    data.availableNotJustifiedLeaves = formValue.availableNotJustifiedLeaves
    data.availableJustifiedLeaves = formValue.availableJustifiedLeaves
    data.availableSickLeaves = formValue.availableSickLeaves
    axios
      .post('/api/company-employee/edit-shift/', {
        data
      })
      .then(e => {
        getEmployee().then(() => {
          toast.success('Shift Updated Successfully.', {
            delay: 3000,
            position: 'bottom-right'
          })
          setLoading(false)
        })
      })
  }

  const changeShift = e => {
    setSelectedShift(shifts.find(x => x._id == e))
    setSelectedShiftID(shifts.find(x => x._id == e)._id)
    setSelectedTimes(shifts.find(x => x._id == e).times[0])
  }

  // ------------------------------- handle Edit --------------------------------------

  return (
    <Grid spacing={6}>
      <Grid item xs={12} lg={12}>
        <Grid container spacing={1}>
          {/* --------------------------- View ------------------------------------ */}
          <Typography sx={{ mt: 2, mb: 3, px: 2, fontWeight: 600, fontSize: 20, color: 'blue' }}>Attendance</Typography>
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
                          <small>Available late</small>
                          <Typography sx={{ mb: 3, fontWeight: 500 }}>{selectedTimes.availableLate}</Typography>
                        </Grid>
                        <Grid item sm={12} md={1.7}>
                          <small>Available early</small>
                          <Typography sx={{ mb: 3, fontWeight: 500 }}>{selectedTimes.availableEarly}</Typography>
                        </Grid>

                        <Grid item sm={12} md={1.7}>
                          <small>1st overtime</small>
                          <Typography sx={{ mb: 3, fontWeight: 500 }}>{selectedTimes['1st']}</Typography>
                        </Grid>
                        <Grid item sm={12} md={1.7}>
                          <small>2nd overtime</small>
                          <Typography sx={{ mb: 3, fontWeight: 500 }}>{selectedTimes['2nd']}</Typography>
                        </Grid>
                        <Grid item sm={12} md={1.7}>
                          <small>3rd overtime</small>
                          <Typography sx={{ mb: 3, fontWeight: 500 }}>{selectedTimes['3rd']}</Typography>
                        </Grid>
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
                    <Grid item sm={12} md={4}>
                      <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                        <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                          Justified :
                        </Typography>
                        <Form.Control
                          controlId='availableJustifiedLeaves'
                          size='sm'
                          type='number'
                          name='availableJustifiedLeaves'
                          placeholder='Justified'
                        />
                        <Typography variant='body2' sx={{ ml: 2, width: '100%' }}>
                          day
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item sm={12} md={4}>
                      <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                        <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                          Not Justified :
                        </Typography>
                        <Form.Control
                          controlId='availableNotJustifiedLeaves'
                          type='number'
                          size='sm'
                          name='availableNotJustifiedLeaves'
                          placeholder='Not Justified'
                        />
                        <Typography variant='body2' sx={{ ml: 2, width: '100%' }}>
                          day
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item sm={12} md={4}>
                      <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                        <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                          Sick Leave:
                        </Typography>
                        <Form.Control
                          controlId='availableSickLeaves'
                          type='number'
                          size='sm'
                          name='availableSickLeaves'
                          placeholder='Sick'
                          sx={{ mr: 1, width: '100%' }}
                        />
                        <Typography variant='body2' sx={{ ml: 2, width: '100%' }}>
                          day
                        </Typography>
                      </Box>
                    </Grid>
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
