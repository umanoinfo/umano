// ** React Imports
import { useState, forwardRef, useEffect, useRef } from 'react'

import Image from 'next/image'

import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import LinearProgress from '@mui/material/LinearProgress'
import Card from '@mui/material/Card'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Icon from 'src/@core/components/icon'
import { Divider, InputAdornment, Typography } from '@mui/material'
import List from '@mui/material/List'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction'
import ListItem from '@mui/material/ListItem'
import Avatar from '@mui/material/Avatar'
import toast from 'react-hot-toast'

// ** Rsuite Imports
import { Form, Schema, DatePicker, TagPicker, Uploader, Input, Checkbox, Textarea, SelectPicker } from 'rsuite'
import 'rsuite/dist/rsuite.min.css'

// ** Axios Imports
import axios from 'axios'

import { EditorOptions } from 'src/local-db'
import { FormType } from 'src/local-db'

// ** Actions Imports

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import Loading from 'src/views/loading'
import NoPermission from 'src/views/noPermission'

const { StringType, ArrayType } = Schema.Types

const styles = {
  marginBottom: 10
}

import 'suneditor/dist/css/suneditor.min.css' // Import Sun Editor's CSS File

const ViewFormRequest = ({ popperPlacement, id }) => {
  // ** States
  const [employeeId, setEmployeeId] = useState('')
  const [type, setType] = useState()
  const [loadingDescription, setLoadingDescription] = useState('Form is loading')
  const [form, setForm] = useState(false)
  const [open, setOpen] = useState(false)
  const [action, setAction] = useState('add')
  const [loading, setLoading] = useState(true)
  const [files, setFiles] = useState([])
  const [plan, setPlan] = useState('')
  const [employeeType, setEmployeeType] = useState('')
  const [value, setValue] = useState('')

  const [expiryDateFlag, setExpiryDateFlag] = useState(false)
  const [expiryDate, setExpiryDate] = useState(new Date().toISOString().substring(0, 10))
  const [preparedDate, setPreparedDate] = useState(new Date().toISOString().substring(0, 10))
  const [preparedBy, setPreparedBy] = useState()
  const [approvedDate, setApprovedDate] = useState(new Date().toISOString().substring(0, 10))
  const [approvedBy, setApprovedBy] = useState()
  const router = useRouter()
  const { data: session, status } = useSession
  const formRef = useRef()
  const inputFile = useRef(null)
  const [formError, setFormError] = useState({})
  const [formValue, setFormValue] = useState({})

  const [selectedForm, setSelectedForm] = useState()
  const [selectedEmployee, setSelectedEmployee] = useState()
  const [employeesDataSource, setEmployeesDataSource] = useState([])
  const [textAfterCursorPosition, setTextAfterCursorPosition] = useState('')
  const [divcontent, setDivcontent] = useState('')

  //-------------------- new
  const [allEmployees, setallEmployees] = useState([])
  const [options, setoptions] = useState([...EditorOptions])

  const editorRef = useRef()
  const ref = useRef()

  const getSunEditorInstance = sunEditor => {
    editorRef.current = sunEditor
  }

  const dispatch = useDispatch()
  const store = useSelector(state => state.companyEmployee)

  useEffect(() => {
    // getEmployees(),
    getForm()
  }, [])

  // const getEmployees = () => {
  //   axios.get('/api/company-employee', {}).then(res => {
  //     setallEmployees(res.data.data)
  //     res.data.data.map(employee => {
  //       employeesDataSource.push({
  //         label: employee.firstName + ' ' + employee.lastName + ' (' + employee.email + ')',
  //         value: employee._id
  //       })
  //     })
  //   })
  //   setEmployeesDataSource(employeesDataSource)
  //   setLoading(false)
  // }

  const getForm = () => {
    axios.get('/api/request/' + id, {}).then(res => {
      setSelectedForm(res.data.data[0])
      setLoading(false)
    })
  }

  const printRef = useRef(null)

  // ------------------------------ validate Mmodel ------------------------------------

  const validateMmodel = Schema.Model({
    title: StringType().isRequired('This field is required.'),
    type: StringType().isRequired('This field is required.'),
    version: StringType().isRequired('This field is required.')
  })

  // -------------------------------- Routes -----------------------------------------------

  const close = () => {
    router.push('/company-dashboard/form-request')
  }

  // ------------------------------ View ---------------------------------

  if (loading) return <Loading header='Please Wait' description={loadingDescription}></Loading>

  if (session && session.user && !session.user.permissions.includes('ViewFormRequest'))
    return <NoPermission header='No Permission' description='No permission to add Request'></NoPermission>

  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title='View Request Form' sx={{ pb: 0, pt: 2 }} />
            <Divider />
            {selectedForm && (
              <Grid container>
                <Grid container spacing={2} xs={12} sm={12} md={12} sx={{ p: 2, px: 5, mb: 5 }}>
                  <Grid item sm={12} md={3}>
                    <small>Request Number</small>
                    <Typography sx={{ fontWeight: 'bold' }}>{selectedForm.no} </Typography>
                  </Grid>
                  <Grid item sm={12} md={3}>
                    <small>Form Request</small>
                    <Typography sx={{ fontWeight: 'bold' }}>{selectedForm.form_info[0].title} </Typography>
                  </Grid>
                  <Grid item sm={12} md={3}>
                    <small>Applicant</small>
                    <Typography sx={{ fontWeight: 'bold' }}>
                      {selectedForm.applicant_info[0].firstName + ' ' + selectedForm.applicant_info[0].lastName}
                    </Typography>
                  </Grid>
                  <Grid item sm={12} md={3}>
                    <small>User Name</small>
                    <Typography sx={{ fontWeight: 'bold' }}>{selectedForm.user_info[0].name}</Typography>
                  </Grid>

                  <div style={{ display: 'flex', justifyContent: 'center', width: '100%', margin: '30px' }}>
                    <div className='content' ref={printRef}>
                      {selectedForm && (
                        <Image
                          src={selectedForm.content}
                          width={800}
                          height={700}
                          alt='Picture of the author'
                          priority
                        />
                      )}
                    </div>
                  </div>

                  {!loading && (
                    <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 40, mt: 5, mx: 2 }}>
                      <>
                        <Button type='button' color='warning' variant='contained' sx={{ mr: 3 }} onClick={() => close()}>
                          Back
                        </Button>
                      </>
                    </Box>
                  )}
                </Grid>
              </Grid>
            )}
          </Card>
        </Grid>
      </Grid>
    </>
  )
}

/* <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 40, mt: 5 }}>
{!loading && (
  <>


  </> */
// } }
// )}
// </Box>

ViewFormRequest.getInitialProps = async ({ query: { id } }) => {
  return { id: id }
}

export default ViewFormRequest
