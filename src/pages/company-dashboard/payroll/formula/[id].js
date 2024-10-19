// ** React Imports
import { useState, useRef, useCallback } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'

import { Divider, Tab, Typography } from '@mui/material'

import toast from 'react-hot-toast'
import TabList from '@mui/lab/TabList'

// ** Rsuite Imports
import { Form, Schema, SelectPicker } from 'rsuite'
import 'rsuite/dist/rsuite.min.css'

// ** Axios Imports
import axios from 'axios'

import { FormulaType } from 'src/local-db'

// ** Store Imports
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import Loading from 'src/views/loading'
import NoPermission from 'src/views/noPermission'

const { StringType } = Schema.Types

import { TabContext, TabPanel } from '@mui/lab'
import { useEffect } from 'react'

const AddDepartment = ({ popperPlacement, id }) => {
  // ** States
  const [loadingDescription, setLoadingDescription] = useState('')
  const [tabValue, setTabValue] = useState('Over Time')
  const [action, setAction] = useState('add')
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState([])
  const router = useRouter()
  const { data: session, status } = useSession
  const formRef = useRef()
  const [formError, setFormError] = useState()

  // --------------forms values--------------------------------

  const default_value = {
    type: 'Monthly',
    firstOverTime: 1.5,
    secondOverTime: 1.5,
    thirdOverTime: 1.5,
    holidayOverTime: 2,
    weekendOverTime: 2,
    justifiedAbsenceDay: 1,
    notJustifiedAbsenceDay: 2,
    justifiedAbsenceHoure: 1,
    notJustifiedAbsenceHoure: 2,
    compensationFrom1To5: 21,
    compensationMoreThan5: 30,
    maxCompensation: 2,
    paidLeave: 100,
    unpaidLeave: 0,
    sickLeave: 30,
    sickLeaveFrom1To15: 100,
    sickLeaveFrom16To30: 50,
    sickLeaveFrom31To90: 0,
    maternityLeave: 100,
    parentalLeaveFrom1To45: 100,
    parentalLeaveFrom46To60: 50,
    parentalLeaveFrom61To105: 0,
  }
  const [formValue, setFormValue] = useState(default_value)

  const getFormula = () => {
    setLoading(true)
    axios
      .get('/api/salary-formula/' + id, {})
      .then(function (response) {
        setLoading(false)
        setFormValue(response.data.data[0])
      })
      .catch(function (error) {
        setLoading(false)
      })
  };
  useEffect(() => {
    getFormula()
  }, [])

  // ------------------------------ validate Mmodel ------------------------------------

  const validateMmodel = Schema.Model({
    title: StringType().isRequired('This field is required.'),
    type: StringType().isRequired('This field is required.')
  })

  // ------------------------------- Submit --------------------------------------

  const handleSubmit = () => {
    formRef.current.checkAsync().then(result => {
      if (!result.hasError) {
        let data = { ...formValue }
        data.status = 'active'
        data.created_at = new Date().toISOString()
        setLoading(true)
        setLoadingDescription('Form is inserting')
        axios
          .post('/api/salary-formula/edit-formula', {
            data
          })
          .then(function (response) {
            // router.push('/company-dashboard/form')
            toast.success('Formula (' + data.title + ') Edited Successfully.', {
              delay: 3000,
              position: 'bottom-right'
            })
            close()
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
    router.push('/company-dashboard/payroll/formula/')
  }

  const addToFiles = e => {
    let temp = files
    temp.push(e.blobFile)
    setFiles(temp)
  }

  // const Textarea = forwardRef((props, ref) => <Input as='textarea' />)

  // ------------------------------ View ---------------------------------

  if (loading) return <Loading header='Please Wait' description={loadingDescription}></Loading>

  if (session && session.user && !session.user.permissions.includes('EditPayrollFormula'))
    return <NoPermission header='No Permission' description='No permission to edit payroll formula'></NoPermission>

  return (
    <>
      <Grid item xs={12} sm={6} lg={6}></Grid>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title='Add Salary Formula' sx={{ pb: 0, pt: 2 }} />
            <Divider />
            <Grid container>
              <Grid item xs={12} sm={12} md={12} sx={{ p: 2, px: 5, mb: 5 }}>
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
                        data={FormulaType}
                        block
                      />
                    </Grid>
                    <Grid item sm={12} md={8}>
                      <small>Title</small>
                      <Form.Control controlId='title' size='sm' name='title' placeholder='Title' />
                    </Grid>
                    {
                      formValue.type != 'Flexible' ?

                        <Grid item size='sm' sm={12} md={12} sx={{ mt: 2 }}>
                          <TabContext value={tabValue}>
                            <TabList variant='fullWidth' onChange={handleChange} aria-label='full width tabs example'>
                              <Tab value='Over Time' label='Over Time' />
                              <Tab value='Absence' label='Absence' />
                              <Tab value='Leave' label='Leave' />
                              <Tab value='EndOfService' label='End Of Service' />
                            </TabList>
                            <TabPanel value='Over Time'>
                              <Typography sx={{ mb: 5 }}>Over Time</Typography>
                              <Grid item sm={12} md={6}>
                                <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                                  <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                                    Over time :
                                  </Typography>
                                  <Form.Control
                                    controlId='firstOverTime'
                                    size='sm'
                                    type='number'
                                    name='firstOverTime'
                                    placeholder='First'
                                  />
                                  <Typography variant='body2' sx={{ ml: 2, width: '100%' }}>
                                    Hour/s
                                  </Typography>
                                </Box>
                                {/* <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                                <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                                  Second over time :
                                </Typography>
                                <Form.Control
                                  controlId='secondOverTime'
                                  type='number'
                                  size='sm'
                                  name='secondOverTime'
                                  placeholder='Second'
                                />
                                <Typography variant='body2' sx={{ ml: 2, width: '100%' }}>
                                  Hour/s
                                </Typography>
                              </Box>
                              <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                                <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                                  Third over time :
                                </Typography>
                                <Form.Control
                                  controlId='thirdOverTime'
                                  type='number'
                                  size='sm'
                                  name='thirdOverTime'
                                  placeholder='Third'
                                />
                                <Typography variant='body2' sx={{ ml: 2, width: '100%' }}>
                                  Hour/s
                                </Typography>
                              </Box> */}

                                <Box sx={{ mb: 1, mt: 8, display: 'flex', alignItems: 'center' }}>
                                  <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                                    Holiday :
                                  </Typography>
                                  <Form.Control
                                    controlId='holidayOverTime'
                                    type='number'
                                    size='sm'
                                    name='holidayOverTime'
                                    placeholder='Holiday'
                                  />
                                  <Typography variant='body2' sx={{ ml: 2, width: '100%' }}>
                                    Hour/s
                                  </Typography>
                                </Box>
                                <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                                  <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                                    Weekend :
                                  </Typography>
                                  <Form.Control
                                    controlId='weekendOverTime'
                                    type='number'
                                    size='sm'
                                    name='weekendOverTime'
                                    placeholder='Weekend'
                                  />
                                  <Typography variant='body2' sx={{ ml: 2, width: '100%' }}>
                                    Hour/s
                                  </Typography>
                                </Box>
                              </Grid>
                            </TabPanel>

                            <TabPanel value='Absence'>
                              <Grid container spacing={1} sx={{ px: 5 }}>
                                <Grid item sm={12} md={6}>
                                  {/* <Typography sx={{ mt: 5, mb: 1 }}>Absence Hour/s </Typography>
                                  <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                                    <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                                      Justified :
                                    </Typography>
                                    <Form.Control
                                      controlId='justifiedAbsenceHoure'
                                      type='number'
                                      size='sm'
                                      name='justifiedAbsenceHoure'
                                      placeholder='Justified'
                                    />
                                    <Typography variant='body2' sx={{ ml: 2, width: '100%' }}>
                                      Hour/s
                                    </Typography>
                                  </Box> */}
                                  <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                                    <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                                      Not Justified :
                                    </Typography>
                                    <Form.Control
                                      controlId='notJustifiedAbsenceHoure'
                                      type='number'
                                      size='sm'
                                      name='notJustifiedAbsenceHoure'
                                      placeholder='Not Justified'
                                    />
                                    <Typography variant='body2' sx={{ ml: 2, width: '100%' }}>
                                      Hour/s
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item sm={12} md={6}>
                                  {/* <Typography sx={{ mt: 5, mb: 1 }}>Absence Days</Typography>
                                  <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                                    <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                                      Justified :
                                    </Typography>
                                    <Form.Control
                                      controlId='justifiedAbsenceDay'
                                      size='sm'
                                      type='number'
                                      name='justifiedAbsenceDay'
                                      placeholder='Justified'
                                    />
                                    <Typography variant='body2' sx={{ ml: 2, width: '100%' }}>
                                      Day/s
                                    </Typography>
                                  </Box>
                                  <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                                    <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                                      Not Justified :
                                    </Typography>
                                    <Form.Control
                                      controlId='notJustifiedAbsenceDay'
                                      type='number'
                                      size='sm'
                                      name='notJustifiedAbsenceDay'
                                      placeholder='Not Justified'
                                    />
                                    <Typography variant='body2' sx={{ ml: 2, width: '100%' }}>
                                      Day/s
                                    </Typography>
                                  </Box> */}
                                </Grid>

                              </Grid>
                            </TabPanel>

                            <TabPanel value='Leave'>
                              <Grid container spacing={1} sx={{ px: 5 }}>
                                <Grid item sm={12} md={6}>
                                  <Typography sx={{ mt: 5, mb: 1 }}>leaves</Typography>
                                  <Box sx={{ mb: 1, mt: 5, display: 'flex', alignItems: 'center' }}>
                                    <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                                      Paid leave :
                                    </Typography>
                                    <Form.Control
                                      controlId='paidLeave'
                                      size='sm'
                                      type='number'
                                      name='paidLeave'
                                      placeholder='Paid leave'
                                    />
                                    <Typography variant='body2' sx={{ ml: 2, width: '100%' }}>
                                      %
                                    </Typography>
                                  </Box>
                                  <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                                    <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                                      Unpaid Leave :
                                    </Typography>
                                    <Form.Control
                                      controlId='unpaidLeave'
                                      size='sm'
                                      type='number'
                                      name='unpaidLeave'
                                      placeholder='Unpaid Leave'
                                    />
                                    <Typography variant='body2' sx={{ ml: 2, width: '100%' }}>
                                      %
                                    </Typography>
                                  </Box>
                                  <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                                    Sick Leave :
                                  </Typography>
                                  <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                                    <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                                      &emsp;&emsp; From 1 to 15
                                    </Typography>
                                    <Form.Control
                                      controlId='sickLeaveFrom1To15'
                                      size='sm'
                                      type='number'
                                      name='sickLeaveFrom1To15'
                                      placeholder='Sick Leave'
                                    />
                                    <Typography variant='body2' sx={{ ml: 2, width: '100%' }}>
                                      %
                                    </Typography>
                                  </Box>
                                  <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                                    <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                                      &emsp;&emsp; From 16 to 30
                                    </Typography>
                                    <Form.Control
                                      controlId='sickLeaveFrom16To30'
                                      size='sm'
                                      type='number'
                                      name='sickLeaveFrom16To30'
                                      placeholder='Sick Leave'
                                    />
                                    <Typography variant='body2' sx={{ ml: 2, width: '100%' }}>
                                      %
                                    </Typography>
                                  </Box>
                                  <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                                    <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                                      &emsp;&emsp; From 31 to 90
                                    </Typography>
                                    <Form.Control
                                      controlId='sickLeaveFrom31To90'
                                      size='sm'
                                      type='number'
                                      name='sickLeaveFrom31To90'
                                      placeholder='Sick Leave'
                                    />
                                    <Typography variant='body2' sx={{ ml: 2, width: '100%' }}>
                                      %
                                    </Typography>
                                  </Box>
                                  {/* <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                                  <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                                  Maternity Leave :
                                  </Typography>
                                  <Form.Control
                                    controlId='maternityLeave'
                                    size='sm'
                                    type='number'
                                    name='maternityLeave'
                                    placeholder='Maternity Leave'
                                  />
                                  <Typography variant='body2' sx={{ ml: 2, width: '100%' }}>
                                  %
                                  </Typography>
                                </Box> */}
                                  <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                                    <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                                      Maternity Leave :
                                    </Typography>
                                  </Box>
                                  <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                                    <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                                      &emsp;&emsp; From 1 to 45
                                    </Typography>
                                    <Form.Control
                                      controlId='parentalLeaveFrom1To45'
                                      size='sm'
                                      type='number'
                                      name='parentalLeaveFrom1To45'
                                      placeholder='Parental Leave'
                                    />
                                    <Typography variant='body2' sx={{ ml: 2, width: '100%' }}>
                                      %
                                    </Typography>
                                  </Box>

                                  <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                                    <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                                      &emsp;&emsp; From 46 to 60
                                    </Typography>
                                    <Form.Control
                                      controlId='parentalLeaveFrom46To60'
                                      size='sm'
                                      type='number'
                                      name='parentalLeaveFrom46To60'
                                      placeholder='Parental Leave'
                                    />
                                    <Typography variant='body2' sx={{ ml: 2, width: '100%' }}>
                                      %
                                    </Typography>
                                  </Box>
                                  <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                                    <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                                      &emsp;&emsp; From 61 to 105
                                    </Typography>
                                    <Form.Control
                                      controlId='parentalLeaveFrom61To105'
                                      size='sm'
                                      type='number'
                                      name='parentalLeaveFrom61To105'
                                      placeholder='Parental Leave'
                                    />
                                    <Typography variant='body2' sx={{ ml: 2, width: '100%' }}>
                                      %
                                    </Typography>
                                  </Box>


                                </Grid>
                                <Grid item sm={12} md={6}>
                                </Grid>
                              </Grid>
                            </TabPanel>

                            <TabPanel value='EndOfService'>
                              <Grid container spacing={1} sx={{ px: 5 }}>
                                <Grid item sm={12} md={12}>
                                  <Typography sx={{ mt: 5, mb: 1 }}>End of service Allowance</Typography>
                                  <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                                    <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                                      From 1 to 5 year :
                                    </Typography>
                                    <Form.Control
                                      controlId='compensationFrom1To5'
                                      size='sm'
                                      type='number'
                                      name='compensationFrom1To5'
                                      placeholder='From 1 to 5 year'
                                    />
                                    <Typography variant='body2' sx={{ ml: 2, width: '100%' }}>
                                      Day/s
                                    </Typography>
                                  </Box>
                                  <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                                    <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                                      More than 5 year :
                                    </Typography>
                                    <Form.Control
                                      controlId='compensationMoreThan5'
                                      type='number'
                                      size='sm'
                                      name='compensationMoreThan5'
                                      placeholder='More than 5 year'
                                    />
                                    <Typography variant='body2' sx={{ ml: 2, width: '100%' }}>
                                      Day/s
                                    </Typography>
                                  </Box>
                                  <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                                    <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                                      Maximum end of service Allowance :
                                    </Typography>
                                    <Form.Control
                                      controlId='maxCompensation'
                                      type='number'
                                      size='sm'
                                      name='maxCompensation'
                                      placeholder='Maximum'
                                    />
                                    <Typography variant='body2' sx={{ ml: 2, width: '100%' }}>
                                      year
                                    </Typography>
                                  </Box>
                                </Grid>
                              </Grid>
                            </TabPanel>
                          </TabContext>
                        </Grid>


                        :

                        <></>
                    }

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
