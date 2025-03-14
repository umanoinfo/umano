// -------------------------new imports ---------------------
import CardContent from '@mui/material/CardContent'
import LinearProgress from '@mui/material/LinearProgress'

import CustomAvatar from 'src/@core/components/mui/avatar'

// ** React Imports
import { useState, useRef, useEffect, forwardRef } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'

import Icon from 'src/@core/components/icon'
import CustomChip from 'src/@core/components/mui/chip'

import { Breadcrumbs, Divider, Tab, Typography } from '@mui/material'

import toast from 'react-hot-toast'

// ** Rsuite Imports
import { Form, Schema, SelectPicker, DatePicker, Input } from 'rsuite'
import 'rsuite/dist/rsuite.min.css'

// ** Axios Imports
import axios from 'axios'

// import { EmployeeDeductionsType } from 'src/local-db'

// ** Store Imports
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import Loading from 'src/views/loading'
import NoPermission from 'src/views/noPermission'
import { DataGrid } from '@mui/x-data-grid'
import Link from 'next/link'
import { Chip } from '@mui/material'

const { StringType, NumberType, DateType } = Schema.Types

const Textarea = forwardRef((props, ref) => <Input {...props} as='textarea' ref={ref} />)

const types = [
  { label: 'Hourly', value: 'hourly' },
  { label: 'Daily', value: 'daily' }
]

