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

// ** CleaveJS Imports
import Cleave from 'cleave.js/react'
import 'cleave.js/dist/addons/cleave-phone.us'

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
  // country: yup.object().required(),
  phone: yup.string().required(),
  address: yup
    .string()
    .min(10, obj => showErrors('Name', obj.value.length, obj.min))
    .required(),
  name: yup
    .string()
    .min(3, obj => showErrors('Name', obj.value.length, obj.min))
    .required()
})

const defaultValues = {}

const DialogAddUser = ({ popperPlacement }) => {
  // ** States
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('active')
  const [type, setType] = useState(companiesTypes[0])
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
    getUsers().then(getCountries())
  }, [])

  // ------------------------------ Get Users ------------------------------------

  const getUsers = async () => {
    setIsLoading(true)
    const res = await fetch('/api/user')
    const { data } = await res.json()
    setIsLoading(false)
    setUsersDataSource(data)
  }

  // ----------------------------- Get Countries ----------------------------------

  const getCountries = async () => {
    setIsLoading(true)
    const res = await fetch('/api/country')
    const { data } = await res.json()
    setIsLoading(false)
    setCountriesDataSource(data)
    const index = data.map(e => e._id).indexOf('618e8986133c2b25923f2248')
    setCountryIndex(index)
    setCountry(data[index])
  }

  const uploadImage = async event => {
    const file = event.target.files[0]
    const base64 = await convertBase64(file)
    setLogo(base64)
  }

  const onSubmit = data => {
    setLoading(true)
    data.type = type.value
    data.country_id = country._id
    data.start_at = start_at
    data.user_id = userID
    data.end_at = end_at
    data.status = status
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

  const test = e => {}

  const close = () => {
    router.push('/admin-dashboard/user')
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
    setType(newValue.value)
  }

  const handleUserChange = (event, newValue) => {
    setUserId(newValue._id)
  }

  const handleCountryChange = (event, newValue) => {
    setCountry(newValue._id)
  }

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
                  <FormControl fullWidth sx={{ mb: 6 }}>
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
                      <FormControl fullWidth sx={{ mb: 6 }}>
                        <Autocomplete
                          size='small'
                          options={companiesTypes}
                          value={type}
                          onChange={handleTypeChange}
                          defaultValue={companiesTypes[0]}
                          getOptionLabel={option => option.title}
                          renderInput={params => <TextField {...params} label='Type' error={Boolean(errors.type)} />}
                        />
                      </FormControl>
                    </Grid>
                    <Grid item sm={7} xs={12}>
                      {countriesDataSource.length > 0 && (
                        <FormControl fullWidth sx={{ mb: 6 }}>
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
                  </Grid>

                  <FormControl fullWidth sx={{ mb: 6 }}>
                    <Controller
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
                            startAdornment: <InputAdornment position='start'>+963</InputAdornment>
                          }}
                        />
                      )}
                    />
                    {errors.phone && (
                      <FormHelperText sx={{ color: 'error.main' }}>{errors.phone.message}</FormHelperText>
                    )}
                  </FormControl>

                  <FormControl fullWidth sx={{ mb: 6 }}>
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

                  <FormControl fullWidth sx={{ mb: 6 }}>
                    <Autocomplete
                      size='small'
                      options={usersDataSource}
                      value={user}
                      onChange={handleUserChange}
                      id='autocomplete-outlined'
                      getOptionLabel={option => option.email}
                      renderInput={params => <TextField {...params} label='Manager' error={Boolean(errors.manager)} />}
                    />
                    {/* {errors.manager && (
                      <FormHelperText sx={{ color: 'error.main' }}>{errors.manager.message}</FormHelperText>
                    )} */}
                  </FormControl>

                  <Grid container spacing={1}>
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
                      <FormControl fullWidth sx={{ mb: 6, pr: 2 }} size='small'>
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
