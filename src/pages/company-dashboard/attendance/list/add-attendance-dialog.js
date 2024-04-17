// ** React Imports
import { useState, forwardRef, useEffect } from 'react'

import Loading from 'src/views/loading'

// ** MUI Imports
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Fade from '@mui/material/Fade'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { TimePicker } from '@mui/x-date-pickers'
import { Grid, TextField, Select, MenuItem, InputLabel, FormControl} from '@mui/material'
import toast from 'react-hot-toast'

import axios from 'axios'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

import { Form, SelectPicker  } from 'rsuite'
import 'rsuite/dist/rsuite.min.css'
import attendance from 'src/store/apps/attendance'
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import en from 'date-fns/locale/en-US';
import de from 'date-fns/locale/en-US'; 

const Transition = forwardRef(function Transition(props, ref) {
  return <Fade ref={ref} {...props} />
})

const DialogAddAttendance = ({ open, setOpen }) => {
  const statusData = [{ label: 'active', value: 'active' }]

  // ** States
  const [date, setDate] = useState(new Date())
  const [dataSource, setDataSource] = useState([])
  const [employee, setEmployee] = useState(null)
  const [timeIn, setTimeIn] = useState(new Date())
  const [timeOut, setTimeOut] = useState(new Date())
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleDateChange = (newDate) => {
    setDate(newDate);
  };
  useEffect(() => {
    getEmployees()
  }, [])
  if (!open) {
    return <></>
  }

  const getEmployees = () => {
    setLoading(true)
    axios.get('/api/company-employee', {}).then(res => {
      let arr = []
      res.data.data.map(employee => {
        arr.push({
          label: employee.firstName + ' ' + employee.lastName,
          value: employee.idNo
        })
      })
      setDataSource(arr)
      setLoading(false)
    })
  }

  const handleSubmit = () => {
    if (!employee) {
      toast.error('Error : employee is required', {
        delay: 3000,
        position: 'bottom-right'
      })

      return
    }
    if (loading) {
      return
    }

    const new_data = {
      timeIn: timeIn.toLocaleTimeString(),
      timeOut: timeOut.toLocaleTimeString(),
      date: date,
      status: 'active',
      employee_no: employee
    }
    
    console.log(new_data) ; 

    

    setLoading(true)
    axios
      .post('/api/attendance/add-attendance', {
        ...new_data
      })
      .then(function (response) {
        toast.success('attendance added Successfully.', {
          delay: 3000,
          position: 'bottom-right'
        })
        setLoading(false)
        
        setOpen(false)
      })
      .catch(function (error) {
        toast.error('Error : Error !', {
          delay: 3000,
          position: 'bottom-right'
        })
        setLoading(false)
      })
  }

  return (
    <Dialog
      fullWidth
      open={open}
      maxWidth='md'
      scroll='body'
      onClose={() => setOpen(false)}
      onBackdropClick={() => setOpen(false)}
    >
      {loading ? (
        <Loading header='Please Wait' description='Employee are loading'></Loading>
      ) : (
        <DialogContent sx={{ pb: 6, px: { xs: 8, sm: 15 }, pt: { xs: 8, sm: 12.5 }, position: 'relative' }}>
          <IconButton
            size='small'
            onClick={() => setOpen(false)}
            sx={{ position: 'absolute', right: '1rem', top: '1rem' }}
          >
            <Icon icon='mdi:close' />
          </IconButton>
          <Box sx={{ mb: 8, textAlign: 'center' }}>
            <Typography variant='h5' sx={{ mb: 3, lineHeight: '2rem' }}>
              Add Attendance Information
            </Typography>
          </Box>
          <Grid container mb={3}> 
              <Grid container mb={3} >
                <Grid item xs={6} mb={3} >
                  <FormControl fullWidth>
                    <InputLabel>Employee</InputLabel>
                    <Select
                      value={employee}
                      onChange={e => setEmployee(e.target.value)}
                    >
                        {dataSource.map(option => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item sm={6} xs={12}>
                  
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de} >
                    <DatePicker
                      label="Date"
                      value={date}
                      onChange={handleDateChange}
                    />
                  </LocalizationProvider>
                    
                </Grid>
                <Grid item sm={3} xs={4}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de} >
                      <TimePicker
                        label="Time in"
                        type="time"
                        value={timeIn }
                        onChange={e => setTimeIn(e)}
                        fullWidth
                        ampm={false}
                      />
                  </LocalizationProvider>
                </Grid>
                <Grid item sm={3} xs={4}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de} >
                    <TimePicker
                      label="Time out"
                      type="time"
                      value={timeOut }
                      onChange={e => setTimeOut(e) }
                      fullWidth
                      ampm={false}
                    />
                  </LocalizationProvider>
                </Grid>
                
              </Grid>

          </Grid>

        </DialogContent>
      )}
      <DialogActions sx={{ pb: { xs: 8, sm: 12.5 }, justifyContent: 'start' }}>
        <Button variant='contained' sx={{ mr: 2, ml: 10 }} onClick={() => handleSubmit()}>
          Submit
        </Button>
        <Button variant='outlined' color='secondary' onClick={() => setOpen(false)}>
          Discard
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DialogAddAttendance