const AddCME = ({ }) => {
  // ** States
  const [loadingDescription, setLoadingDescription] = useState('')
  const [action, setAction] = useState('add')

  const [tempFile, setTempFile] = useState()
  const [selectedDocument, setSelectedDocument] = useState()
  const [fileLoading, setFileLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const inputFile = useRef(null)
  const newinputFile = useRef(null)
  const [selectedFile, setSelectedFile] = useState()

  const [loading, setLoading] = useState(false)
  const [employeesDataSource, setEmployeesDataSource] = useState([])
  const router = useRouter()
  const { data: session, status } = useSession
  const formRef = useRef()
  const [formError, setFormError] = useState()
  let [employeesFullInfo, setEmployeesFullInfo] = useState([])
  const [CME, setCME] = useState();
  const { id, cmeId } = router.query;

  const getCME = () => {
    setLoading(true);
    axios.get(`/api/cme/${cmeId}`, {}).then(res => {

      let cme = res.data.data
      formValue.amount = cme.amount;
      formValue.date = new Date(cme.date);
      setTempFile(cme.url);
      setLoading(false)
    }).catch((err) => { })
  }

  const changeEmployee = (e) => {
    const employee = employeesFullInfo.find(val => {
      console.log(val);

      return val._id == e
    })

  }


  const handleAdd = () => {
    setSelectedDocument(null)
    setFormValue({ 'documentTitle': '', 'documentNo': '', 'documentDescription': '' })
    setAction('add')

    // setForm(true)
  }

  const handleDelete = e => {
    setSelectedDocument(e)
    setOpen(true)
  }

  const handleDeleteFile = e => {
    setOpen(true);

  }

  const deleteFile = () => {

    setLoading(true)

    let data = { ...formValue }
    delete data.file
    data._id = selectedDocument._id
    data.updated_at = new Date()
    axios
      .post('/api/employee-document/delete-documentFile', {
        data
      })
      .then(function (response) {

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


  const open_file = fileName => {
    window.open('https://umanu.blink-techno.com/' + fileName, '_blank')
  }

  // const uploadFile = async event => {
  //   setFileLoading(true)
  //   const file = event.target.files[0]
  //   let formData = new FormData()
  //   formData.append('file', file)
  //   formData.append('type', 'cme')
  //   let data = {}
  //   data.formData = formData
  //   axios
  //     .post('https://robin-sass.pioneers.network/api/test', formData)
  //     .then(response => {
  //       let data = {}
  //       data.amount = formValue.amount ;
  //       data.employee_id = formValue.employee_id ; 
  //       data.url = response.data ;

  //       axios
  //         .post('/api/cme/add-cme', {
  //           data
  //         })
  //         .then(function (response) {
  //           dispatch(fetchData({ employeeId: employee._id })).then(() => {
  //             toast.success('CME Record Inserted Successfully.', {
  //               delay: 3000,
  //               position: 'bottom-right'
  //             })
  //             setForm(false)
  //             setLoading(false)
  //             setFileLoading(false)
  //           })
  //         })
  //         .catch(function (error) {
  //           toast.error('Error : ' + error.response.data.message + ' !', {
  //             delay: 3000,
  //             position: 'bottom-right'
  //           })
  //           setLoading(false)
  //         })
  //       setFileLoading(false)
  //     })
  //     .catch(function (error) {
  //       toast.error('Error : ' + error.response + ' !', {
  //         delay: 3000,
  //         position: 'bottom-right'
  //       })
  //     })
  // }

  const uploadNewFile = async event => {
    setFileLoading(true)
    const file = event.target.files[0]
    let formData = new FormData()
    formData.append('file', file)
    formData.append('type', 'cme')
    let data = {}
    data.formData = formData
    axios
      .post('https://umanu.blink-techno.com/api/upload', formData)
      .then(response => {
        setTempFile(response.data)
        setFileLoading(false)
      })
      .catch(function (error) {
        toast.error('Error : ' + error.response + ' !', {
          delay: 3000,
          position: 'bottom-right'
        })
        setFileLoading(false)
      })
  }

  const openUploadFile = row => {
    inputFile.current.click()
  }

  const openNewUploadFile = row => {
    newinputFile.current.click()
  }


  // --------------forms values--------------------------------

  const default_value = {

  }
  const [formValue, setFormValue] = useState(default_value)

  useEffect(() => {
    getCME();
  }, [])

  // ------------------------------ validate Mmodel ------------------------------------

  const validateMmodel = Schema.Model({
    amount: NumberType().min(0).isRequired('Amount of Hour/s field is required'),
    date: DateType().isRequired('Date is required')
  });

  const handleSubmit = () => {
    setLoading(true);
    formRef.current.checkAsync().then((result) => {
      if (!result.hasError) {
        let data = formValue;
        data.url = tempFile;
        axios.post(`/api/cme/edit-cme/?id=${cmeId}`, data).then(res => {
          setFormValue(default_value);
          setTempFile(null);
          setLoading(false);
          toast.success('Updated successfully', { duration: 5000, position: 'bottom-right' });
          router.push(`/company-dashboard/cme/${id}`)

        }
        ).catch((err) => {
          toast.error(err.response.data.message, { duration: 5000, position: 'bottom-right' });
          setLoading(false);
        })
      }
      else {
        setLoading(false);

      }

    }

    )
  }


  // -------------------------------- Routes -----------------------------------------------

  const close = () => {
    router.push(`/company-dashboard/cme/${id}`)
  }

  // ------------------------------ View ---------------------------------

  if (loading) return <Loading header='Please Wait' description={'Loading...'}></Loading>

  if (session && session.user && !session.user.permissions.includes('EditCME'))
    return <NoPermission header='No Permission' description='No permission to add employees leaves'></NoPermission>

  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <Breadcrumbs aria-label='breadcrumb' sx={{ pb: 0, p: 3 }}>
              <Link underline='hover' color='inherit' href='/'>
                Home
              </Link>
              <Link underline='hover' color='inherit' href='/company-dashboard/cme/'>
                CME List
              </Link>
              <Typography color='text.primary' sx={{ fontSize: 18, fontWeight: '500' }}>
                Add Hour/s
              </Typography>
            </Breadcrumbs>
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
                    <Grid item sm={4} md={5} lg={3}>
                      <small>Employee</small>
                      <Form.Control
                        size='sm'
                        controlid='employee_id'
                        name='employee_id'
                        accepter={SelectPicker}
                        data={employeesDataSource}
                        block
                        value={id}
                        disabled={true}
                        onChange={e => {
                          changeEmployee(e)
                        }}
                      />
                    </Grid>

                    <Grid item sm={4} md={5} lg={3}>
                      <small>Date of certificate </small>
                      <Form.Control
                        size='sm'
                        controlid='date'
                        name='date'
                        accepter={DatePicker}
                        format={'dd/MM/yyyy'}
                        block
                        oneTap
                        value={formValue.date}
                      />
                    </Grid>


                    <Grid item sm={4} md={3} lg={3}>
                      <small>Amount of hours</small>
                      <Form.Control
                        size='sm'
                        controlid='amount'
                        name='amount'
                        type='number'
                        block
                        value={formValue.amount}
                      />
                    </Grid>


                    <Grid item sm={12} xs={12} mt={-4} mb={10}>
                      <Typography sx={{ pt: 6 }}>
                        File :
                        {tempFile && action == "add" && !fileLoading && (<span style={{ paddingRight: '10px', paddingLeft: '5px' }}><a href='#' onClick={() => open_file(tempFile)} >{tempFile}</a></span>)}
                        {tempFile && action == "add" && !fileLoading && (<Chip label='Delete' variant='outlined' size="small" color='error' onClick={() => setTempFile(null)} icon={<Icon icon='mdi:delete-outline' />} />)}
                        {selectedDocument?.file && !fileLoading && (<span style={{ paddingRight: '10px', paddingLeft: '5px' }}><a href='#' onClick={() => open_file(selectedFile)} >{selectedFile}</a></span>)}
                        {selectedDocument?.file && !fileLoading && (<Chip label='Delete' variant='outlined' size="small" color='error' onClick={() => handleDeleteFile()} icon={<Icon icon='mdi:delete-outline' />} />)}
                        {/* {selectedDocument && !fileLoading && action!="add" && <Chip label='Upload'  variant='outlined' size="small" color='primary'  sx = {{mx:2}} onClick={() => openUploadFile() } icon={<Icon icon='mdi:upload-outline' />} />} */}

                        {!fileLoading && action == "add" && <Chip label='Upload' variant='outlined' size="small" color='primary' sx={{ mx: 2 }} onClick={() => openNewUploadFile()} icon={<Icon icon='mdi:upload-outline' />} />}
                        {fileLoading && <small style={{ paddingLeft: '20px', fontStyle: 'italic', color: 'blue' }}>Uploading ...</small>}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 40, marginLeft: '1rem' }}>
                    {
                      (
                        <>
                          <Button color='success' type='submit' variant='contained' onClick={() => handleSubmit()} sx={{ mr: 3 }}>
                            Save
                          </Button>
                          <Button type='button' color='warning' variant='contained' sx={{ mr: 3 }} onClick={() => close()}>
                            Close
                          </Button>
                        </>
                      )
                    }
                  </Box>

                </Form>
                {/* <input
                id='file'
                ref={inputFile}
                hidden
                type='file'
                onChange={e => {
                  uploadFile(e)
                }}
                name='file'
               /> */}

                <input
                  id='newfile'
                  ref={newinputFile}
                  hidden
                  type='file'
                  onChange={e => {
                    uploadNewFile(e)
                  }}
                  name='file'
                />


              </Grid>
            </Grid>

          </Card>
        </Grid>
      </Grid>
    </>
  )
}

AddCME.getInitialProps = async ({ query: { id } }) => {
  return { id: id }
}

export default AddCME
