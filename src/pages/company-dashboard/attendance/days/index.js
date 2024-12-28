// ** React Imports
import { useState, useRef, useEffect } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'

import {
  Breadcrumbs,
  Divider,
  FormControl,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Select,
  Tab,
  TextField,
  Typography
} from '@mui/material'

import Icon from 'src/@core/components/icon'

import toast from 'react-hot-toast'

// ** Rsuite Imports
import { DatePicker } from '@mui/x-date-pickers'
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import en from 'date-fns/locale/en-GB';;

import { CheckboxGroup, Checkbox, Form, Schema, Input, SelectPicker } from 'rsuite'
import 'rsuite/dist/rsuite.min.css'

// ** Axios Imports
import axios from 'axios'

// ** Store Imports
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import Loading from 'src/views/loading'
import NoPermission from 'src/views/noPermission'
import Link from 'next/link'

const { ArrayType } = Schema.Types

const AddDepartment = ({ popperPlacement, id }) => {
  // ** States
  const [loadingDescription, setLoadingDescription] = useState('')
  const [action, setAction] = useState('add')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { data: session, status } = useSession()
  const formRef = useRef()
  const [formError, setFormError] = useState()
  const [weekStart, setWeekStart] = useState();

  // --------------forms values--------------------------------

  const default_value = {
    working_days: [],
    holidays: []
  }

  useEffect(() => {
    getMyCompany()
  }, [])

  const [formValue, setFormValue] = useState({ ...default_value })
  const [MyCompany, setMyCompany] = useState()

  const getMyCompany = () => {
    setLoading(true);
    axios.get('/api/attendance/days', {}).then(res => {
      let val = res.data.data[0]
      if (!val.working_days) {
        val.working_days = []
      }
      if (!val.holidays) {
        val.holidays = []
      } else {
        val.holidays = val.holidays.map(h => {
          return { ...h, date: new Date(h.date) }
        })
      }
      setFormValue({ working_days: val.working_days, holidays: val.holidays })
      setWeekStart(val.weekStart)
      setMyCompany(val)
      setLoading(false);
    }).catch((err) => { })
  }

  const default_newHoliday = {
    name: '',
    fromDate: null,
    toDate: null
  }
  const [NewHoliday, setNewHoliday] = useState({ ...default_newHoliday })

  // ------------------------------ validate Mmodel ------------------------------------

  const validateMmodel = Schema.Model({
    working_days: ArrayType()
      .minLength(1, 'Please select at least 1 working days.')
      .isRequired('This field is required.')
  })

  // ------------------------------- Submit --------------------------------------

  const handleSubmit = () => {
    formRef.current.checkAsync().then(result => {
      if (!result.hasError) {
        let data = { ...MyCompany, ...formValue, weekStart }

        console.log(formValue);
        setLoading(true)

        axios
          .post('/api/attendance/days/edit-days', {
            data
          })
          .then(function (response) {
            // router.push('/company-dashboard/form')
            toast.success('holidays Inserted Successfully.', {
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

  // -------------------------------- Routes -----------------------------------------------

  const close = () => {
    router.push('/company-dashboard/attendance/list/')
  }

  const addHoliday = () => {
    console.log(NewHoliday);
    if (NewHoliday.name && NewHoliday.fromDate && NewHoliday.toDate) {
      let from = new Date(NewHoliday.fromDate);

      let dates = [];
      while (from.getTime() <= (new Date(NewHoliday.toDate)).getTime()) {
        dates.push({ date: new Date(from.getTime() + from.getTimezoneOffset() * 60000), name: NewHoliday.name });
        console.log(from);
        from = new Date(from.getTime() + 1000 * 60 * 60 * 24);
        console.log(from);
      }
      setFormValue({ ...formValue, holidays: [...formValue.holidays, ...dates] })
      setNewHoliday({ ...default_newHoliday })
    }
  }

  const remove = index => {
    let v = [...formValue.holidays]
    v.splice(index, 1)
    setFormValue({ ...formValue, holidays: [...v] })
  }

  // ------------------------------ View ---------------------------------

  if (loading) return <Loading header='Please Wait' description={loadingDescription}></Loading>

  if (session && session.user && !session.user.permissions.includes('ViewAttendanceDays'))
    return <NoPermission header='No Permission' description='No permission to View Attendance Days'></NoPermission>

  return (
    <>
      <Grid item xs={12} sm={6} lg={6}></Grid>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <Breadcrumbs aria-label='breadcrumb' sx={{ pb: 0, p: 3 }}>
              <Link underline='hover' color='inherit' href='/'>
                Home
              </Link>
              <Typography color='text.primary' sx={{ fontSize: 18, fontWeight: '500' }}>
                Days Definition
              </Typography>
            </Breadcrumbs>
            <CardHeader title='Days Definition' sx={{ pb: 0, pt: 2 }} />
            <Divider />
            <Grid container>
              <Grid item xs={12} sm={12} md={12} sx={{ p: 2, px: 5, mb: 5 }}>
                <Form
                  fluid
                  ref={formRef}
                  onChange={setFormValue}
                  onCheck={setFormError}
                  formValue={formValue}
                  model={validateMmodel}
                >
                  <Grid container spacing={1} sx={{ px: 5, mt: 4 }}>
                    <Form.Group controlId='working_days'>
                      <Typography sx={{ mb: 1, fontWeight: '500' }}>Working Days:</Typography>
                      <Form.Control name='working_days' accepter={CheckboxGroup} inline>
                        <Checkbox value='Saturday'>Saturday</Checkbox>
                        <Checkbox value='Sunday'>Sunday</Checkbox>
                        <Checkbox value='Monday'>Monday</Checkbox>
                        <Checkbox value='Tuesday'>Tuesday</Checkbox>
                        <Checkbox value='Wednesday'>Wednesday</Checkbox>
                        <Checkbox value='Thursday'>Thursday</Checkbox>
                        <Checkbox value='Friday'>Friday</Checkbox>
                      </Form.Control>
                    </Form.Group>
                    <Grid item size='sm' sm={12} md={12} sx={{ mt: 1, mb: 8 }}>
                      <Form.Group>
                        <Typography sx={{ mb: 1, fontWeight: '500' }}>Working Days:</Typography>
                        <FormControl>
                          <SelectPicker
                            size='md'
                            name='week_start'
                            placeholder="Week start"
                            value={weekStart}
                            data={[
                              { value: 'Saturday' },
                              { value: 'Sunday' },
                              { value: 'Monday' },
                              { value: 'Tuesday' },
                              { value: 'Wednesday' },
                              { value: 'Thursday' },
                              { value: 'Friday' },
                            ]}

                            onChange={(e) => {
                              setWeekStart(e)
                            }}

                            style={{ width: '200px' }}
                            labelKey='value'
                            valueKey='value'
                            block
                          />
                        </FormControl>
                      </Form.Group>
                    </Grid>
                    <Grid item size='sm' sm={12} md={12} sx={{ mt: 1, mb: 8 }}>
                      <Typography sx={{ mb: 1, fontWeight: '500' }}>Holiday Days:</Typography>
                      <Grid item sm={12} md={5}>
                        <Card sx={{ p: 3, width: '640px' }}>
                          <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={en} >
                              <div>
                                <Typography sx={{ mb: 0, fontWeight: '200' }}>From:</Typography>
                                <DatePicker

                                  value={NewHoliday.fromDate}
                                  onChange={e => {
                                    setNewHoliday({ ...NewHoliday, fromDate: e })
                                  }}
                                  views={['month', 'day']}
                                  sx={{ mr: 1, mt: 0, width: '150px' }}
                                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                                /></div>
                              <div>
                                <Typography sx={{ mb: 0, fontWeight: '200' }}>To:</Typography>
                                <DatePicker

                                  value={NewHoliday.toDate}
                                  onChange={e => {
                                    setNewHoliday({ ...NewHoliday, toDate: e })
                                  }}
                                  views={['month', 'day']}
                                  sx={{ mr: 1, width: '150px' }}
                                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                                /></div>
                            </LocalizationProvider>
                            <div>
                              <Typography sx={{ mb: 0, fontWeight: '200' }}>Holiday title:</Typography>
                              <Input
                                size='sm'
                                placeholder='Holiday title'
                                value={NewHoliday.name}
                                sx={{ mr: 2, width: '150px' }}
                                style={{ height: '2.5rem' }}
                                onChange={e => {
                                  setNewHoliday({ ...NewHoliday, name: e })
                                }}
                              />
                            </div>
                            <div>
                              <Typography sx={{ mb: 0, fontWeight: '200' }}>.</Typography>
                              <Button variant='outlined' size='small' style={{ ml: 3, pl: 5, height: '2.5rem' }} onClick={addHoliday}>
                                Add
                              </Button>
                            </div>
                          </Box>
                          <List>
                            {formValue.holidays.map((holiday, index) => {
                              return (
                                <ListItem key={index}>
                                  <ListItemText
                                    primary={
                                      <>
                                        <span style={{ color: 'blue', paddingRight: 20 }}>
                                          {holiday.date.toLocaleDateString().slice(0, holiday.date.toLocaleDateString().lastIndexOf('/'))}
                                        </span>{' '}
                                        <span>{holiday.name}</span>
                                      </>
                                    }
                                  />
                                  <ListItemSecondaryAction>
                                    <IconButton
                                      edge='end'
                                      onClick={() => {
                                        remove(index)
                                      }}
                                    >
                                      <Icon icon='fluent:delete-12-regular' />
                                    </IconButton>
                                  </ListItemSecondaryAction>
                                </ListItem>
                              )
                            })}
                          </List>
                        </Card>
                      </Grid>
                    </Grid>

                    <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 40, mt: 5 }}>
                      {!loading && (
                        <>
                          {action == 'add' &&
                            session &&
                            session.user &&
                            session.user.permissions.includes('AddAttendanceDays') && (
                              <Button color='success' onClick={handleSubmit} variant='contained' sx={{ mr: 3 }}>
                                Save
                              </Button>
                            )}
                          {action == 'edit' && session.user && session.user.permissions.includes('EditAttendanceDays') && (
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
