// ** React Imports
import { useState, SyntheticEvent, useEffect, useRef } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'
import Icon from 'src/@core/components/icon'
import { Divider, Typography } from '@mui/material'

import CustomChip from 'src/@core/components/mui/chip'

import toast from 'react-hot-toast'

// ** Rsuite Imports
import { Form, Schema } from 'rsuite'
import 'rsuite/dist/rsuite.min.css'

// ** Axios Imports
import axios from 'axios'

import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import Loading from 'src/views/loading'
import NoPermission from 'src/views/noPermission'

const { StringType } = Schema.Types

const AddDepartment = ({ popperPlacement, id }) => {
  // ** States
  const [type, setType] = useState()
  const [loadingDescription, setLoadingDescription] = useState('')
  const [tabValue, setTabValue] = useState('Over Time')
  const [form, setForm] = useState(false)
  const [action, setAction] = useState('add')
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const { data: session, status } = useSession
  const formRef = useRef()
  const [formError, setFormError] = useState({})
  const [Errors, setErrors] = useState([])

  const editorRef = useRef()

  // ------------------------- form

  const default_value = {
    timeIn: '',
    timeOut: '',
    availableLate: '',
    availableEarly: '',
    '1st': '',
    '2nd': '',
    '3rd': ''
  }
  const [formValue, setFormValue] = useState({ title: '', times: [{ ...default_value }] })

  // ------------------------------ validate Mmodel ------------------------------------

  const validateMmodel = Schema.Model({
    title: StringType().isRequired('This field is required.')
  })

  // ------------------------------- Submit --------------------------------------

  const valid_input = times => {
    let errors = []

    let i = times.every(function (val) {
      let v = val.timeIn.localeCompare(val.timeOut) == -1
      if (!v) {
        errors.push({ message: 'timeIn timeout', index: val.index + 1 })
      }

      return v
    })

    let j = times.every(function (val) {
      let v =
        val.availableLate.localeCompare(val.timeOut) != 1 &&
        val.availableEarly.localeCompare(val.timeOut) != 1 &&
        val.availableLate.localeCompare(val.timeIn) != -1 &&
        val.availableEarly.localeCompare(val.timeIn) != -1
      if (!v) {
        errors.push({ message: 'availableEarly availableEarly', index: val.index + 1 })
      }

      return v
    })

    let k = times.every(function (val) {
      let v =
        val['1st'].localeCompare(val['2nd']) != 1 &&
        val['2nd'].localeCompare(val['3rd']) != 1 &&
        val.timeOut.localeCompare(val['3rd']) != 1
      if (!v) {
        errors.push({ message: 'over time', index: val.index + 1 })
      }

      return v
    })

    let l = times.every(function (val, index) {
      let v = index == times.length - 1 ? true : val['3rd'].localeCompare(times[index + 1].timeIn) != 1
      if (!v) {
        errors.push({ message: 'time conflect', index: val.index + 1 })
      }

      return v
    })

    return { valid: i && j && k && l, errors: errors }
  }

  const handleSubmit = () => {
    formRef.current.checkAsync().then(result => {
      if (!result.hasError) {
        let times = [...formValue.times].map((val, index) => {
          return { ...val, index: index }
        })
        times = [
          ...times.sort(function (a, b) {
            return a.timeIn.localeCompare(b.timeIn)
          })
        ]

        times = times.map(time => {
          if (time['1st'] == '') {
            time['1st'] = time.timeOut
          }
          if (time['1st'] != '') {
            if (time['2nd'] == '') {
              time['2nd'] = time['1st']
            }
            if (time['3rd'] == '') {
              time['3rd'] = time['2nd']
            }
          }
          if (time.availableLate == '') {
            time.availableLate = time.timeIn
          }
          if (time.availableEarly == '') {
            time.availableEarly = time.timeOut
          }

          return time
        })

        let { valid, errors } = valid_input(times)
        setErrors(errors)

        if (valid) {
          setLoading(true)
          const data = { ...formValue, times: times }
          axios
            .post('/api/shift/add-shift', {
              data
            })
            .then(function (response) {
              router.push('/company-dashboard/attendance/shift')
              toast.success('shift  (' + data.title + ') Inserted Successfully.', {
                delay: 3000,
                position: 'bottom-right'
              })
            })
            .catch(function (error) {
              toast.error('Error : ' + error.response.data.message + ' !', {
                delay: 3000,
                position: 'bottom-right'
              })
              setLoading(false)
            })
        }
      }
    })
  }

  const handleChange = (event, newValue) => {
    setTabValue(newValue)
  }

  // -------------------------------- Routes -----------------------------------------------

  const close = () => {
    router.push('/company-dashboard/attendance/shift')
  }

  const remove = index => {
    if (formValue.times.length > 1) {
      let arr = [...formValue.times]
      arr[index] = { ...default_value }

      arr.splice(index, 1)

      setFormValue({ ...formValue, times: [...arr] })
    } else {
      setFormValue({ ...formValue, times: [{ ...default_value }] })
    }
  }

  const add = () => {
    setFormValue({ ...formValue, times: [...formValue.times, { ...default_value }] })
  }

  const changeValue = (index, e, key) => {
    let val = formValue.times[index]
    val[key] = e
    let formval = formValue
    formval.times[index] = val
    setFormValue(formval)
  }

  // const Textarea = forwardRef((props, ref) => <Input as='textarea' />)

  // ------------------------------ View ---------------------------------

  if (loading) return <Loading header='Please Wait' description={loadingDescription}></Loading>

  if (session && session.user && !session.user.permissions.includes('AddAttendanceShift'))
    return <NoPermission header='No Permission' description='No permission to add shift'></NoPermission>

  return (
    <>
      <Grid item xs={12} sm={6} lg={6}></Grid>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title='Add Shift' sx={{ pb: 0, pt: 2 }} />
            <Divider />
            <Grid container>
              <Grid item xs={12} sm={12} md={12} sx={{ p: 2, px: 5, mb: 5 }}>
                <Form
                  fluid
                  ref={formRef}
                  onChange={setFormValue}
                  onCheck={setFormError}
                  formValue={formValue}
                  // onChange={formValue => setFormValue(formValue)}
                  model={validateMmodel}
                >
                  <Grid container spacing={1} sx={{ px: 5 }}>
                    <Grid item sm={12} md={8}>
                      <small>Title</small>
                      <Form.Control controlId='title' size='sm' name='title' placeholder='Title' />
                    </Grid>
                    <Grid item sm={12} md={4}></Grid>
                    <Grid item sm={12} md={12}>
                      <Typography sx={{ mt: 5, mb: 3 }}>Times</Typography>
                      {formValue.times.map((val, index) => (
                        <Box key={index} sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                          <Grid key={index} container spacing={1}>
                            <Grid item sm={12} md={1.33}>
                              <small>Time in</small>
                              <Form.Control
                                sx={{
                                  '& input[type="time"]::-webkit-calendar-picker-indicator': {
                                    filter:
                                      'invert(78%) sepia(66%) saturate(6558%) hue-rotate(84deg) brightness(27%) contrast(16%)',
                                    paddingRight: '888px'
                                  }
                                }}
                                size='sm'
                                type='time'
                                name='timeIn'
                                placeholder='Time In'
                                value={val.timeIn}
                                onChange={e => {
                                  changeValue(index, e, 'timeIn')
                                }}
                              />
                            </Grid>
                            <Grid item sm={12} md={1.33}>
                              <small>Time out</small>
                              <Form.Control
                                sx={{
                                  '& input[type="time"]::-webkit-calendar-picker-indicator': {
                                    filter:
                                      'invert(78%) sepia(66%) saturate(6558%) hue-rotate(84deg) brightness(27%) contrast(16%)',
                                    paddingRight: '888px'
                                  }
                                }}
                                value={val.timeOut}
                                onChange={e => {
                                  changeValue(index, e, 'timeOut')
                                }}
                                size='sm'
                                type='time'
                                name='timeOut'
                                placeholder='Time Out'
                              />
                            </Grid>

                            <Grid item sm={12} md={1.33}>
                              <small>Available late</small>
                              <Form.Control
                                sx={{
                                  '& input[type="time"]::-webkit-calendar-picker-indicator': {
                                    filter:
                                      'invert(78%) sepia(66%) saturate(6558%) hue-rotate(84deg) brightness(27%) contrast(16%)',
                                    paddingRight: '888px'
                                  }
                                }}
                                value={val.availableLate}
                                onChange={e => {
                                  changeValue(index, e, 'availableLate')
                                }}
                                size='sm'
                                type='time'
                                name='availableLate'
                                placeholder='Availabe Late'
                              />
                            </Grid>
                            <Grid item sm={12} md={1.33}>
                              <small>Available early</small>
                              <Form.Control
                                sx={{
                                  '& input[type="time"]::-webkit-calendar-picker-indicator': {
                                    filter:
                                      'invert(78%) sepia(66%) saturate(6558%) hue-rotate(84deg) brightness(27%) contrast(16%)',
                                    paddingRight: '888px'
                                  }
                                }}
                                value={val.availableEarly}
                                onChange={e => {
                                  changeValue(index, e, 'availableEarly')
                                }}
                                size='sm'
                                type='time'
                                name='availableEarly'
                                placeholder='Available Early'
                              />
                            </Grid>

                            {/* <Grid item sm={12} md={1.33}>
                              <small>1st overtime</small>
                              <Form.Control
                                sx={{
                                  '& input[type="time"]::-webkit-calendar-picker-indicator': {
                                    filter:
                                      'invert(78%) sepia(66%) saturate(6558%) hue-rotate(84deg) brightness(27%) contrast(16%)',
                                    paddingRight: '888px'
                                  }
                                }}
                                value={val['1st']}
                                onChange={e => {
                                  changeValue(index, e, '1st')
                                }}
                                size='sm'
                                type='time'
                                name='1st'
                                placeholder='1st Overtime'
                              />
                            </Grid> */}

                            {/* <Grid item sm={12} md={1.33}>
                              <small>2nd overtime</small>
                              <Form.Control
                                sx={{
                                  '& input[type="time"]::-webkit-calendar-picker-indicator': {
                                    filter:
                                      'invert(78%) sepia(66%) saturate(6558%) hue-rotate(84deg) brightness(27%) contrast(16%)',
                                    paddingRight: '888px'
                                  }
                                }}
                                value={val['2nd']}
                                onChange={e => {
                                  changeValue(index, e, '2nd')
                                }}
                                size='sm'
                                type='time'
                                name='2nd'
                                placeholder='2nd Overtime'
                                disabled={!val['1st']}
                              />
                            </Grid> */}

                            {/* <Grid item sm={12} md={1.33}>
                              <small>3rd overtime</small>
                              <Form.Control
                                sx={{
                                  '& input[type="time"]::-webkit-calendar-picker-indicator': {
                                    filter:
                                      'invert(78%) sepia(66%) saturate(6558%) hue-rotate(84deg) brightness(27%) contrast(16%)',
                                    paddingRight: '888px'
                                  }
                                }}
                                value={val['3rd']}
                                onChange={e => {
                                  changeValue(index, e, '3rd')
                                }}
                                size='sm'
                                type='time'
                                name='3rd'
                                placeholder='3rd Overtime'
                                disabled={!val['2nd']}
                              />
                            </Grid> */}

                            {/* <Grid item sm={12} md={1.33}>
                              <IconButton
                                aria-label='capture screenshot'
                                onClick={() => {
                                  remove(index)
                                }}
                                color='error'
                                sx={{ pt: 7 }}
                              >
                                <Icon icon='fluent:delete-28-regular' fontSize={18} />
                              </IconButton>
                              <IconButton aria-label='capture screenshot' onClick={add} color='success' sx={{ pt: 7 }}>
                                <Icon icon='gridicons:add-outline' fontSize={20} />
                              </IconButton>
                            </Grid> */}
                          </Grid>
                        </Box>
                      ))}
                    </Grid>
                    <div style={{ marginTop: '10px', marginBottom: '10px', width: '100%' }}>
                      {Errors.map((err, index1) => {
                        return (
                          <CustomChip
                            key={index1}
                            label={err.message + ' ' + 'sheft number ' + err.index}
                            skin='light'
                            color='error'
                          />
                        )
                      })}
                    </div>
                    <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 40, mt: 5 }}>
                      {!loading && (
                        <>
                          {
                            <Button color='success' onClick={handleSubmit} variant='contained' sx={{ mr: 3 }}>
                              Save
                            </Button>
                          }
                          <Button type='button' color='warning' variant='contained' sx={{ mr: 3 }} onClick={close}>
                            close
                          </Button>
                        </>
                      )}
                    </Box>
                  </Grid>
                </Form>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>
    </>
  )
}

AddDepartment.getInitialProps = async ({ query: { id } }) => {
  return { id: id }
}

export default AddDepartment
