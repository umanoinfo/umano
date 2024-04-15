// ** React Imports
import { useState, forwardRef, useEffect, useRef, useCallback } from 'react'

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
import { EmployeesPositions } from 'src/local-db'

import { Input, InputGroup, Row, Col, Radio, RadioGroup } from 'rsuite'
import { Form, Schema, Panel } from 'rsuite'
import { DatePicker } from 'rsuite'

import { AutoComplete } from 'rsuite'
import { SelectPicker } from 'rsuite'

import 'rsuite/dist/rsuite.min.css'

// ** Axios Imports
import axios from 'axios'

import React from 'react';

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

const EditEmployee = ({ popperPlacement, id , tab}) => {
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
  const [countryID, setCountryID] = useState()
  const [dial, setDial] = useState()
  const [userID, setUserID] = useState()
  const [healthType, setHealthType] = useState()
  const [newLogo, setNewLogo] = useState()
  const [dateOfBirth, setDateOfBirth] = useState(new Date().toISOString().substring(0, 10))
  const [joiningDate , setJoiningDate] = useState(new Date().toISOString().substring(0, 10))
  const [newStatus, setNewStatus] = useState()
  const [maritalStatus, setMaritalStatus] = useState()
  const [employeeType, setEmployeeType] = useState()
  const [sourceOfHire, setSourceOfHire] = useState()
  const [position , setPosition ] = useState() ;
  const [gender, setGender] = useState('male')
  const [formError, setFormError] = useState({})
  const [formValue, setFormValue] = useState({})
  const formRef = useRef()
  const [selectedEmployee, setSelectedEmployee] = useState()
  const [deductionDataSource, setDeductionDataSource] = useState()
  const [compensationDataSource, setCompensationDataSource] = useState()
  const [unpaidLeaves , setUnpaidLeaves] = useState();
  const [parentalLeaves , setParentalLeaves] = useState();
  const [newEmployeeID , setNewEmployeeID] = useState() ;
  let [companyEmployeeID , setCompanyEmployeeID] = useState() ;
  const dispatch = useDispatch()
  const store = useSelector(state => state.companyEmployee)
  const { data: session, setSession } = useSession()
  
  const Textarea = React.forwardRef((props, ref) => <Input {...props} as="textarea" ref={ref} />);

  const companyStatus = ''
  const value = ''
  const type1 = ''


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

  const getEmployee = async (tab) => {
    setIsLoading(true);

    const companyIDRes = await axios.get('/api/company/max-employee-id',{}) ;
    companyEmployeeID = companyIDRes.data.companyEmployeeID ;
    
    const res = await fetch('/api/company-employee/' + id )
    const { data } = await res.json()
    
    setSelectedEmployee(data[0])
    setFormValue(data[0])
    setCountryID(data[0].countryID)
    setDateOfBirth(data[0].dateOfBirth)
    setJoiningDate(data[0].joiningDate)
    setSourceOfHire(data[0].sourceOfHire)
    setEmployeeType(data[0].employeeType)
    setMaritalStatus(data[0].maritalStatus)
    setAddress(data[0].address)
    setNewLogo(data[0].logo)
    setGender(data[0].gender)
    setParentalLeaves(data[0].parentalLeavesBeforeAddingToSystem);
    setUnpaidLeaves(data[0].unpaidLeavesBeforeAddingToSystem);
    if(companyEmployeeID ||  isNaN(data[0].idNo))
      setNewEmployeeID(Number(data[0].idNo.split(companyEmployeeID)[1]));
    else
      setNewEmployeeID(Number(data[0].idNo));
    setCompanyEmployeeID(companyIDRes.data.companyEmployeeID);
    console.log(data[0].idNo , companyEmployeeID , data[0].idNo.split(companyEmployeeID)[1] , Number(data[0].idNo.split(companyEmployeeID)[1]))
    if(tab){setActiveStep(Number(tab))}else{setActiveStep(0)}
    setPosition(data[0].type);
    setIsLoading(false)
  }
 
  const getMaxEmployeeId = async () => {
    setIsLoading(true)

    const res = await axios.get('/api/company/max-employee-id',{}).then(function (response) {
      setCompanyEmployeeID(response.data?.companyEmployeeID)
    })
   
    setIsLoading(false)
  }

  useEffect(() => {
    getMaxEmployeeId().then(
      getEmployee()
    )
    getCountries()
    getShifts()
    getSalaryFormula()
    getDeduction()
    getCompensation()
  }, [ ])


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
    setIsLoading(false);
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
              <Grid item xs={12} sm={12} md={12} sx={{ p: 2, mb: 5 }}>
                <Grid container spacing={3}>
                    <Grid item sm={12} xs={12} md={5} mt={1}>
                      <Form.Group controlId='idNo'>
                        <small>ID No.</small>
                        <InputGroup>
                         {companyEmployeeID && <Grid mt={1.5}><span >{companyEmployeeID}</span></Grid> }
                          { <Form.Control size='sm' type='number' checkAsync name='idNo' placeholder='ID No.' value={newEmployeeID}  onChange={(e)=>{setNewEmployeeID(e)}} /> }
                          {/* <input type='number' checkAsync name='idNo' placeholder='ID No' size={'sm'}  value={newEmployeeID} onChange={(e)=>{setNewEmployeeID(e.target.value)}} /> */}
                        </InputGroup>
                      </Form.Group>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid container spacing={3}>
                  <Grid item sm={12} xs={12} md={4} mt={2}>
                    <Form.Group controlId='firstName'>
                      <small>First Name</small>
                      <Form.Control size='sm' checkAsync name='firstName' placeholder='First Name' />
                    </Form.Group>
                  </Grid>
                  <Grid item sm={12} xs={12} md={4} mt={2}>
                    <Form.Group controlId='lastName'>
                      <small>Middle Name</small>
                      <Form.Control size='sm' checkAsync name='middleName' placeholder='Middle Name' />
                    </Form.Group>
                  </Grid>
                  <Grid item sm={12} xs={12} md={4} mt={2}>
                    <Form.Group controlId='lastName'>
                      <small>Last Name</small>
                      <Form.Control size='sm' checkAsync name='lastName' placeholder='Last Name' />
                    </Form.Group>
                  </Grid>
                </Grid>

                <Grid container spacing={3}>
                  <Grid item sm={5} md={4} xs={12} mt={2}>
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
                  <Grid item sm={6} md={8} xs={12} spacing={3} mt={2}>
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
                </Grid>

                <Grid container spacing={3}>
                  <Grid item sm={6} xs={12} md={6} mt={2}>
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
                  <Grid item sm={6} xs={12} md={6} mt={2}>
                      <small>Type </small>
                      <Form.Group
                          controlId='type'
                        >
                        <SelectPicker
                          size='sm'
                          name='type'
                          onChange={e => {
                            setPosition(e)
                          }}
                          checkAsync
                          value={position}
                          data={EmployeesPositions}
                          block
                        />
                      </Form.Group>
                    </Grid>
                </Grid>

                <Grid container spacing={3}>
                  <Grid item sm={12} md={6} sx={{ mt: 2 }}>
                    <small>Mobile phone</small>
                    <Form.Control
                      controlId='mobilePhone'
                      size='sm'
                      type='number'
                      name='mobilePhone'
                      placeholder='Mobile phone'
                    />
                  </Grid>
                  <Grid item sm={12} md={4} sx={{ mt: 2 }}>
                    <small>Work phone</small>
                    <Form.Control
                      controlId='workPhone'
                      type='number'
                      size='sm'
                      name='workPhone'
                      placeholder='Work phone'
                    />
                  </Grid>
                  <Grid item sm={12} md={2} sx={{ mt: 2 }}>
                    <small>Extension</small>
                    <Form.Control
                      size='sm'
                      type='number'
                      controlId='extension'
                      name='extension'
                      placeholder='Extension'
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={3}>
                  <Grid item sm={12} xs={12} md={6} mt={2}>
                    <Form.Group controlId='email'>
                      <small>Email</small>
                      <Form.Control size='sm' checkAsync name='email' placeholder='Email' />
                    </Form.Group>
                  </Grid>
                  <Grid item sm={12} md={6} sx={{ mt: 2 }}>
                    <small>Other email</small>
                    <Form.Control controlId='otherEmail' size='sm' name='otherEmail' placeholder='Other Email' />
                  </Grid>
                </Grid>

                <Grid container spacing={3}>
                  <Grid item sm={12}  md={4} xs={12} mt={2}>
                    <Form.Group>
                      <small>Emergency Contact Name</small>
                      <Form.Control
                        controlId='emergencyContactName'
                        size='sm'
                        type='text'
                        rows={2}
                        name='emergencyContactName'
                        placeholder='Emergency Contact Name'
                      />
                    </Form.Group>
                  </Grid>
                  <Grid item sm={12}  md={4} xs={12} mt={2}>
                    <Form.Group>
                      <small>Emergency Contact Mobile</small>
                      <Form.Control
                        controlId='emergencyContactMobile'
                        size='sm'
                        type='text'
                        rows={2}
                        name='emergencyContactMobile'
                        placeholder='Emergency Contact Mobile'
                      />
                    </Form.Group>
                  </Grid>
                  <Grid item sm={12}  md={4} xs={12} mt={2}>
                    <Form.Group>
                      <small>Emergency Contact Relationship</small>
                      <Form.Control
                        controlId='emergencyContactRelationship'
                        size='sm'
                        type='text'
                        rows={2}
                        name='emergencyContactRelationship'
                        placeholder='Emergency Contact Relationship'
                      />
                    </Form.Group>
                  </Grid>
                </Grid>

                <Grid container spacing={3}>
                  <Grid item sm={12} md={8} xs={12} mt={2}>
                    <Form.Group>
                      <small>Address</small>
                      <Form.Control
                         size='sm'
                         controlId='address'
                         rows={5}
                         name='address'
                         placeholder='Address'
                      />

                    </Form.Group>


                  </Grid>
                  <Grid item sm={12} md={4} xs={12} mt={2}>
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
                  </FormControl>
                  </Grid>
                </Grid>

                <Grid container spacing={3}>
                  <Grid item sm={12} xs={12} md={7} mt={2}>
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
                  <Grid item sm={5} xs={12} md={5} mt={2}>
                      <small>Joining Date</small>
                      <Form.Control
                        size='sm'
                        oneTap
                        accepter={DatePicker}
                        name='joiningDate'
                        onChange={e => {
                          setJoiningDate(e.toISOString().substring(0, 10))
                        }}
                        value={new Date(joiningDate)}
                        block
                      />
                    </Grid>
                </Grid>

                <Grid container spacing={3}>
                  <Grid item sm={12} md={6} xs={12} mt={2}>
                    <small>Health insurance type</small>
                    <Form.Control size='sm' checkAsync name='healthType' placeholder='Health insurance type' />
                  </Grid>
                  <Grid item sm={12} md={6} xs={12} mt={2}>
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
                <Typography sx={{ mt: 9, mb: 5, fontWeight: 600, fontSize: 15, color: 'blue' }}>
                        Leaves before adding to system:
                  </Typography>
                <Grid container spacing={3}>

                  <Grid item sm={12} xs={12} md={6} mt={2}>
                    <small> Unpaid Leaves</small>
                    <Form.Control
                      size='sm'
                      name='unpaidLeavesBeforeAddingToSystem'
                      controlId='unpaidLeavesBeforeAddingToSystem'
                      type='number'
                      placeholder='unpaid leaves'
                      onChange={(e)=>{setUnpaidLeaves(e)}}
                    />
                  </Grid>
                  {
                    gender == 'female' &&
                      <Grid item sm={12} xs={12} md={6} mt={2}>
                          <small>Parental Leaves over 60 (for each year) </small>
                          <Form.Control
                            size='sm'
                            name='parentalLeavesBeforeAddingToSystem'
                            controlId='parentalLeavesBeforeAddingToSystem'
                            type='number'
                            placeholder='parental leaves'
                            onChange={(e)=>{setParentalLeaves(e)}}
                          />
                      </Grid>
                  }
                 
                </Grid>
                <Typography sx={{ mt: 9, mb: 5, fontWeight: 600, fontSize: 15, color: 'blue' }}>
                  Home Country Details
                </Typography>
                <Grid container spacing={3}>
                  <Grid item sm={12} md={3} sx={{ mt: 2 }}>
                    <small>Phone Number</small>
                    <Form.Control
                      controlId='homePhoneNumber'
                      size='sm'
                      type='number'
                      name='HomePhoneNumber'
                      placeholder='Phone Number'
                    />
                  </Grid>
                  <Grid item sm={12} md={3} sx={{ mt: 2 }}>
                    <small>Mobile Number</small>
                    <Form.Control
                      controlId='homeMobileNumber'
                      type='number'
                      size='sm'
                      name='homeMobileNumber'
                      placeholder='Mobile Number'
                    />
                  </Grid>
                  <Grid item sm={12} md={6} sx={{ mt: 2 }}>
                    <small>Address</small>
                    <Form.Control
                      size='sm'
                      type='text'
                      controlId='homeAddress'
                      name='homeAddress'
                      placeholder='Address'
                    />
                  </Grid>
                </Grid>
              </Grid>
        
            

            <Box sx={{ mb: 2, alignItems: 'center' }}>{loading && <LinearProgress />}</Box>
            <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 40 }}>
              {!loading && (
                <>
                  <Button color='success' onClick={handleSubmit} variant='contained' sx={{ mr: 3 }}>
                    Save
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
  const [activeStep, setActiveStep] = useState()

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
        data.joiningDate =joiningDate
        data.sourceOfHire = sourceOfHire
        data.employeeType = employeeType
        data.maritalStatus = maritalStatus
        data.gender = gender
        data.logo = newLogo
        data.status = newStatus
        data.updated_at = new Date()
        data.parentalLeavesBeforeAddingToSystem = parentalLeaves ;
        data.unpaidLeavesBeforeAddingToSystem = unpaidLeaves;
        data.idNo = `${companyEmployeeID}${String(newEmployeeID)}`;
        data.type = position ; 

        axios
          .post('/api/company-employee/edit-employee', {
            data
          })
          .then(function (response) {

              toast.success('Employee (' + data.firstName + ' ' + data.lastName + ') Inserted Successfully.', {
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
    if(!isLoading )return getStepContent(activeStep)
  }

  if (isLoading) return <Loading header='Please Wait' description='Employee is loading'></Loading>

  if (session && session.user && !session.user.permissions.includes('EditEmployee'))
    return <NoPermission header='No Permission' description='No permission to edit employee'></NoPermission>

  return (
    <>
      {!isLoading && <Grid container>
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

            {!isLoading && <CardContent>{renderContent(tab)}</CardContent>}
            {isLoading && <Loading header='Please Wait'></Loading>}
          </Card>
        </Grid>
      </Grid>}
    </>
  )
}

EditEmployee.getInitialProps = async ({ query: { id , tab } }) => {
  return { id: id  , tab:tab}
}

export default EditEmployee
