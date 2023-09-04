// ** React Imports
import { useState, forwardRef, useEffect } from 'react'

import Loading from 'src/views/loading'

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
          <Form>
            <Grid container mb={3}>
              {/* <Grid item>
              <div>
                <Form.Group>
                  <small>Employee Name</small>
                  <Form.Control size='md' value={''} name='user name' placeholder='user name' disabled />
                </Form.Group>
              </div>
            </Grid> */}
              <Grid item xs={6} mb={3}>
                <small>Employee</small>
                <Form.Control
                  size='sm'
                  controlId='employee_id'
                  name='employee_id'
                  accepter={SelectPicker}
                  data={dataSource}
                  block
                  value={employee}
                  onSelect={setEmployee}
                />
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
                        format='HH:mm'
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
                        format='HH:mm'
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
