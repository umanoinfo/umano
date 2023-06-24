// ** React Imports
import { useState, forwardRef, useEffect, useRef } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import LinearProgress from '@mui/material/LinearProgress'
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
import Card from '@mui/material/Card'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import MuiStepper from '@mui/material/Stepper'
import Loading from 'src/views/loading'

import { Input, InputGroup, Row, Col, Radio, RadioGroup } from 'rsuite'
import { Form, Schema, Panel } from 'rsuite'
import { DatePicker } from 'rsuite'

import { AutoComplete } from 'rsuite'
import { SelectPicker } from 'rsuite'

import 'rsuite/dist/rsuite.min.css'

// ** Axios Imports
import axios from 'axios'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'
import { Breadcrumbs, Divider, InputAdornment, Stepper } from '@mui/material'
import { useRouter } from 'next/router'

// ** Data
import { EmployeesTypes, MaritalStatus, SourceOfHire, HealthInsuranceTypes } from 'src/local-db'

// ** Step Components
import StepDocuments from './../steps/StepDocuments'
import StepPositions from './../steps/StepPositions'
import StepSalary from './../steps/StepSalary'
import StepAttendance from './../steps/StepAttendance'
import StepSalaryFormula from './../steps/StepSalaryFormula'

// ** Styled Components
import StepperWrapper from 'src/@core/styles/mui/stepper'
import { deleteInvoice } from 'src/store/apps/companyEmployee'

const { StringType } = Schema.Types

// ** Icon Imports
import Icon from 'src/@core/components/icon'
import { useSession } from 'next-auth/react'
import NoPermission from 'src/views/noPermission'

const styles = {
  marginBottom: 10
}

const CustomInput = ({ ...props }) => <Input {...props} style={styles} />

