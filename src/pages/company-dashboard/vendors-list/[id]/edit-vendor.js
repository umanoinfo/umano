// ** React Imports
import { useState, forwardRef, useEffect, useRef, useCallback } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import LinearProgress from '@mui/material/LinearProgress'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import { Breadcrumbs, Divider, InputAdornment, Typography } from '@mui/material'
import toast from 'react-hot-toast'

// ** Rsuite Imports
import { Form, Schema, SelectPicker, Input } from 'rsuite'
import 'rsuite/dist/rsuite.min.css'

// ** Axios Imports
import axios from 'axios'

// ** Actions Imports
import { fetchData } from 'src/store/apps/company'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import NoPermission from 'src/views/noPermission'
import Loading from 'src/views/loading'
import React from 'react'
import Link from 'next/link'

const { StringType } = Schema.Types

const styles = {
  marginBottom: 10
}

const AddDepartment = ({ popperPlacement, id }) => {
  // ** States
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState('')
  const router = useRouter()
  const inputFile = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [usersDataSource, setUsersDataSource] = useState([])
  const [selectedDepartment, setSelectedDepartment] = useState()
  const [parentsDataSource, setParentsDataSource] = useState([])

  const [statusDataSource, setStatusTypesDataSource] = useState([
    { label: 'Active', value: 'active' },
    { label: 'Pending', value: 'pending' },
    { label: 'Blocked', value: 'blocked' }
  ])
  const [userID, setUserID] = useState()
  const [newParent, setNewParent] = useState('')
  const [newStatus, setNewStatus] = useState('active')
  const [formError, setFormError] = useState({})
  const [notAuthorized, setNotAuthorized] = useState(false);

  const [formValue, setFormValue] = useState({
    name: ''
  })
  const formRef = useRef()
  const [divcontent, setDivcontent] = useState('')
  const { data: session, status } = useSession()

  const dispatch = useDispatch()
  const store = useSelector(state => state.companyDepartment)



  // ------------------------------ validate Mmodel ------------------------------------

  const validateMmodel = Schema.Model({
    name: StringType().isRequired('This field is required.')
  })



  // ----------------------------- Get Department ----------------------------------

  const getDepartment = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/vendor-list/' + id)
      const { data } = await res.json()

      setFormValue(data[0])
      setSelectedDepartment(data)
      setIsLoading(false)
    }
    catch (err) {

    }
  }


  useEffect(() => {
    getDepartment()
      .then(() => {
      })
  }, [])


  // -------------------------------- Changes -----------------------------------------------

  const changeParent = selectedType => {
    setNewParent(selectedType)
  }

  const changeUser = selectedUser => {
    setUserID(selectedUser)
  }

  // -------------------------------- Routes -----------------------------------------------

  const close = () => {
    router.push('/company-dashboard/vendors-list')
  }

  // -------------------------------- handle Submit -----------------------------------------------

  const handleSubmit = () => {
    formRef.current.checkAsync().then(result => {
      if (!result.hasError) {
        let data = {}
        setLoading(true)
        data = formValue
        data.user_id = userID
        data.updated_at = new Date()
        axios
          .post('/api/vendor-list/edit-vendor', {
            data
          })
          .then(function (response) {
            dispatch(fetchData({})).then(() => {
              toast.success('Vendor (' + data.name + ') Inserted Successfully.', {
                delay: 3000,
                position: 'bottom-right'
              })
              router.push('/company-dashboard/vendors-list')
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
    })
  }

  // ------------------------------ View ---------------------------------

  if (isLoading) return <Loading header='Please Wait' description=''></Loading>

  if (session && session.user && !session.user.permissions.includes('EditDepartment'))
    return <NoPermission header='No Permission' description='No permission to edit department'></NoPermission>

  return (
    <>
      <Grid item xs={12} sm={7} lg={7}></Grid>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <Breadcrumbs aria-label='breadcrumb' sx={{ pb: 0, p: 3 }}>
              <Link underline='hover' color='inherit' href='/'>
                Home
              </Link>
              <Link underline='hover' color='inherit' href='/company-dashboard/department/'>
                Departments List
              </Link>
              <Typography color='text.primary' sx={{ fontSize: 18, fontWeight: '500' }}>
                Edit Department
              </Typography>
            </Breadcrumbs>
            <Divider />
            <Grid container>
              <Grid item xs={12} sm={7} md={7} sx={{ p: 2, px: 5, mb: 5 }}>
                <Form
                  fluid
                  ref={formRef}
                  onChange={setFormValue}
                  onCheck={setFormError}
                  formValue={formValue}
                  model={validateMmodel}
                >


                  <Grid container spacing={3}>
                    <Grid item sm={12} xs={12} mt={2}>
                      <Form.Group controlId='name'>
                        <small>Name</small>
                        <Form.Control size='lg' checkAsync name='name' placeholder='Name' />
                      </Form.Group>
                    </Grid>
                  </Grid>

                  <Grid container spacing={3}>
                    <Grid item sm={12} xs={12} mt={2}>
                      <Form.Group controlId='email'>
                        <small>Email</small>
                        <Form.Control size='lg' name='email' placeholder='Email' />
                      </Form.Group>
                    </Grid>
                  </Grid>

                  <Grid container spacing={3}>
                    <Grid item sm={12} xs={12} mt={2}>
                      <Form.Group controlId='mobile'>
                        <small>Email</small>
                        <Form.Control size='lg' name='mobile' placeholder='Mobile' />
                      </Form.Group>
                    </Grid>
                  </Grid>

                  <Grid container spacing={3}>
                    <Grid item sm={12} xs={12} mt={2}>
                      <Form.Group controlId='landline'>
                        <small>Landline</small>
                        <Form.Control size='lg' name='landline' placeholder='Landline' />
                      </Form.Group>
                    </Grid>
                  </Grid>

                  <Grid container spacing={3}>
                    <Grid item sm={12} xs={12} mt={2}>
                      <Form.Group controlId='contactperson'>
                        <small>Contact Person</small>
                        <Form.Control size='lg' name='contactperson' placeholder='Contact Person' />
                      </Form.Group>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 2, mb: 2, alignItems: 'center' }}>{loading && <LinearProgress />}</Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 40, mt: 6 }}>
                    {!loading && (
                      <>
                        <Button color='success' onClick={handleSubmit} variant='contained' sx={{ mr: 3 }}>
                          Update
                        </Button>
                        <Button
                          type='button'
                          color='warning'
                          variant='contained'
                          sx={{ mr: 3 }}
                          onClick={() => close()}
                        >
                          Close
                        </Button>
                      </>
                    )}
                  </Box>
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
