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

const Transition = forwardRef(function Transition(props, ref) {
  return <Fade ref={ref} {...props} />
})

const DialogEditAttendance = ({ open, setOpen, employee, setupdate }) => {
  let new_date = employee.date.split('T')
  new_date[1] = employee.time
  new_date = new_date.toString()

  const statusData = [{ label: 'active', value: 'active' }]

  // ** States
  const [date, setDate] = useState(new Date(new_date))
  const [status, setStatus] = useState(employee.status)

  if (!open) {
    return <></>
  }

  const handleSubmit = () => {
    const new_data = { ...employee, time: date.toLocaleTimeString(), date: date, status: status }
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
      onClose={() => setOpen(false)}
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
          <Grid container spacing={6}>
            <Grid item xs={6}>
              <div>
                <Form.Group>
                  <label>Employee Name :</label>
                  <Form.Control
                    size='lg'
                    value={employee.employee_info[0].firstName + ' ' + employee.employee_info[0].lastName}
                    name='user name'
                    placeholder='user name'
                    disabled
                  />
                </Form.Group>
              </div>
            </Grid>
            <Grid item sm={6} xs={12}>
              <div>
                <Form.Group>
                  <small>Date</small>
                  <DatePicker
                    format='yyyy-MM-dd'
                    size='lg'
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
            <Grid item sm={6} xs={12}>
              <div>
                <Form.Group>
                  <small>Time</small>
                  <DatePicker
                    format='hh:mm:ss'
                    size='lg'
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
            <Grid item sm={6} xs={12}>
              <small>Status</small>
              <Form.Group>
                <SelectPicker size='lg' name='status' onChange={setStatus} value={status} data={statusData} block />
              </Form.Group>
            </Grid>
          </Grid>
        </Form>
      </DialogContent>
      <DialogActions sx={{ pb: { xs: 8, sm: 12.5 }, justifyContent: 'start' }}>
        <Button variant='contained' sx={{ mr: 2 }} onClick={() => handleSubmit()}>
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