const EditEmployee = ({ popperPlacement, id }) => {
  // ** States
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState('')
  const [logo, setLogo] = useState()
  const [address, setAddress] = useState()
  const router = useRouter()
  const inputFile = useRef(null)
  const [isLoading, setIsLoading] = useState(false)
  const [usersDataSource, setUsersDataSource] = useState([])
  const [allCountries, setAllCountries] = useState([])
  const [countriesDataSource, setCountriesDataSource] = useState([])
  const [shiftsDataSource, setShiftsDataSource] = useState([])
  const [maritalStatusDataSource, setMaritalStatusDataSource] = useState([])
  const [employeeTypesDataSource, setEmployeeTypesDataSource] = useState([])
  const [sourceOfHireDataSource, setSourceOfHireDataSource] = useState([])
  const [salaryFormulaDataSource, setSalaryFormulaDataSource] = useState([])
  const [healthInsuranceTypeDataSource, setHealthInsuranceTypeDataSource] = useState([])
  const [statusDataSource, setStatusTypesDataSource] = useState([
    { label: 'Active', value: 'active' },
    { label: 'Pending', value: 'pending' },
    { label: 'Blocked', value: 'blocked' }
  ])
  const [countryID, setCountryID] = useState()
  const [dial, setDial] = useState()
  const [userID, setUserID] = useState()
  const [healthType, setHealthType] = useState()
  const [newLogo, setNewLogo] = useState()
  const [dateOfBirth, setDateOfBirth] = useState(new Date().toISOString().substring(0, 10))
  const [newStatus, setNewStatus] = useState()
  const [maritalStatus, setMaritalStatus] = useState()
  const [employeeType, setEmployeeType] = useState()
  const [sourceOfHire, setSourceOfHire] = useState()
  const [gender, setGender] = useState('male')
  const [formError, setFormError] = useState({})
  const [formValue, setFormValue] = useState({})
  const formRef = useRef()
  const [selectedEmployee, setSelectedEmployee] = useState()
  const [deductionDataSource, setDeductionDataSource] = useState()
  const [compensationDataSource, setCompensationDataSource] = useState()

  const dispatch = useDispatch()
  const store = useSelector(state => state.companyEmployee)
  const { data: session, setSession } = useSession()

  const companyStatus = ''
  const value = ''
  const type1 = ''

  useEffect(() => {
    getCountries()
    getShifts()
    getEmployee()
    getSalaryFormula()
    getDeduction()
    getCompensation()
    dispatch(deleteInvoice('111'))
  }, [])

  // useEffect(() => {
  //   dispatch(
  //     getEmployee({
  //       id: 'value'
  //     })
  //   )
  // }, [])

  // ------------------------ Get Shifts -----------------------------------

  const getShifts = async () => {
    setIsLoading(true)
    const res = await fetch('/api/shift/')
    const { data } = await res.json()
    setShiftsDataSource(data)
    setIsLoading(false)
  }

  // ------------------------ Get Salary Formula -----------------------------------

  const getSalaryFormula = async () => {
    setIsLoading(true)
    const res = await fetch('/api/salary-formula/')
    const { data } = await res.json()
    setSalaryFormulaDataSource(data)
    setIsLoading(false)
  }

  // ------------------------ Get Deduction -----------------------------------

  const getDeduction = async () => {
    setIsLoading(true)
    const res = await fetch('/api/deduction/')
    const { data } = await res.json()
    setDeductionDataSource(data)
    setIsLoading(false)
  }

  // ------------------------ Get Compensation -----------------------------------

  const getCompensation = async () => {
    setIsLoading(true)
    const res = await fetch('/api/compensation/')
    const { data } = await res.json()
    setCompensationDataSource(data)
    setIsLoading(false)
  }

  // ------------------------ Get Employee -----------------------------------

  const getEmployee = async () => {
    setIsLoading(true)
    const res = await fetch('/api/company-employee/' + id)
    const { data } = await res.json()
    setSelectedEmployee(data[0])
    setFormValue(data[0])
    setCountryID(data[0].countryID)
    setDateOfBirth(data[0].dateOfBirth)
    setSourceOfHire(data[0].sourceOfHire)
    setEmployeeType(data[0].employeeType)
    setMaritalStatus(data[0].maritalStatus)
    setNewLogo(data[0].logo)
    setGender(data[0].gender)
    setIsLoading(false)
  }
  // ----------------------------- Change Country ----------------------------------

  const changeCountry = selectedCountry => {
    setCountryID(selectedCountry)
    const index = allCountries.findIndex(i => i._id == selectedCountry)
    setDial(allCountries[index].dial)
  }

  // ----------------------------- Get Options ----------------------------------

  const getCountries = async () => {
    setIsLoading(true)
    const res = await fetch('/api/country')
    const { data } = await res.json()
    setAllCountries(data)

    const countriesDataSource = data.map(country => ({
      label: country.name,
      value: country._id
    }))

    const employeesTypes = EmployeesTypes.map(type => ({
      label: type.title,
      value: type.value
    }))

    const maritalStatus = MaritalStatus.map(type => ({
      label: type.title,
      value: type.value
    }))

    const sourceOfHire = SourceOfHire.map(type => ({
      label: type.title,
      value: type.value
    }))

    const healthInsuranceTypes = HealthInsuranceTypes.map(type => ({
      label: type.title,
      value: type.value
    }))

    setMaritalStatusDataSource(maritalStatus)
    setEmployeeTypesDataSource(employeesTypes)
    setCountriesDataSource(countriesDataSource)
    setSourceOfHireDataSource(sourceOfHire)
    setHealthInsuranceTypeDataSource(healthInsuranceTypes)
  }

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

  const steps = [
    {
      title: 'Information',
      icon: <Icon icon='mdi:card-account-details-outline' width='30' height='30' color='primary' />
    },
    {
      title: 'Documents',
      icon: <Icon icon='mdi:file-document-multiple-outline' width='30' height='30' color='primary' />
    },
    {
      title: 'Positions',
      icon: <Icon icon='mdi:arrange-send-to-back' width='30' height='30' color='primary' />
    },
    {
      title: 'Attendance',
      icon: <Icon icon='material-symbols:calendar-month-outline-rounded' width='30' height='30' color='primary' />
    },
    {
      title: 'Salary Formula',
      icon: <Icon icon='ph:money' width='30' height='30' color='primary' />
    },
    {
      title: 'Salary',
      icon: <Icon icon='fluent:person-money-24-regular' width='30' height='30' color='primary' />
    }
  ]

  const validateMmodel = Schema.Model({
    firstName: StringType().isRequired('First name is required.'),
    lastName: StringType().isRequired('Last name is required.'),
    email: StringType().isRequired('Email is required.'),
    email: Schema.Types.StringType().isEmail('Please enter a valid email address.'),
    mobilePhone: StringType().isRequired('Mobile phone is required.'),
    mobilePhone: Schema.Types.NumberType().isInteger('It can only be an integer')
  })

  // ------------------------------ Change Event ------------------------------------

  const changeEmployeeType = selectedType => {
    setEmployeeType(selectedType)
  }

  const changeMaritalStatus = selectedStatus => {
    setMaritalStatus(selectedStatus)
  }

  const changeGender = selectedGender => {
    setGender(selectedGender)
  }

  const changeHealthType = selectedHealthType => {
    setHealthType(selectedHealthType)
  }

  const changeSourceOfHire = selectSourceOfHire => {
    setSourceOfHire(selectSourceOfHire)
  }

  // ------------------------------ Change Steps ------------------------------------

  const getStepContent = step => {
    switch (step) {
      case 0:
        return (
          <>
            <Typography sx={{ mt: 2, mb: 3, px: 2, fontWeight: 600, fontSize: 20, color: 'blue' }}>
              Main Information
            </Typography>
            <Form
              fluid
              ref={formRef}
              onChange={setFormValue}
              onCheck={setFormError}
              formValue={formValue}
              model={validateMmodel}
            >
              <Grid container>
                <Grid item xs={12} sm={7} md={7} sx={{ px: 2, mb: 5 }}>
                  <Grid container spacing={3}>
                    <Grid item sm={12} xs={12} md={5} mt={1}>
                      <Form.Group controlId='idNo'>
                        <small>ID No.</small>
                        <Form.Control size='sm' checkAsync name='idNo' placeholder='ID No.' />
                      </Form.Group>
                    </Grid>
                  </Grid>
                  <Grid container spacing={3}>
                    <Grid item sm={12} xs={12} md={6} mt={2}>
                      <Form.Group controlId='firstName'>
                        <small>First Name</small>
                        <Form.Control size='sm' checkAsync name='firstName' placeholder='First Name' />
                      </Form.Group>
                    </Grid>
                    <Grid item sm={12} xs={12} md={6} mt={2}>
                      <Form.Group controlId='lastName'>
                        <small>Last Name</small>
                        <Form.Control size='sm' checkAsync name='lastName' placeholder='Last Name' />
                      </Form.Group>
                    </Grid>
                  </Grid>
                  <Grid container spacing={3}>
                    <Grid item sm={12} xs={12} md={12} mt={2}>
                      <Form.Group controlId='email'>
                        <small>Email</small>
                        <Form.Control size='sm' checkAsync name='email' placeholder='Email' />
                      </Form.Group>
                    </Grid>
                  </Grid>
                  <Grid container spacing={3}>
                    <Grid item sm={12} xs={12} mt={2}>
                      <small>Nationality</small>
                      <SelectPicker
                        size='sm'
                        name='countryID'
                        onChange={e => {
                          changeCountry(e)
                        }}
                        value={countryID}
                        data={countriesDataSource}
                        block
                      />
                    </Grid>
                  </Grid>
                  <Grid container spacing={3}>
                    <Grid item sm={7} xs={12} mt={2}>
                      <small>Health insurance type</small>
                      <Form.Control size='sm' checkAsync name='healthType' placeholder='Health insurance type' />
                    </Grid>
                    <Grid item sm={5} xs={12} mt={2}>
                      <small>Date of birth</small>
                      <Form.Control
                        size='sm'
                        oneTap
                        accepter={DatePicker}
                        name='dateOfBirth'
                        onChange={e => {
                          setDateOfBirth(e.toISOString().substring(0, 10))
                        }}
                        value={new Date(dateOfBirth)}
                        block
                      />
                    </Grid>
                  </Grid>
                  <Grid item sm={12} xs={12} mt={2}>
                    <small>Source of Hire</small>
                    <SelectPicker
                      size='sm'
                      name='sourceOfHire'
                      onChange={e => {
                        changeSourceOfHire(e)
                      }}
                      value={sourceOfHire}
                      data={sourceOfHireDataSource}
                      block
                    />
                  </Grid>
                  <Grid container spacing={3}>
                    <Grid item sm={6} xs={12} spacing={3} mt={2}>
                      <Grid item sm={12} xs={12}>
                        <small>Employee Type (contract Type)</small>
                        <SelectPicker
                          size='sm'
                          name='employeeType'
                          onChange={e => {
                            changeEmployeeType(e)
                          }}
                          value={employeeType}
                          data={employeeTypesDataSource}
                          block
                        />
                      </Grid>
                    </Grid>
                    <Grid item sm={6} xs={12} spacing={3} mt={2}>
                      <Grid item sm={12} xs={12}>
                        <small>Marital status</small>
                        <SelectPicker
                          size='sm'
                          name='maritalStatus'
                          onChange={e => {
                            changeMaritalStatus(e)
                          }}
                          value={maritalStatus}
                          data={maritalStatusDataSource}
                          block
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid container spacing={3}>
                    <Grid item sm={6} xs={12} spacing={3} mt={2}>
                      <Grid item sm={12} xs={12}>
                        <small>Gender</small>

                        <RadioGroup
                          name='radioList'
                          value={gender}
                          inline
                          onChange={e => {
                            changeGender(e)
                          }}
                        >
                          <Radio value='male'>Male</Radio>
                          <Radio value='female'>Female</Radio>
                        </RadioGroup>
                      </Grid>
                    </Grid>
                    {/* <Grid item sm={6} xs={12} spacing={3} mt={2}>
                      <Grid item sm={12} xs={12}>
                        <small>Marital status</small>
                        <SelectPicker
                          size='sm'
                          name='user_id'
                          onChange={e => {
                            changeUser(e)
                          }}
                          value={userID}
                          data={usersDataSource}
                          block
                        />
                      </Grid>
                    </Grid> */}
                  </Grid>
                </Grid>
                <Grid item xs={12} sm={5} md={5} sx={{ p: 2, mb: 5 }}>
                  <Box sx={{ border: 'solid', borderRadius: 1, borderColor: 'primary', borderWidth: 1 }}>
                    <FormControl fullWidth sx={{ alignItems: 'center', mb: 6, height: '100%' }}>
                      <Box
                        sx={{
                          pt: 8,
                          display: 'inline-block',
                          alignItems: 'center',
                          flexDirection: 'column'
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
                          // data={usersArr}
                        />
                        {newLogo && <img alt='...' width='100px' src={newLogo} onClick={() => openUpload()} />}
                        {!newLogo && (
                          <img alt='...' width='100px' src='/images/pages/avatar.jpg' onClick={() => openUpload()} />
                        )}
                        <br></br>
                        {/* <Button onClick={() => openUpload()} endIcon={<Icon icon='mdi:image' />}>
                            Upload Logo
                          </Button> */}
                      </Box>
                      <Divider />

                      <Grid container sx={{ mt: 3, px: 5 }}>
                        <Grid item sm={12} md={12} sx={{ mt: 2 }}>
                          <small>Other email</small>
                          <Form.Control controlId='otherEmail' size='sm' name='otherEmail' placeholder='Other Email' />
                        </Grid>
                        <Grid item sm={12} md={12} sx={{ mt: 2 }}>
                          <small>Mobile phone</small>
                          <Form.Control
                            controlId='mobilePhone'
                            size='sm'
                            name='mobilePhone'
                            placeholder='Mobile phone'
                          />
                        </Grid>
                        <Grid container spacing={3}>
                          <Grid item sm={12} md={8} sx={{ mt: 3 }}>
                            <small>Work phone</small>
                            <Form.Control controlId='workPhone' size='sm' name='workPhone' placeholder='Work phone' />
                          </Grid>
                          <Grid item sm={12} md={4} sx={{ mt: 3 }}>
                            <small>Extension</small>
                            <Form.Control size='sm' controlId='extension' name='extension' placeholder='Extension' />
                          </Grid>
                        </Grid>

                        <Grid container spacing={3}>
                          <Grid item sm={12} xs={12} mt={2}>
                            <Form.Group>
                              <small>Emergency contact information</small>
                              <Form.Control
                                controlId='emergencyContact'
                                size='sm'
                                rows={2}
                                name='emergencyContact'
                                placeholder='Emergency information'
                              />
                            </Form.Group>
                          </Grid>
                        </Grid>

                        <Grid container spacing={3}>
                          <Grid item sm={12} xs={12} mt={2}>
                            <Form.Group>
                              <small>Address</small>
                              <Form.Control
                                size='sm'
                                controlId='address'
                                rows={2}
                                name='address'
                                placeholder='Address'
                              />
                            </Form.Group>
                          </Grid>
                        </Grid>
                      </Grid>
                    </FormControl>
                  </Box>
                </Grid>
              </Grid>
              <Box sx={{ mb: 2, alignItems: 'center' }}>{loading && <LinearProgress />}</Box>
              <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 40 }}>
                {!loading && (
                  <>
                    <Button color='success' onClick={handleSubmit} variant='contained' sx={{ mr: 3 }}>
                      Update
                    </Button>
                    <Button type='button' color='warning' variant='contained' sx={{ mr: 3 }} onClick={() => close()}>
                      Close
                    </Button>
                  </>
                )}
              </Box>
            </Form>
          </>
        )
      case 1:
        return <StepDocuments employee={selectedEmployee} handleNext={handleNext} />
      case 2:
        return <StepPositions employee={selectedEmployee} handleNext={handleNext} />
      case 3:
        return (
          <StepAttendance
            getEmployee={getEmployee}
            employee={selectedEmployee}
            shifts={shiftsDataSource}
            handleNext={handleNext}
          />
        )
      case 4:
        return (
          <StepSalaryFormula
            getEmployee={getEmployee}
            employee={selectedEmployee}
            salaryFormula={salaryFormulaDataSource}
            deductions={deductionDataSource}
            compensations={compensationDataSource}
            handleNext={handleNext}
          />
        )
      case 5:
        return <StepSalary employee={selectedEmployee} handleNext={handleNext} />

      default:
        return null
    }
  }

  // ** States
  const [activeStep, setActiveStep] = useState(0)

  // Handle Stepper
  const handleNext = () => {
    setActiveStep(activeStep + 1)
  }

  // ------------------------------- Submit --------------------------------------

  const handleSubmit = () => {
    formRef.current.checkAsync().then(result => {
      if (!result.hasError) {
        let data = {}
        setLoading(true)
        data = formValue
        data._id = id
        data.countryID = countryID
        data.healthType = healthType
        data.dateOfBirth = dateOfBirth
        data.sourceOfHire = sourceOfHire
        data.employeeType = employeeType
        data.maritalStatus = maritalStatus
        data.gender = gender
        data.logo = newLogo
        data.status = newStatus
        data.updated_at = new Date()
        axios
          .post('/api/company-employee/edit-employee', {
            data
          })
          .then(function (response) {
            dispatch(fetchData({})).then(() => {
              toast.success('Employee (' + data.firstName + ' ' + data.lastName + ') Inserted Successfully.', {
                delay: 3000,
                position: 'bottom-right'
              })
              // router.push('/company-dashboard/department')
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

  // ------------------------------- Close --------------------------------------

  const close = () => {
    router.push('/company-dashboard/employee')
  }

  // ------------------------------- Image Function --------------------------------------

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

  const uploadImage = async event => {
    const file = event.target.files[0]
    const base64 = await convertBase64(file)
    setLogo(base64)
    setNewLogo(base64)
  }

  const openUpload = () => {
    inputFile.current.click()
  }

  // --------------------------- Stepper ------------------------------------

  const Stepper = styled(MuiStepper)(({ theme }) => ({
    margin: 'auto',
    maxWidth: 800,
    justifyContent: 'space-around',
    '& .MuiStep-root': {
      cursor: 'pointer',
      textAlign: 'center',
      paddingBottom: theme.spacing(8),
      '& .step-title': {
        fontSize: '1rem'
      },
      '&.Mui-completed + svg': {
        color: theme.palette.primary.main
      },
      '& + svg': {
        display: 'none',
        color: theme.palette.text.disabled
      },
      '& .MuiStepLabel-label': {
        display: 'flex',
        cursor: 'pointer',
        alignItems: 'center',
        svg: {
          marginRight: theme.spacing(1.5),
          fill: theme.palette.text.primary
        },
        '&.Mui-active, &.Mui-completed': {
          '& .MuiTypography-root': {
            color: theme.palette.primary.main
          },
          '& svg': {
            fill: theme.palette.primary.main
          }
        }
      },
      [theme.breakpoints.up('md')]: {
        paddingBottom: 0,
        '& + svg': {
          display: 'block'
        },
        '& .MuiStepLabel-label': {
          display: 'block'
        }
      }
    }
  }))

  const renderContent = () => {
    return getStepContent(activeStep)
  }

  if (session && session.user && !session.user.permissions.includes('EditEmployee'))
    return <NoPermission header='No Permission' description='No permission to edit employee'></NoPermission>

  return (
    <>
      <Grid container>
        <Grid item xs={12}>
          <Card>
            <Breadcrumbs aria-label='breadcrumb' sx={{ pb: 0, p: 3 }}>
              <Link underline='hover' color='inherit' href='/'>
                Home
              </Link>
              <Link underline='hover' color='inherit' href='/company-dashboard/employee/'>
                Employees
              </Link>
              <Typography color='text.primary' sx={{ fontSize: 18, fontWeight: '500' }}>
                Edit Employee{' '}
                {selectedEmployee && (
                  <span style={{ fontSize: 14, color: 'orange' }}>
                    ( {selectedEmployee.firstName + ' ' + selectedEmployee.lastName} )
                  </span>
                )}
              </Typography>
            </Breadcrumbs>
            <Divider />

            <CardContent sx={{ py: 5.375, pt: 1, pb: 2 }}>
              <StepperWrapper>
                <Stepper activeStep={activeStep} connector={<Icon icon='mdi:chevron-right' />}>
                  {steps.map((step, index) => {
                    return (
                      <Step key={index} onClick={() => setActiveStep(index)} sx={{}}>
                        <StepLabel icon={<></>}>
                          {step.icon}
                          <Typography className='step-title'>{step.title}</Typography>
                        </StepLabel>
                      </Step>
                    )
                  })}
                </Stepper>
              </StepperWrapper>
            </CardContent>

            <Divider sx={{ m: '0 !important' }} />

            {!isLoading && <CardContent>{renderContent()}</CardContent>}
            {isLoading && <Loading header='Please Wait'></Loading>}
          </Card>
        </Grid>
      </Grid>
    </>
  )
}

EditEmployee.getInitialProps = async ({ query: { id } }) => {
  return { id: id }
}

export default EditEmployee
