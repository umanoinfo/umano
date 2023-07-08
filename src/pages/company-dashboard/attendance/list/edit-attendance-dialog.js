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

import toast from 'react-hot-toast'

import axios from 'axios'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

import { Form, SelectPicker, DatePicker } from 'rsuite'
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

  console.log(new_date_in[1] , new_date_out[1] )

  // new_date = new_date.toString()

  // console.log(attendance.timeIn)
  // let arr = [attendance.timeIn.split(':')]

  // let time_in = new Date(new_date).setHours(arr[0])
  // console.log(time_in)

  const statusData = [{ label: 'active', value: 'active' }]

  // ** States
  const [date, setDate] = useState(new Date(new_date_in))
  const [timeIn , setTimeIn] = useState(new Date(new_date_in))
  const [timeOut , setTimeOut] = useState(new Date(new_date_out))
  const [status, setStatus] = useState(attendance.status)

  if (!open) {
    return <></>
  }

  const handleSubmit = () => {
    const new_data = { ...attendance, timeIn: timeIn.toLocaleTimeString(), timeOut : timeOut.toLocaleTimeString() , date: date, status: status }
    const { employee_info, ...data } = new_data

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
                    value={attendance.employee_info[0].firstName + ' ' + attendance.employee_info[0].lastName}
                    name='user name'
                    placeholder='user name'
                    disabled
                  />
                </Form.Group>
              </div>
            </Grid>

            <Grid container spacing={2}>
            <Grid item sm={6} xs={12}>
                <div>
                  <Form.Group>
                    <small>Date</small>
                    <DatePicker
                      format='yyyy-MM-dd'
                      size='md'
                      onChange={e => {
                        setDate(e)
                      }}
                      value={date}
                      name='Date'
                      block
                    />
                  </Form.Group>
                </div>
              </Grid>
              <Grid item sm={3} xs={4}>
                <div>
                  <Form.Group>
                    <small>Time in</small>
                    <DatePicker
                      format='HH:mm:SS'
                      size='md'
                      onChange={e => {
                        setTimeIn(e)
                      }}
                      value={timeIn}
                      name='Date'
                      block
                    />
                  </Form.Group>
                </div>
              </Grid>
              <Grid item sm={3} xs={4}>
                <div>
                  <Form.Group>
                    <small>Time out</small>
                    <DatePicker
                      format='HH:mm:SS'
                      size='md'
                      onChange={e => {
                        setTimeOut(e)
                      }}
                      value={timeOut}
                      name='Date'
                      block
                    />
                  </Form.Group>
                </div>
              </Grid>
            </Grid>
 


          </Grid>
        </Form>
      </DialogContent>
      <DialogActions sx={{ pb: { xs: 8, sm: 12.5  }, justifyContent: 'start' }}>
        <Button variant='contained' sx={{ mr: 2 , ml:10 }} onClick={() => handleSubmit()}>
          Submit
        </Button>
        <Button variant='outlined' color='secondary' onClick={() => setOpen(false)}>
          Discard
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DialogEditAttendance
