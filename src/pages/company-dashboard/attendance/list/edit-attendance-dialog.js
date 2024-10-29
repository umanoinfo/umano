// ** React Imports
import { useState, forwardRef } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Fade from '@mui/material/Fade'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import { TextField, Select, MenuItem, InputLabel, FormControl, Divider} from '@mui/material'
import { TimePicker } from '@mui/x-date-pickers'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'


import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import en from 'date-fns/locale/en-US';
import toast from 'react-hot-toast'

import axios from 'axios'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

import { Form, SelectPicker  } from 'rsuite'
import 'rsuite/dist/rsuite.min.css'
import attendance from 'src/store/apps/attendance'

const Transition = forwardRef(function Transition(props, ref) {
  return <Fade ref={ref} {...props} />
})

const DialogEditAttendance = ({ open, setOpen, attendance, setupdate , updateData }) => {

  let new_date_in = attendance.date.split('T')
  new_date_in[1] = attendance.timeIn

  let new_date_out = attendance.date.split('T')
  new_date_out[1] = attendance.timeOut

  new_date_in = new_date_in.join('T') + '.000Z';
  new_date_out = new_date_out.join('T') + '.000Z';
  
  const statusData = [{ label: 'active', value: 'active' }]
  
  // ** States
  const [date, setDate] = useState(new Date(new_date_in))
  const [timeIn , setTimeIn] = useState(new Date(new_date_in))
  const [timeOut , setTimeOut] = useState(new Date(new_date_out ))
  const [originalTimeIn , setOriginalTimeIn ] = useState(new Date(attendance.date.split('T')[0] + 'T' + attendance.originalTimeIn + '.000Z' ));
  const [originalTimeOut , setOriginalTimeOut ] = useState(new Date(attendance.date.split('T')[0] + 'T' + attendance.originalTimeOut + '.000Z' ));
  console.log(originalTimeIn , originalTimeOut, timeIn , timeOut );
  const [status, setStatus] = useState(attendance.status)
  console.log(attendance);

  if (!open) {
    return <></>
    originalTimeIn
  }

  const returnToOriginal = ()=>{

    setTimeIn(originalTimeIn);
    setTimeOut(originalTimeOut);
  }

  const handleSubmit = () => {
    let  new_data = { ...attendance, timeIn: timeIn.toLocaleTimeString(), timeOut : timeOut.toLocaleTimeString() , date: date, status: status }
    let { employee_info, ...data } = new_data
    delete data.shift_info ;
    axios
      .post('/api/attendance/edit-attendance', {
        data
      })
      .then(function (response) {
        toast.success('attendance updated Successfully.', {
          delay: 3000,
          position: 'bottom-right'
        })
        setupdate(new Date())
        console.log(response.data)
        updateData()
        setOpen(false)
      })
      .catch(function (error) {
        toast.error('Error : Error !', {
          delay: 3000,
          position: 'bottom-right'
        })
      })
  }

  return (
    <Dialog
      fullWidth
      open={open}
      maxWidth='md'
      scroll='body'
      onClose={() => setOpen(false) }
      onBackdropClick={() => setOpen(false)}
    >
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
            Edit Attendance Information
          </Typography>
        </Box>

        <Form>
          <Grid container mb={3}>
            <Grid item xs={6} mb={3}>
              <div>
                <Form.Group>
                  <small>Employee Name</small>
                  <Form.Control
                    size='md'
                    value={attendance?.employee_info?.[0]?.firstName + ' ' + attendance?.employee_info?.[0]?.lastName}
                    name='user name'
                    placeholder='user name'
                    disabled
                  />
                </Form.Group>
              </div>
            </Grid>
            <Grid item sm={6} xs={12}>
                  
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={en} >
                    <DatePicker
                      label="Date"
                      value={date}
                      onChange={e => setDate(e)}
                      disabled
                    />
                  </LocalizationProvider>
                    
                </Grid>
            <Grid container spacing={2}>
              <Grid container spacing={2}>
               
                <Grid item sm={3} xs={4}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={en} >
                      <TimePicker
                        label="Original Time in"
                        type="time"
                        value={(originalTimeIn) }
                        onChange={e => setTimeIn(e)}
                        fullWidth
                        disabled
                        ampm={false}

                      />
                  </LocalizationProvider>
                </Grid>
                <Grid item sm={3} xs={4}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={en} >
                    <TimePicker
                      label="Original Time out"
                      type="time"
                      value={(originalTimeOut) }
                      onChange={e => setTimeOut(e) }
                      fullWidth
                      disabled
                      ampm={false}

                    />
                  </LocalizationProvider>
                </Grid>
                
              </Grid>
            </Grid>

            <Divider  component={'li'} />
            
            ___________________________________________
            
            <Divider  component={'li'} />
            <Grid container spacing={2}>
              <Grid container spacing={2}>
               
                <Grid item sm={3} xs={4}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={en} >
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
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={en} >
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

          </Grid>
        </Form>
      </DialogContent>
      <DialogActions sx={{ pb: { xs: 8, sm: 12.5  }, justifyContent: 'start' }}>
        <Button variant='contained' sx={{ mr: 2 , ml:10 }} onClick={() => handleSubmit()}>
          Submit
        </Button>
        <Button variant='contained' sx={{ mr: 2 , ml:10 }} onClick={() => returnToOriginal()}>
          Return to original
        </Button>
        <Button variant='outlined' color='secondary' onClick={() => setOpen(false)}>
          Discard
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DialogEditAttendance
