// ** React Imports
import { useState, useRef, useEffect, forwardRef } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'

import { Divider, Typography } from '@mui/material'

import toast from 'react-hot-toast'

// ** Rsuite Imports
import { Form, Schema, SelectPicker, DatePicker, Input } from 'rsuite'
import 'rsuite/dist/rsuite.min.css'

// ** Axios Imports
import axios from 'axios'

import { EmployeeDeductionsType } from 'src/local-db'

// ** Store Imports
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import Loading from 'src/views/loading'
import NoPermission from 'src/views/noPermission'

const { StringType, NumberType, DateType } = Schema.Types

const Textarea = forwardRef((props, ref) => <Input {...props} as='textarea' ref={ref} />)

const AddDepartment = ({ popperPlacement, id }) => {
  // ** States
  const [loadingDescription, setLoadingDescription] = useState('')
  const [action, setAction] = useState('edit')
  const [loading, setLoading] = useState(false)
  const [employeesDataSource, setEmployeesDataSource] = useState([])
  const router = useRouter()
  const { data: session, status } = useSession
  const formRef = useRef()
  const [formError, setFormError] = useState()

  // --------------forms values--------------------------------

  const default_value = {
    type: 'hourly',
    employee_id: '',
    date_from: null,
    toHour: null,
    date_to: null,
    resolution_number: 0,
    description: '',
    status_reason: 'hourly',
    reason: ''
  }

  const types = [
    { label: 'Hourly', value: 'hourly' },
    { label: 'Daily', value: 'daily' }
  ]

  const statusDs = [
    { label: 'Hourly', value: 'hourly' },
    { label: 'Daily', value: 'daily' }
  ]
  const [formValue, setFormValue] = useState(default_value)

  useEffect(() => {
    getEmployees(), getLeaves()
  }, [])

  // ------------------------------ validate Mmodel ------------------------------------

  const validateMmodel = Schema.Model({
    type: StringType().isRequired('This field is required.'),
    reason: StringType().isRequired('This field is required.'),
    employee_id: StringType().isRequired('This field is required.'),
    date_from: DateType().isRequired('This field is required.'),
    date_to: DateType().isRequired('This field is required.'),
    employee_id: StringType().isRequired('This field is required.'),
    status_reason: StringType().isRequired('This field is required.')
  })

  // ------------------------------- Get Employees --------------------------------------

  const getEmployees = () => {
    axios.get('/api/company-employee', {}).then(res => {
      let arr = []
      res.data.data.map(employee => {
        arr.push({
          label: employee.firstName + ' ' + employee.lastName + ' (' + employee.email + ')',
          value: employee._id
        })
      })
      setEmployeesDataSource(arr)
    })
    setLoading(false)
  }

  const getLeaves = () => {
    setLoading(true)
    axios
      .get('/api/employee-leave/' + id, {})
      .then(function (response) {
        setLoading(false)
        let val = response.data.data[0]

        val.date_from = new Date(val.date_from)
        val.date_to = new Date(val.date_to)
        setFormValue({ ...val })
      })
      .catch(function (error) {
        setLoading(false)
      })
  }

  // ------------------------------- Submit --------------------------------------

  const handleSubmit = () => {
    formRef.current.checkAsync().then(result => {
      if (!result.hasError) {
        let data = { ...formValue }

        setLoading(true)
        setLoadingDescription('leaves is inserting')

        axios
          .post('/api/employee-leave/edit-leave', {
            data
          })
          .then(function (response) {
            router.push('/company-dashboard/employee/leave')
            toast.success('leave (' + data.title + ') Edited Successfully.', {
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

  const renderDate = () => {
    if (formValue.type == 'daily') {
      return (
        <>
          <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
            <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
              From Date :
            </Typography>
            <div>
              <Form.Control
                controlId='date_from'
                format='yyyy-MM-dd '
                name='date_from'
                accepter={DatePicker}
                value={formValue.date_from}
              />
            </div>
            {/* <Form.Control
              controlId='date_from'
              format='HH:mm'
              name='date_from'
              accepter={DatePicker}
              value={formValue.date_from}
            /> */}
          </Box>
          <Box sx={{ mb: 1, display: 'flex', alignItems: 'end' }}>
            <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
              To Date :
            </Typography>
            <div>
              <Form.Control
                controlId='date_to'
                format=' yyyy-MM-dd'
                name='date_to'
                accepter={DatePicker}
                value={formValue.date_to}
              />
            </div>
            {/* <Form.Control
              controlId='date_to'
              format=' HH:mm'
              name='date_to'
              accepter={DatePicker}
              value={formValue.date_to}
            /> */}
          </Box>
        </>
      )
    } else {
      return (
        <>
          <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
            <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
              From Date :
            </Typography>
            <div style={{ display: 'flex' }}>
              <Form.Control
                controlId='date_from'
                format='yyyy-MM-dd '
                name='date_from'
                accepter={DatePicker}
                value={formValue.date_from}
                onChange={e => {
                  setFormValue({ ...formValue, date_to: e, date_from: e })
                }}
              />
              <Form.Control
                controlId='date_from'
                format='HH:mm'
                name='date_from'
                accepter={DatePicker}
                value={formValue.date_from}
              />
            </div>
          </Box>
          <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
            <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
              To Date :
            </Typography>
            <div style={{ display: 'flex' }}>
              <Form.Control
                controlId='date_to'
                format=' yyyy-MM-dd'
                name='date_to'
                accepter={DatePicker}
                value={formValue.date_to}
                disabled
              />
              <Form.Control
                controlId='date_to'
                format=' HH:mm'
                name='date_to'
                accepter={DatePicker}
                value={formValue.date_to}
              />
            </div>
          </Box>
        </>
      )
    }
  }

  // -------------------------------- Routes -----------------------------------------------

  const close = () => {
    router.push('/company-dashboard/employee/leave/')
  }

  // ------------------------------ View ---------------------------------

  if (loading) return <Loading header='Please Wait' description={loadingDescription}></Loading>

  if (session && session.user && !session.user.permissions.includes('EditEmployeeLeave'))
    return <NoPermission header='No Permission' description='No permission to add employees leaves'></NoPermission>

  return (
    <>
      <Grid item xs={12} sm={6} lg={6}></Grid>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title='Edit leave' sx={{ pb: 0, pt: 2 }} />
            <Divider />
            <Grid container>
              <Grid item xs={12} sm={9} md={9} sx={{ p: 2, px: 5, mb: 5 }}>
                <Form
                  fluid
                  ref={formRef}
                  onChange={setFormValue}
                  onCheck={setFormError}
                  formValue={formValue}
                  model={validateMmodel}
                >
                  <Grid container spacing={1} sx={{ px: 5 }}>
                    <Grid item sm={12} md={4}>
                      <small>Type</small>
                      <Form.Control
                        size='sm'
                        controlId='type'
                        name='type'
                        accepter={SelectPicker}
                        data={types}
                        block
                        value={formValue.type}
                      />
                    </Grid>
                    <Grid item sm={12} md={8}>
                      <small>Employee</small>
                      <Form.Control
                        size='sm'
                        controlId='employee_id'
                        name='employee_id'
                        accepter={SelectPicker}
                        data={employeesDataSource}
                        block
                        value={formValue.employee_id}
                      />
                    </Grid>
                    <Grid item size='sm' sm={12} md={12} sx={{ mt: 6, mb: 8 }}>
                      <Grid item sm={12} md={8}>
                        {/* <Form.Control
                            controlId='date'
                            format='yyyy-MM-dd HH:mm:ss'
                            name='date'
                            accepter={DatePicker}
                            value={formValue.date}
                          /> */}
                        {renderDate()}

                        <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                          <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                            status :
                          </Typography>
                          <Form.Control
                            size='sm'
                            controlId='status_reason'
                            name='status_reason'
                            accepter={SelectPicker}
                            data={statusDs}
                            block
                            value={formValue.status_reason}
                          />
                        </Box>
                        <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                          <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                            Reason :
                          </Typography>
                          <Form.Control
                            size='sm'
                            name='reason'
                            placeholder='reason '
                            controlId='reason'
                            value={formValue.reason}
                          />
                        </Box>
                        <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                          <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                            Description :
                          </Typography>

                          <Form.Control
                            controlId='description'
                            type='text'
                            size='sm'
                            name='description'
                            placeholder='description '
                            rows={3}
                            accepter={Textarea}
                            value={formValue.description}
                          />
                        </Box>
                        <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                          <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                            Resolution number :
                          </Typography>
                          <Form.Control
                            controlId='resolution_number'
                            type='number'
                            size='sm'
                            name='resolution_number'
                            placeholder='resolution Number'
                            value={formValue.resolution_number}
                          />
                        </Box>
                      </Grid>
                    </Grid>
                    <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 40, mt: 5 }}>
                      {!loading && (
                        <>
                          {action == 'add' && (
                            <Button color='success' onClick={handleSubmit} variant='contained' sx={{ mr: 3 }}>
                              Save
                            </Button>
                          )}
                          {action == 'edit' && (
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
