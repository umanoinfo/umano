// ** React Imports
import { useState, forwardRef, useEffect, useRef } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import LinearProgress from '@mui/material/LinearProgress'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Fade from '@mui/material/Fade'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import FormHelperText from '@mui/material/FormHelperText'
import Select from '@mui/material/Select'
import toast from 'react-hot-toast'
import Link from '@mui/material/Link'
import { styled } from '@mui/material/styles'

// ** Third Party Imports
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Controller } from 'react-hook-form'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Axios Imports
import axios from 'axios'

// ** Actions Imports
import { fetchData, deleteUser } from 'src/store/apps/user'

import Autocomplete from '@mui/material/Autocomplete'
import CustomAvatar from 'src/@core/components/mui/avatar'

// ** Store Imports
import { useDispatch } from 'react-redux'
import { addUser } from 'src/store/apps/user'
import { Divider, InputAdornment } from '@mui/material'
import { useRouter } from 'next/router'

// ** Third Party Imports
import { useDropzone } from 'react-dropzone'
import DatePicker from 'react-datepicker'
import subDays from 'date-fns/subDays'
import addDays from 'date-fns/addDays'
import CustomInputs from 'src/views/forms/form-elements/pickers/PickersCustomInput'
import { padding } from '@mui/system'

// ** Data
import { companiesTypes } from 'src/local-db'
import { countries } from 'src/local-db'

// ** CleaveJS Imports
import Cleave from 'cleave.js/react'
import 'cleave.js/dist/addons/cleave-phone.us'
import { useSession } from 'next-auth/react'
import NoPermission from 'src/views/noPermission'
import Loading from 'src/views/loading'

const showErrors = (field, valueLen, min) => {
  if (valueLen === 0) {
    return `${field} field is required`
  } else if (valueLen > 0 && valueLen < min) {
    return `${field} must be at least ${min} characters`
  } else {
    return ''
  }
}

const schema = yup.object().shape({
  phone: yup.string().required(),
  address: yup
    .string()
    .min(10, obj => showErrors('Name', obj.value.length, obj.min))
    .required(),
  name: yup
    .string()
    .min(3, obj => showErrors('Name', obj.value.length, obj.min))
    .required(),
    
  // manager: yup.number().required(),
})

const defaultValues = {}

