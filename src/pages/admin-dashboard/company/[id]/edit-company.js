// ** React Imports
import { useState, useEffect, useRef } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import LinearProgress from '@mui/material/LinearProgress'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import toast from 'react-hot-toast'

import { InputGroup } from 'rsuite'
import { Form, Schema } from 'rsuite'
import { DatePicker } from 'rsuite'
import { SelectPicker } from 'rsuite'
import 'rsuite/dist/rsuite.min.css'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Axios Imports
import axios from 'axios'

// ** Actions Imports
import { fetchData } from 'src/store/apps/company'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'
import { Divider } from '@mui/material'
import { useRouter } from 'next/router'

// ** Data
import { companiesTypes } from 'src/local-db'

// ** CleaveJS Imports

import 'cleave.js/dist/addons/cleave-phone.us'
import NoPermission from 'src/views/noPermission'
import Loading from 'src/views/loading'
import { useSession } from 'next-auth/react'

const { StringType } = Schema.Types

const DialogAddUser = ({ popperPlacement, id }) => {
  // ** States
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState('')
  const [logo, setLogo] = useState()
  const router = useRouter()
  const inputFile = useRef(null)
  const [usersDataSource, setUsersDataSource] = useState([])
  const [allCountries, setAllCountries] = useState([])
  const [countriesDataSource, setCountriesDataSource] = useState([])
  const [companyTypesDataSource, setCompanyTypesDataSource] = useState([])

  const [statusDataSource, setStatusTypesDataSource] = useState([
    { label: 'Active', value: 'active' },
    { label: 'Pending', value: 'pending' },
    { label: 'Blocked', value: 'blocked' }
  ])
  const [countryID, setCountryID] = useState()
  const [dial, setDial] = useState()
  const [end_at, setEnd_at] = useState(new Date().toISOString().substring(0, 10))
  const [start_at, setStart_at] = useState(new Date().toISOString().substring(0, 10))
  const [userID, setUserID] = useState()
  const [newType, setNewType] = useState()
  const [newLogo, setNewLogo] = useState()
  const [newStatus, setNewStatus] = useState()
  const [formError, setFormError] = useState({})

  const [formValue, setFormValue] = useState({
    name: ''
  })
  const { data: session, status } = useSession()
  const formRef = useRef()

  const dispatch = useDispatch()
  const store = useSelector(state => state.company)

  const companyStatus = ''
  const value = ''
  const type1 = ''

  useEffect(() => {
    dispatch(
      fetchData({
        type1,
        companyStatus,
        q: value
      })
    )
    getUsers().then(getCountries()).then(getCompany())
  }, [dispatch, type, companyStatus, value])

  function asyncCheckUsername(name) {
    return new Promise(resolve => {
      setTimeout(() => {
        store.data.map(company => {
          if (company.name == name && company._id != formValue._id) {
            resolve(false)
          } else {
            resolve(true)
          }
        })
      }, 500)
    })
  }

  const model = Schema.Model({
    name: StringType()
      .addRule((value, data) => {
        return asyncCheckUsername(value)
      }, 'Duplicate username')
      .isRequired('This field is required.'),
    phone: StringType().isRequired('This phone is required.'),
    address: StringType().isRequired('This address is required.')
  })

  // ------------------------------ Get Users ------------------------------------

  const getUsers = async () => {
    setLoading(true)
    const res = await fetch('/api/user/manager-users')
    const { data } = await res.json()

    const users = data.map(user => ({
      label: user.name + '  (' + user.email + ')',
      value: user._id
    }))
    setUsersDataSource(users)
    setLoading(false)
  }

  // ------------------------------ Get Company ------------------------------------

  const getCompany = () => {
    setLoading(true)
    axios
      .get('/api/company/' + id, {})
      .then(function (response) {
        setFormValue(response.data.data[0])
        setType(response.data.data[0].type)
        setNewLogo(response.data.data[0].logo)
        setUserID(response.data.data[0].user_id)
        setCountryID(response.data.data[0].country_id)
        setNewType(response.data.data[0].type)
        setNewStatus(response.data.data[0].status)
        setDial(response.data.data[0].country_info[0].dial)
        setAddress(response.data.data[0].country_info[0].address)
        setEnd_at(response.data.data[0].end_at)
        setLoading(false)
      })
      .catch(function (error) {
        setLoading(false)
      })
  }

  const types = companiesTypes.map(type => ({
    label: type.title,
    value: type.value
  }))

  // ----------------------------- Get Countries ----------------------------------

  const getCountries = async () => {
    setLoading(true)
    const res = await fetch('/api/country')
    const { data } = await res.json()
    setAllCountries(data)

    const countriesDataSource = data.map(country => ({
      label: country.name,
      value: country._id
    }))

    setCompanyTypesDataSource(types)
    setCountriesDataSource(countriesDataSource)
  }

  // ---------------------------- upload Image---------------------------------------

  const uploadImage = async event => {
    const file = event.target.files[0]
    const base64 = await convertBase64(file)
    setLogo(base64)
    setNewLogo(base64)
  }

  const convertBase64 = file => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader()
      fileReader.readAsDataURL(file)

      fileReader.onload = () => {
        resolve(fileReader.result)
      }

      fileReader.onerror = error => {
        reject(error)
      }
    })
  }

  const openUpload = () => {
    inputFile.current.click()
  }

  // ----------------------- Change Country --------------------------------------------

  const changeCountry = selectedCountry => {
    setCountryID(selectedCountry)
    const index = allCountries.findIndex(i => i._id == selectedCountry)
    setDial(allCountries[index].dial)
  }

  // ----------------------- Change Type --------------------------------------------

  const changeType = selectedType => {
    setNewType(selectedType)
  }

  // ----------------------- Change User --------------------------------------------

  const changeUser = selectedUser => {
    setUserID(selectedUser)
  }

  // ----------------------- Submit --------------------------------------------

  const handleSubmit = () => {
    formRef.current.checkAsync().then(result => {
      if (!result.hasError) {
        let data = {}
        setLoading(true)
        data = formValue
        data.country_id = countryID
        data.type = newType
        data.user_id = userID
        data.logo = newLogo
        data.status = newStatus
        data.start_at = new Date(formValue.start_at).toISOString().substring(0, 10)
        data.end_at = new Date(formValue.end_at).toISOString().substring(0, 10)
        data.updated_at = new Date()
        axios
          .post('/api/company/edit-company', {
            data
          })
          .then(function (response) {
            dispatch(fetchData({})).then(() => {
              toast.success('Company (' + data.name + ') Updated Successfully.', {
                delay: 3000,
                position: 'bottom-right'
              })
              router.push('/admin-dashboard/company')
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

  const close = () => {
    router.push('/admin-dashboard/user')
  }

  // ------------------------------ View ---------------------------------

  if (loading) return <Loading header='Please Wait' description='Companies is loading'></Loading>

  if (session && session.user && !session.user.permissions.includes('AdminAddCompany'))
    return <NoPermission header='No Permission' description='No permission to add companies'></NoPermission>

  return (
    <>
      <Grid item xs={12} sm={7} lg={7}></Grid>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title='Edit Company' sx={{ pb: 1, '& .MuiCardHeader-title': { letterSpacing: '.1px' } }} />
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
                  model={model}
                >
                  <Grid container spacing={3}>
                    <Grid item sm={12} xs={12} mt={1}>
                      <Form.Group controlId='name'>
                        <small>Company Name *</small>
                        <Form.Control size='lg' checkAsync name='name' placeholder='Please enter abc' />
                      </Form.Group>
                    </Grid>
                  </Grid>

                  <Grid container spacing={3} mt={1}>
                    <Grid item sm={5} xs={12}>
                      <small>Type</small>
                      <SelectPicker
                        size='lg'
                        name='newType'
                        onChange={e => {
                          changeType(e)
                        }}
                        value={newType}
                        data={companyTypesDataSource}
                        block
                      />
                    </Grid>
                    <Grid item sm={7} xs={12}>
                      <small>Country</small>
                      <SelectPicker
                        size='lg'
                        name='country_id'
                        onChange={e => {
                          changeCountry(e)
                        }}
                        value={countryID}
                        data={countriesDataSource}
                        block
                      />
                    </Grid>
                  </Grid>
                  <Grid container spacing={3} mt={1}>
                    <Grid item sm={12} xs={12}>
                      <Form.Group controlId='input-group'>
                        <small>Phone</small>
                        <InputGroup size='lg'>
                          <InputGroup.Addon>+{dial}</InputGroup.Addon>
                          <Form.Control name='phone' type='number' size='lg' />
                        </InputGroup>
                      </Form.Group>
                    </Grid>
                  </Grid>
                  <Grid container spacing={3} mt={1}>
                    <Grid item sm={12} xs={12}>
                      <Form.Group>
                        <small>Address</small>
                        <Form.Control rows={2} name='address' />
                      </Form.Group>
                    </Grid>
                  </Grid>
                  <Grid container spacing={3} mt={1}>
                    <Grid item sm={12} xs={12}>
                      <small>Manager</small>
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

                  <Grid container spacing={2} mt={1}>
                    {formValue.start_at && (
                      <Grid item sm={4} xs={12}>
                        <small>Subscription start</small>
                        <Form.Control
                          size='lg'
                          oneTap
                          accepter={DatePicker}
                          name='start_at'
                          onChange={e => {
                            setStart_at(e.toISOString().substring(0, 10))
                          }}
                          value={new Date(start_at)}
                          block
                        />
                      </Grid>
                    )}

                    {end_at && (
                      <Grid item sm={4} xs={12}>
                        <small>Subscription End</small>
                        <Form.Control
                          size='lg'
                          oneTap
                          name='end_at'
                          accepter={DatePicker}
                          onChange={e => {
                            setEnd_at(e.toISOString().substring(0, 10))
                          }}
                          value={new Date(end_at)}
                          block
                        />
                      </Grid>
                    )}

                    <Grid item sm={4} xs={12}>
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
                  <FormControl fullWidth sx={{ mb: 6 }}>
                    <Box sx={{ pt: 3, display: 'inline-block', alignItems: 'center', flexDirection: 'column' }}>
                      <Card
                        variant='h6'
                        style={{ padding: '10px' }}
                        sx={{
                          width: { sx: 1.0, sm: 1.0, md: 1.0 },
                          mb: 2,
                          display: 'flex',
                          justifyContent: 'space-between'
                        }}
                      >
                        <input
                          id='logo'
                          ref={inputFile}
                          type='file'
                          hidden
                          onChange={e => {
                            uploadImage(e)
                          }}
                          name='logo'
                          onClick={() => openUpload()}
                        />
                        {newLogo && <img alt='...' width='100px' src={newLogo} onClick={() => openUpload()} />}
                        {!newLogo && (
                          <img
                            alt='...'
                            width='100px'
                            src='/images/pages/external-content.png'
                            onClick={() => openUpload()}
                          />
                        )}
                        <Button onClick={() => openUpload()} endIcon={<Icon icon='mdi:image' />}>
                          Upload Logo
                        </Button>
                      </Card>
                    </Box>
                  </FormControl>

                  <Box sx={{ mb: 2, alignItems: 'center' }}>{loading && <LinearProgress />}</Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 40 }}>
                    {!loading && (
                      <>
                        <Button color='success' onClick={handleSubmit} variant='contained' sx={{ mr: 3 }}>
                          Save
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

DialogAddUser.getInitialProps = async ({ query: { id } }) => {
  return { id: id }
}

export default DialogAddUser
