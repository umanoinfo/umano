// ** React Imports
import { useState, forwardRef, useEffect, useRef } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import LinearProgress from '@mui/material/LinearProgress'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import { Divider, InputAdornment } from '@mui/material'
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
  const [isLoading, setIsLoading] = useState(false)
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

  const [formValue, setFormValue] = useState({
    name: ''
  })
  const formRef = useRef()
  const [divcontent, setDivcontent] = useState('')
  const { data: session, status } = useSession()

  const dispatch = useDispatch()
  const store = useSelector(state => state.companyDepartment)

  const departmentStatus = 'active'
  const parent = ''
  const value = ''
  const Textarea = React.forwardRef((props, ref) => <Input {...props} as="textarea" ref={ref} />);

  useEffect(() => {
    dispatch(
      fetchData({
        parent,
        departmentStatus,
        q: value
      })
    )
      .then(getDepartment)
      .then(() => {
        getUsers()
        getParents()
      })
  }, [dispatch, parent, departmentStatus, value])

  // ---------------------- async Check Department Name -----------------------------------------

  function asyncCheckDepartmentname(name) {
    return new Promise(resolve => {
      setTimeout(() => {
        store.data.map(department => {
          if (department.name == name) {
            return true
          } else {
            return false
          }
        })
      }, 500)
    })
  }

  // ------------------------------ validate Mmodel ------------------------------------

  const validateMmodel = Schema.Model({
    name: StringType().isRequired('This field is required.')

    // .addRule((value, data) => {
    //   return asyncCheckDepartmentname(value)
    // }, 'Duplicate Department Name')
    // .isRequired('This field is required.')
  })

  // ------------------------------ Get Users ------------------------------------

  const getUsers = async () => {
    setIsLoading(true)
    const res = await fetch('/api/company-user')
    const { data } = await res.json()

    const users = data.map(user => ({
      label: user.name + '  (' + user.email + ')',
      value: user._id
    }))
    setUsersDataSource(users)
    setIsLoading(false)
  }

  // ----------------------------- Get Department ----------------------------------

  const getDepartment = async () => {
    setIsLoading(true)
    const res = await fetch('/api/company-department/' + id)
    const { data } = await res.json()
    setFormValue(data[0])
    setNewParent(data[0].parent)
    if (!data[0].parent) {
      setNewParent('')
    }
    setUserID(data[0].user_id)
    setNewStatus(data[0].status)
    setSelectedDepartment(data)
    setIsLoading(false)
  }

  // ----------------------------- Get Parents ----------------------------------

  const getParents = async () => {
    setIsLoading(true)
    const res = await fetch('/api/company-department/')
    const { data } = await res.json()

    const parents = data.map(departmen => ({
      label: departmen.name,
      value: departmen._id
    }))
    parents.push({
      label: 'Main',
      value: ''
    })
    setParentsDataSource(parents)
    setIsLoading(false)
  }

  // -------------------------------- Changes -----------------------------------------------

  const changeParent = selectedType => {
    setNewParent(selectedType)
  }

  const changeUser = selectedUser => {
    setUserID(selectedUser)
  }

  // -------------------------------- Routes -----------------------------------------------

  const close = () => {
    router.push('/company-dashboard/department')
  }

  // -------------------------------- handle Submit -----------------------------------------------

  const handleSubmit = () => {
    formRef.current.checkAsync().then(result => {
      if (!result.hasError) {
        let data = {}
        setLoading(true)
        data = formValue
        if (data.parent != '') {
          data.parent = newParent
        }
        data.user_id = userID
        data.updated_at = new Date()
        axios
          .post('/api/company-department/edit-department', {
            data
          })
          .then(function (response) {
            dispatch(fetchData({})).then(() => {
              toast.success('Department (' + data.name + ') Inserted Successfully.', {
                delay: 3000,
                position: 'bottom-right'
              })
              router.push('/company-dashboard/department')
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

  if (loading) return <Loading header='Please Wait' description='Department is updating'></Loading>

  if (session && session.user && !session.user.permissions.includes('EditDepartment'))
    return <NoPermission header='No Permission' description='No permission to edit department'></NoPermission>

  return (
    <>
      <Grid item xs={12} sm={7} lg={7}></Grid>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title='Add Department' sx={{ pb: 1, '& .MuiCardHeader-title': { letterSpacing: '.1px' } }} />
            <CardContent></CardContent>
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
                    <Grid item sm={8} xs={12} mt={2}>
                      <small>Core Department</small>
                      <SelectPicker
                        size='lg'
                        name='parent '
                        onChange={e => {
                          changeParent(e)
                        }}
                        value={newParent}
                        data={parentsDataSource}
                        block
                      />
                    </Grid>
                  </Grid>

                  <Grid container spacing={3}>
                    <Grid item sm={12} xs={12} mt={2}>
                      <Form.Group controlId='name'>
                        <small>Department/Section Name</small>
                        <Form.Control size='lg' checkAsync name='name' placeholder='Department Name' />
                      </Form.Group>
                    </Grid>
                  </Grid>

                  <Grid container spacing={3}>
                    <Grid item sm={12} xs={12} mt={2}>
                      <Form.Group name='description'>
                        <small>Department/Section Description</small>
                        <Form.Control rows={3}  accepter={Textarea} size='lg' name='description' placeholder='Department Description' />
                      </Form.Group>
                    </Grid>
                  </Grid>

                  <Grid container spacing={3}>
                    <Grid item sm={12} xs={12} mt={2}>
                      <small>Head of Department/Section</small>
                      <SelectPicker
                        size='lg'
                        name='user_id'
                        onChange={e => {
                          changeUser(e)
                        }}
                        value={userID}
                        data={usersDataSource}
                        block
                      />
                    </Grid>
                  </Grid>

                  <Grid container spacing={2}>
                    <Grid item sm={4} xs={12} mt={2}>
                      <small>Select status</small>
                      <Form.Control
                        size='lg'
                        name='status'
                        onChange={e => {
                          setNewStatus(e)
                        }}
                        value={newStatus}
                        data={statusDataSource}
                        accepter={SelectPicker}
                        block
                      />
                    </Grid>
                  </Grid>

                  <Box sx={{ mb: 2, alignItems: 'center' }}>{loading && <LinearProgress />}</Box>
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