const DialogAddUser = ({ popperPlacement }) => {
  // ** States
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState(companiesTypes[0])
  const [state, setState] = useState()
  const [files, setFiles] = useState([])
  const [minDate, setMinDate] = useState(new Date())
  const [maxDate, setMaxDate] = useState(new Date())
  const [date, setDate] = useState(new Date())
  const [logo, setLogo] = useState()
  const router = useRouter()
  const inputFile = useRef(null)
  const [isLoading, setIsLoading] = useState(false)
  const [usersDataSource, setUsersDataSource] = useState([])
  const [countriesDataSource, setCountriesDataSource] = useState([])
  const [country, setCountry] = useState()
  const [countryIndex, setCountryIndex] = useState()
  const [end_at, setEnd_at] = useState(new Date().toISOString().substring(0, 10))
  const [start_at, setStart_at] = useState(new Date().toISOString().substring(0, 10))
  const [userID, setUserId] = useState()
  const [user, setUser] = useState()
  const { data: session, status } = useSession()
  
  const dispatch = useDispatch()

  const {
    reset,
    control,
    setValue,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver(schema)
  })

  useEffect(() => {
    getUsers(), getCountries()
  }, [])

  // ------------------------------ Get Users ------------------------------------

  const getUsers = async () => {
    setIsLoading(true)
    const res = await fetch('/api/user/manager-users')
    const { data } = await res.json()
    console.log('users' , data) ;
    setIsLoading(false)
    setUsersDataSource(data)
  }

  // ----------------------------- Get Countries ----------------------------------

  const getCountries = async () => {

    setCountriesDataSource(countries)
    setCountry(countries[0])
    setState(countries[0].states[0])
  }

  // -------------------------------- Upload Image -----------------------------------------

  const uploadImage = async event => {
    const file = event.target.files[0]
    const size = file.size / (1024 * 1024) ;
    if(size > 1 ){
      toast.error('Logo size is more than 1 MB' , {
        duration: 5000 , 
        position: 'bottom-right' 
      });

      return ;
    }
    
    const base64 = await convertBase64(file)
    setLogo(base64)
  }

  const onSubmit = data => {
    if(!userID){
      toast.error('Manager field is required', {
        delay:3000,position:'bottom-right'
      });
      
      return;
    }
    setLoading(true)
    data.type = type.value
    data.state = state.name
    data.country_id = country._id
    data.start_at = new Date(start_at).toISOString().substring(0, 10)
    data.end_at = new Date(end_at).toISOString().substring(0, 10)
    data.user_id = userID;
    data.status = 'pending'
    data.logo = logo
    data.created_at = new Date()
    axios
      .post('/api/company/add-company', {
        data
      })
      .then(function (response) {
        dispatch(fetchData({})).then(() => {
          toast.success('Company (' + data.name + ') Inserted Successfully.', { delay: 3000, position: 'bottom-right' })
          router.push('/admin-dashboard/company')
        })
      })
      .catch(function (error) {
        toast.error('Error : ' + error.response.data.message + ' !', {
          delay: 1000,
          position: 'bottom-right'
        })
        setLoading(false)
      })
  }

  const close = () => {
    router.push('/admin-dashboard/company')
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

  const handleTypeChange = (event, newValue) => {
    setType(newValue)
  }

  const handleStateChange = (event, newValue) => {
    setState(newValue)
  }

  const handleUserChange = (event, newValue) => {
    setUserId(newValue._id)
  }

  const handleCountryChange = (event, newValue) => {
    setCountry(newValue)
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
            <CardHeader title='Add Company' sx={{ pb: 1, '& .MuiCardHeader-title': { letterSpacing: '.1px' } }} />
            <CardContent></CardContent>
            <Divider />
            <Grid container>
              <Grid item xs={12} sm={7} md={7} sx={{ p: 2, mb: 5 }}>
                <form onSubmit={handleSubmit(onSubmit)} sx={{ mb: 12 }}>
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <Controller
                      name='name'
                      control={control}
                      rules={{ required: true }}
                      render={({ field: { value, onChange } }) => (
                        <TextField
                          htmlFor='credit-card'
                          id='credit-card'
                          size='small'
                          value={value}
                          label='Name'
                          onChange={onChange}
                          placeholder='Company Name'
                          error={Boolean(errors.name)}
                        />
                      )}
                    />
                    {errors.name && <FormHelperText sx={{ color: 'error.main' }}>{errors.name.message}</FormHelperText>}
                  </FormControl>

                  <Grid container spacing={1}>
                    <Grid item sm={5} xs={12}>
                      <FormControl fullWidth sx={{ mb: 3 }}>
                        <Autocomplete
                          size='small'
                          options={companiesTypes}
                          value={type}
                          onChange={handleTypeChange}
                          defaultValue={companiesTypes[0]}
                          getOptionLabel={option => option.title}
                          renderInput={params => <TextField {...params} label='Type' value={userID} error={Boolean(errors.type)} />}
                        />
                      </FormControl>
                    </Grid>
                   
                  </Grid>

                  <Grid container spacing={1}>
                  <Grid item sm={7} xs={12}>
                      {countriesDataSource.length > 0 && (
                        <FormControl fullWidth sx={{ mb: 3 }}>
                          <Autocomplete
                            size='small'
                            options={countriesDataSource}
                            value={country}
                            onChange={handleCountryChange}
                            defaultValue={countriesDataSource[countryIndex]}
                            getOptionLabel={option => option.name}
                            renderInput={params => (
                              <TextField {...params} label='Country' error={Boolean(errors.country)} />
                            )}
                          />
                        </FormControl>
                      )}
                    </Grid>
                    <Grid item sm={5} xs={12}>
                     {country && <FormControl fullWidth sx={{ mb: 3 }}>
                        <Autocomplete
                          size='small'
                          options={country.states}
                          value={state}
                          onChange={handleStateChange}
                          defaultValue={country.states[0]}
                          getOptionLabel={option => option.name}
                          error={Boolean(errors.state)}
                          renderInput={params => <TextField {...params} label='State' error={Boolean(errors.states)} />}
                        /> 
                         
                         {errors.state && (
                      <FormHelperText sx={{ color: 'error.main' }}>{errors.state.message}</FormHelperText>
                    )}
                      </FormControl>}
                    
                    </Grid>
   
                  </Grid>

                  <FormControl fullWidth sx={{ mb: 3 }}>
                  {country && country.dial &&  <Controller
                      name='phone'
                      control={control}
                      rules={{ required: true }}
                      render={({ field: { value, onChange } }) => (
                        <TextField
                          type='number'
                          size='small'
                          value={value}
                          label='Phone'
                          onChange={onChange}
                          placeholder='00000000'
                          error={Boolean(errors.phone)}
                          InputProps={{
                            startAdornment: <InputAdornment position='start'>+{country.dial}</InputAdornment>
                          }}
                        />
                      )}
                    />}
                    {errors.phone && (
                      <FormHelperText sx={{ color: 'error.main' }}>{errors.phone.message}</FormHelperText>
                    )}
                  </FormControl>

                  <FormControl fullWidth sx={{ mb: 3 }}>
                  <Controller
                      name='website'
                      control={control}
                      rules={{ required: true }}
                      render={({ field: { value, onChange } }) => (
                        <TextField
                          type='text'
                          size='small'
                          value={value}
                          label='Website'
                          onChange={onChange}
                          placeholder='www.website.com'
                        />
                      )}
                    />
                  </FormControl>

                  <FormControl fullWidth sx={{ mb: 3 }}>
                  <Controller
                      name='employeeID'
                      control={control}
                      rules={{ required: true }}
                      render={({ field: { value, onChange } }) => (
                        <TextField
                          pattern = "[A-Za-z]"
                          type='text'
                          size='small'
                          value={value}
                          label='Employees ID Prefix'
                          onChange={onChange}
                          placeholder='Employees ID Prefix'
                        />
                      )}
                    />
                  </FormControl>
                  
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <Controller
                      name='address'
                      control={control}
                      rules={{ required: true }}
                      render={({ field: { value, onChange } }) => (
                        <TextField
                          multiline
                          type='text'
                          size='small'
                          rows={2}
                          value={value}
                          label='Address'
                          onChange={onChange}
                          placeholder=''
                          error={Boolean(errors.address)}
                        />
                      )}
                    />
                    {errors.address && (
                      <FormHelperText sx={{ color: 'error.main' }}>{errors.address.message}</FormHelperText>
                    )}
                  </FormControl>
                  
                  

                  <FormControl fullWidth sx={{ mb: 3 }} value={userID} >
                    <Autocomplete
                      size='small'
                      options={usersDataSource}
                      value={userID}
                      onChange={handleUserChange}
                      id='autocomplete-outlined'
                      getOptionLabel={option => option.email}
                      renderInput={params => <TextField {...params} label='Manager' value={userID}   error={Boolean(errors.manager)}  />}
                    />
                    
                    {/* {errors.manager && (
                      <FormHelperText sx={{ color: 'error.main' }}>{errors.manager.message}</FormHelperText>
                    )} */}
                  </FormControl>

                  {/* <Grid container spacing={1}>
                    <Grid item sm={3} xs={12}>
                      <FormControl fullWidth sx={{ mb: 1 }} size='small'>
                        <DatePicker
                          selected={date}
                          id='basic-input'
                          popperPlacement={popperPlacement}
                          onChange={e => {
                            setStart_at(e.target.value)
                          }}
                          placeholderText='Click to select a date'
                          customInput={<CustomInputs size='small' label='Subscription start' />}
                        />
                      </FormControl>
                    </Grid>

                    <Grid item sm={3} xs={12}>
                      <FormControl fullWidth sx={{ mb: 1 }} size='small'>
                        <DatePicker
                          selected={date}
                          id='basic-input'
                          popperPlacement={popperPlacement}
                          onChange={e => {
                            setEnd_at(date)
                          }}
                          placeholderText='Click to select a date'
                          customInput={<CustomInputs size='small' label='Subscription end' />}
                        />
                      </FormControl>
                    </Grid>

                    <Grid item sm={6} xs={12}>
                      <FormControl fullWidth sx={{ mb: 3, pr: 2 }} size='small'>
                        <InputLabel id='status-select'>Select Status</InputLabel>
                        <Select
                          fullWidth
                          value={status}
                          id='select-status'
                          label='Select Status'
                          labelId='status-select'
                          onChange={e => setStatus(e.target.value)}
                          inputProps={{ placeholder: 'Select Status' }}
                        >
                          <MenuItem value='active'>Active</MenuItem>
                          <MenuItem value='pending'>Pending</MenuItem>
                          <MenuItem value='blocked'>Blocked</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid> */}

                  <FormControl fullWidth sx={{ mb: 3 }}>
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
                        {logo && <img alt='...' width='100px' src={logo} onClick={() => openUpload()} />}
                        {!logo && (
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
                        <Button color='success' type='submit' variant='contained' sx={{ mr: 3 }}>
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
                </form>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>
    </>
  )
}

export default DialogAddUser
