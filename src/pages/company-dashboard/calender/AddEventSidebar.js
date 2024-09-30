// ** React Imports
import { useState, useEffect, useCallback, Fragment, useRef } from 'react'

import { useSession } from 'next-auth/react'

import { EventType } from 'src/local-db'

// ** MUI Imports
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'

import toast from 'react-hot-toast'

import Grid from '@mui/material/Grid'

import axios from 'axios'

import { Form, Schema, Toggle, CheckPicker, Input, Divider } from 'rsuite'

import { MenuItem, Select } from '@mui/material';

import { DatePicker } from '@mui/x-date-pickers'
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import en from 'date-fns/locale/en-US';

import 'rsuite/dist/rsuite.min.css'


import React from 'react';

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Styled Components
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import { useDispatch } from 'react-redux'
import { updateEvent } from 'src/store/apps/calendar'
import { LinearProgress, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material'
import Autocomplete from '@mui/material/Autocomplete'

const capitalize = string => string && string[0].toUpperCase() + string.slice(1)
const Textarea = React.forwardRef((props, ref) => <Input {...props} as="textarea" ref={ref} />);

const defaultState = {
  title: '',
  allDay: true,
  description: '',
  startDate: new Date(),
  endDate: new Date(),
  type: 'Task',
  users: []
}

let defaultUpdateState = {
  title: '',
  allDay: true,
  description: '',
  startDate: new Date(),
  endDate: new Date(),
  type: 'Task',
  users: []
}

const AddEventSidebar = props => {
  // ** Props
  const {
    store,
    drawerWidth,
    handleSelectEvent,
    addEventSidebarOpen,
    handleAddEventSidebarToggle,
    UpdateEvent,
    setUpdateEvent,
    fetchEvents
  } = props

  const [values, setValues] = useState({ ...defaultState })

  // ** States


  const { data: session, status } = useSession()

  const [formError, setFormError] = useState({})
  const [isloading, setIsLoading] = useState(true)
  const [sendingEmails, setSendingEmails] = useState(false)

  const [usersDataSource, setUsersDataSource] = useState([])
  const [typesData, setTypesData] = useState(EventType)
  const [notAuthroized, setNotAuthorized] = useState(false);
  const formRef = useRef()

  const dispatch = useDispatch()

  const handleSidebarClose = async () => {
    setValues(defaultState)
    setUpdateEvent(null)

    // clearErrors()
    dispatch(handleSelectEvent(null))
    handleAddEventSidebarToggle()
  }

  const { StringType, NumberType, DateType, ObjectType } = Schema.Types

  const validateMmodel = Schema.Model({
    title: StringType().isRequired('This field is required.'),
    description: StringType().isRequired('This field is required.')
  })

  useEffect(() => {
    getUsers()
  }, [])

  useEffect(() => {
    if (UpdateEvent) {
      let val = { title: UpdateEvent._def.title, ...UpdateEvent._def.extendedProps }
      val.startDate = new Date(val.startDate)
      val.endDate = new Date(val.endDate)
      setValues({ ...values, ...val })
      defaultUpdateState = val
    }
  }, [UpdateEvent])

  const handleDeleteEvent = () => {
    setIsLoading(true);
    axios
      .post('/api/event/delete-event', { selectedForm: values })
      .then(function (response) {
        sendEmails(response.data.data._id, values.type + ' ' + values.title + ' Canceled').then(() => {
          handleSidebarClose().then(() => {
            setSendingEmails(false), setIsLoading(false)
            setIsLoading(false);
            handleAddEventSidebarToggle();
          })
        })
      })
      .catch(function (error) {
        // handle error
      })
  }

  const getUsers = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/company-employee')
      const { data, message, success } = await res.json()
      if (res.status == 401) {
        setNotAuthorized(true);
      }
      if (!success) {
        throw new Error('Error: Fetching Employees ( ' + message + ' )');
      }

      const users = data.map(user => ({
        label: user.firstName + ' ' + user.lastName + '  (' + user.email + ')',
        value: user._id
      }))
      setUsersDataSource(users)

    }
    catch (err) {
      toast.error(err.toString(), { duration: 5000, position: 'bottom-right' });
    }
    setIsLoading(false)
  }

  const onSubmit = data => {
    formRef.current.checkAsync().then(result => {
      if (!result.hasError) {
        let data = {}
        data = values
        data.status = 'active'
        data.created_at = new Date().toISOString()()
        setIsLoading(true)

        axios
          .post('/api/event/add-event', {
            data
          })
          .then(function (response) {
            toast.success('Event (' + data.title + ') Inserted Successfully.', {
              delay: 3000,
              position: 'bottom-right'
            })
            sendEmails(response.data.data._id, 'New ' + values.type + ' ' + values.title), setSendingEmails(false), setIsLoading(false), handleSidebarClose()
          })
          .catch(function (error) {
            toast.error('Error : Error !', {
              delay: 3000,
              position: 'bottom-right'
            })
          })
      }
    })
  }

  const onSubmitUpdate = data => {
    formRef.current.checkAsync().then(result => {
      if (!result.hasError) {
        setIsLoading(true);
        let data = {}
        data = values
        data.updated_at = new Date()
        axios
          .post('/api/event/edit-event', {
            data
          })
          .then(function (response) {
            toast.success('Event (' + data.title + ') Inserted Successfully.', {
              delay: 3000,
              position: 'bottom-right'
            })
            dispatch(fetchEvents()).then(() => {
              sendEmails(response.data.data._id, 'Update ' + values.type + ' ' + values.title).then(() => {

                handleSidebarClose().then(() => {
                  setSendingEmails(false); setIsLoading(false)
                })
              })

            })
          })
          .catch(function (error) {
            toast.error('Error : ' + error.response.data.message + ' !', {
              delay: 3000,
              position: 'bottom-right'
            })
            setIsLoading(false);
          })
      }
    })
  }

  const resetToStoredValues = () => {
    setValues(defaultUpdateState)
  }

  const resetToEmptyValues = () => {
    setValues(defaultState)
  }

  const sendEmails = (id, subject) => {
    setSendingEmails(true)
    if (values.users) {
      let data = {}
      data.event_id = id
      data.users = values.users
      data.type = values.type
      data.subject = subject
      data.message = values.description
      if (values.startDate == values.endDate) {
        data.date =
          values.type +
          ' at ' +
          new Date(values.startDate).toLocaleString('en-GB', {
            hour12: false
          })
      } else {
        data.date =
          values.type +
          ' from ' +
          new Date(values.startDate).toLocaleString('en-GB', {
            hour12: false
          }) +
          ' to ' +
          new Date(values.endDate).toLocaleString('en-GB', {
            hour12: false
          })
      }
      data.user = session.user.name + ' (' + session.user.email + ')'

      fetch('/api/mail/multi', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' }
      }).then(res => {
        setSendingEmails(false);

        return res.json()
      })
    } else {
      setIsLoading(false)
      setSendingEmails(false)
      handleSidebarClose()
    }
  }

  const RenderSidebarFooter = () => {
    if (!UpdateEvent) {
      return (
        <Fragment>
          <Button size='large' onClick={onSubmit} type='submit' variant='contained' sx={{ mr: 4 }}>
            Add
          </Button>
          <Button size='large' variant='outlined' color='secondary' onClick={resetToEmptyValues}>
            Reset
          </Button>
        </Fragment>
      )
    } else {
      if (session && session.user._id == values.user_id && session.user.permissions.includes('EditEvent'))
        return (
          <Fragment>
            <Button size='large' onClick={onSubmitUpdate} type='submit' variant='contained' sx={{ mr: 4 }}>
              Update
            </Button>
            <Button size='large' variant='outlined' color='secondary' onClick={resetToStoredValues}>
              Reset
            </Button>
          </Fragment>
        )
    }
  }

  return (
    <Drawer
      anchor='right'
      open={addEventSidebarOpen}
      onClose={handleSidebarClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: ['100%', drawerWidth] } }}
    >
      {sendingEmails && (
        <Box>
          <Box
            className='sidebar-header'
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              backgroundColor: 'background.default',
              p: theme => theme.spacing(3, 3.255, 3, 5.255)
            }}
          >
            <Typography variant='h6'>Send Emails</Typography>
          </Box>
          <Box sx={{ px: 5 }}>
            <LinearProgress />
          </Box>
          <Box className='sidebar-body' style={{ overflowY: 'auto' }} sx={{ p: theme => theme.spacing(5, 6) }}>
            <DatePickerWrapper>
              <List dense>
                {values.users &&
                  values.users.map(user => {
                    return (
                      <ListItem key={user.id} disablePadding>
                        <ListItemIcon>
                          <Icon icon='bi:send' fontSize={16} />
                        </ListItemIcon>
                        <ListItemText primary={user} />
                      </ListItem>
                    )
                  })}
                {/* <ListItem disablePadding>
                  <ListItemIcon>
                    <Icon icon='bi:send-x' fontSize={16} style={{ color: 'red' }} />
                  </ListItemIcon>
                  <ListItemText primary='barghouthffsd@gmail.com' />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemIcon>
                    <Icon icon='bi:send-check' fontSize={16} style={{ color: 'green' }} />
                  </ListItemIcon>
                  <ListItemText primary='barguthf@gmail.com' />
                </ListItem> */}
              </List>
            </DatePickerWrapper>
          </Box>
        </Box>
      )}

      {sendingEmails && (
        <Box>
          <Box
            className='sidebar-header'
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              backgroundColor: 'background.default',
              p: theme => theme.spacing(3, 3.255, 3, 5.255)
            }}
          >
            <Typography variant='h6'>Send Emails</Typography>
          </Box>
          <Box sx={{ px: 5 }}>
            <LinearProgress />
          </Box>
          <Box className='sidebar-body' style={{ overflowY: 'auto' }} sx={{ p: theme => theme.spacing(5, 6) }}>
            <DatePickerWrapper>Event is Adding , Please Wait</DatePickerWrapper>
          </Box>
        </Box>
      )}
      {!isloading && (
        <Box>
          <Box
            className='sidebar-header'
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              backgroundColor: 'background.default',
              p: theme => theme.spacing(3, 3.255, 3, 5.255)
            }}
          >
            <Typography variant='h6'>{UpdateEvent ? 'Update Event' : 'Add Event'}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {UpdateEvent &&
                session &&
                session.user._id == values.user_id &&
                session.user.permissions.includes('DeleteEvent') ? (
                <IconButton
                  size='small'
                  onClick={handleDeleteEvent}
                  sx={{ color: 'text.primary', mr: store.selectedEvent !== null ? 1 : 0 }}
                >
                  <Icon icon='mdi:delete-outline' fontSize={20} />
                </IconButton>
              ) : null}
              <IconButton size='small' onClick={handleSidebarClose} sx={{ color: 'text.primary' }}>
                <Icon icon='mdi:close' fontSize={20} />
              </IconButton>
            </Box>
          </Box>
          <Box className='sidebar-body' style={{ overflowY: 'auto' }} sx={{ p: theme => theme.spacing(5, 6) }}>
            <DatePickerWrapper>
              <Form fluid
                ref={formRef}
                onCheck={setFormError}
                model={validateMmodel}
                formValue={values}>

                <Grid container spacing={3}>
                  <Grid item sm={12} xs={12} mt={2}>
                    <Form.Group>
                      <small>Title</small>
                      <Form.Control
                        size='md'
                        onChange={e => {
                          setValues({ ...values, title: e })
                        }}
                        value={values.title}
                        checkAsync
                        name='title'
                        placeholder='Title'
                      />
                    </Form.Group>
                  </Grid>
                </Grid>

                <Grid container spacing={3}>
                  <Grid item sm={12} xs={12} mt={2}>
                    <Form.Group>
                      <small> Description</small>
                      <Form.Control
                        rows={3}
                        size='md'
                        accepter={Textarea}
                        onChange={e => {
                          setValues({ ...values, description: e })
                        }}
                        value={values.description}
                        name='description'
                        placeholder=' Description'
                        checkAsync
                      />
                    </Form.Group>
                  </Grid>
                </Grid>

                <Grid container spacing={3} >
                  <Grid item sm={12} xs={12} mt={2}>


                    <Form.Group>
                      <small>Start Date</small>
                      <div>
                        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={en} >
                          <DatePicker

                            size='md'
                            format={!values.allDay ? 'yyyy-MM-dd hh:mm' : 'yyyy-MM-dd'}
                            onChange={e => {
                              setValues({ ...values, startDate: e })
                            }}
                            value={values.startDate}
                            name='startDate'
                            block
                            slotProps={{
                              textField: { size: 'small', fullWidth: '2rem' }
                            }}
                          />
                        </LocalizationProvider>
                      </div>
                    </Form.Group>
                  </Grid>
                </Grid>

                <Grid container spacing={3}>
                  <Grid item sm={12} xs={12} mt={2}>
                    <Form.Group>
                      <small>End Date</small>
                      <div>
                        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={en} >
                          <DatePicker
                            itemType='date'
                            showTimeSelect={!values.allDay}
                            format={!values.allDay ? 'yyyy-MM-dd hh:mm' : 'yyyy-MM-dd'}
                            size='md'
                            onChange={e => {
                              setValues({ ...values, endDate: e })
                            }}
                            value={values.endDate}
                            name='endDate'
                            checkAsync
                            block
                            slotProps={{
                              textField: { size: 'small', fullWidth: '2rem' }
                            }}
                          />
                        </LocalizationProvider>
                      </div>
                    </Form.Group>
                  </Grid>
                </Grid>
                <Grid container spacing={3}>
                  <Grid item sm={12} xs={12} mt={2}>
                    <small>Type</small>
                    <Form.Group controlId='type'>
                      <Select
                        size='sm'
                        name='type'
                        fullWidth='2rem'
                        onChange={e => {
                          setValues({ ...values, type: e.target.value })
                        }}
                        value={values.type}
                        data={typesData}
                        block
                      >
                        {
                          typesData &&
                          typesData.map((val) => {
                            return (
                              <MenuItem key={val.value} value={val.value}> {val.label} </MenuItem>
                            )
                          })
                        }
                      </Select>
                    </Form.Group>
                  </Grid>
                </Grid>



                <Grid container spacing={3}>
                  <Grid item sm={12} xs={12} mt={2}>
                    <small>Employees</small>
                    <Select
                      controlId='users'
                      onChange={e => {
                        setValues({ ...values, users: e.target.value })
                      }}
                      multiple
                      value={values.users}
                      size='md'
                      name='users'
                      fullWidth='2rem'
                      block
                    >
                      {
                        notAuthroized &&
                        <MenuItem key={undefined} value={undefined} style={{ color: 'red' }} > {'You do not have Permission to view Employees'} </MenuItem>
                      }
                      {
                        usersDataSource && !notAuthroized &&
                        usersDataSource.map((user) => {
                          return (
                            <MenuItem key={user.value} value={user.value} > {user.label} </MenuItem>
                          )
                        })
                      }
                    </Select>


                  </Grid>
                </Grid>

                <Grid container spacing={3}>
                  <Grid item sm={12} xs={12} mt={2}>
                    <Toggle
                      defaultChecked
                      onChange={e => {
                        setValues({ ...values, allDay: !values.allDay })
                      }}
                      value={values.allDay}
                      color="red"
                      sx={{ px: 2 }}
                    />
                    <small style={{ paddingLeft: 10 }}>All day</small>
                  </Grid>
                </Grid>
              </Form>

              <Box sx={{ display: 'flex', alignItems: 'center', marginTop: '20px' }}>
                <RenderSidebarFooter />
              </Box>
            </DatePickerWrapper>
          </Box>
        </Box>
      )}
    </Drawer>
  )
}

export default AddEventSidebar
