// ** React Imports
import { useState, useRef, useEffect, forwardRef } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'

import { Breadcrumbs, Divider, Tab, Typography } from '@mui/material'

import toast from 'react-hot-toast'

// ** Rsuite Imports
import { Form, Schema, SelectPicker, DatePicker, Input, CheckPicker , Checkbox} from 'rsuite'

import 'rsuite/dist/rsuite.min.css'

// ** Axios Imports
import axios from 'axios'

import { EmployeeDeductionsType } from 'src/local-db'

// ** Store Imports
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import Loading from 'src/views/loading'
import NoPermission from 'src/views/noPermission'
import Link from 'next/link'

const { StringType, NumberType, DateType, ArrayType } = Schema.Types

const Textarea = forwardRef((props, ref) => <Input {...props} as='textarea' ref={ref} />)

const footerStyles = {
  padding: '10px 2px',
  borderTop: '1px solid #e5e5e5'
};

const AddDepartment = ({ popperPlacement, id }) => {
  // ** States
  const [loadingDescription, setLoadingDescription] = useState('')
  const [action, setAction] = useState('add')
  const [loading, setLoading] = useState(false)
  const [employeesDataSource, setEmployeesDataSource] = useState([])
  const router = useRouter()
  const { data: session, status } = useSession
  const formRef = useRef()
  const [formError, setFormError] = useState()

  // --------------forms values--------------------------------

  const default_value = {
    type: '',
    employees: [],
    date: null,
    resolution_number: 0,
    description: '',
    value: 0,
    reason: ''
  }
  const [formValue, setFormValue] = useState(default_value)

  useEffect(() => {
    getEmployees()

  }, [])

  // ------------------------------ validate Mmodel ------------------------------------

  const validateMmodel = Schema.Model({
    type: StringType().isRequired('This field is required.'),
    reason: StringType().isRequired('This field is required.'),
    employees: ArrayType().isRequired('This field is required.'),
    value: NumberType().min(1).isRequired('This field is required.'),
    date: DateType().isRequired('This field is required.')
  })

  // ------------------------------- Get Employees --------------------------------------

  const getEmployees = async () => {
    setLoading(true);
    axios.get('/api/company-employee', {}).then(res => {
      let arr = []
      res.data.data.map(employee => {
        arr.push({
          label: '( ' + employee.idNo + ') ' + employee.firstName + ' ' + employee.lastName ,
          value: employee._id
        })
      })
      setEmployeesDataSource(arr)
      setLoading(false);
    }).catch((err)=>{})
  }

  // ------------------------------- Submit --------------------------------------

  const handleSubmit = () => {
    formRef.current.checkAsync().then(result => {
      if (!result.hasError) {
        let data = { ...formValue }

        setLoading(true)
        setLoadingDescription('Deduction is inserting')

        axios
          .post('/api/employee-deduction/add-deduction', {
            data
          })
          .then(function (response) {
            router.push('/company-dashboard/employee/deduction')
            toast.success('Deduction (' + data.title + ') Inserted Successfully.', {
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

  const handleChange = (event, newValue) => {
    setTabValue(newValue)
  }

  // -------------------------------- Routes -----------------------------------------------

  const close = () => {
    router.push('/company-dashboard/employee/deduction/')
  }

  // ------------------------------ View ---------------------------------

  if (loading) return <Loading header='Please Wait' description={loadingDescription}></Loading>

  if (session && session.user && !session.user.permissions.includes('AddEmployeeDeduction'))
    return <NoPermission header='No Permission' description='No permission to add employee deduction'></NoPermission>

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
              <Link underline='hover' color='inherit' href='/company-dashboard/employee/deduction/'>
                Deductions
              </Link>
              <Typography color='text.primary' sx={{ fontSize: 18, fontWeight: '500' }}>
                Add Deduction
              </Typography>
            </Breadcrumbs>
            <Divider />
            <Grid container>
              <Grid item xs={12} sm={8} md={8} sx={{ p: 2, px: 5, mb: 5 }}>
                <Form
                  fluid
                  ref={formRef}
                  onChange={setFormValue}
                  onCheck={setFormError}
                  formValue={formValue}
                  model={validateMmodel}
                >
                  <Grid container spacing={1} sx={{ px: 5 }}>
                    <Grid item sm={12} md={3}>
                      <small>Type</small>
                      <Form.Control
                        size='sm'
                        controlId='type'
                        name='type'
                        accepter={SelectPicker}
                        data={EmployeeDeductionsType}
                        block
                        value={formValue.type}
                      />
                    </Grid>
                    <Grid item sm={12} md={8}>
                      <small>Employee</small>
                      <CheckPicker
                        size='sm'
                        controlId='employees'
                        name='employees'
                        renderExtraFooter={() => (
                          <div style={footerStyles}>
                            <Checkbox
                              indeterminate={formValue.employees.length > 0 && formValue.employees.length < employeesDataSource.length}
                              checked={formValue.employees.length === employeesDataSource.length}
                              onChange={(value , checked )=>{
                                setFormValue(checked ? {...formValue , employees: employeesDataSource.map((val)=>val.value) }: {...formValue , employees: []})
                              }}
                            >
                              Check all
                            </Checkbox>
                          </div>
                        )}
                        data={employeesDataSource}
                        block
                        onChange={e => {
                          setFormValue({ ...formValue, employees: e })
                        }}
                        value={formValue.employees}
                      />
                    </Grid>
                    <Divider></Divider>
                    <Grid item size='sm' sm={12} md={12} sx={{ mt: 6, mb: 8 }}>
                      <Grid item sm={12} md={10}>
                        <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                          <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                            Date :
                          </Typography>
                          <Form.Control block controlId='date' name='date' accepter={DatePicker} value={formValue.date} />
                        </Box>
                        <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                          <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                            Value (AED) :
                          </Typography>
                          <Form.Control
                            controlId='value'
                            type='number'
                            size='sm'
                            name='value'
                            placeholder='Percentage value'
                            value={formValue.value}
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
