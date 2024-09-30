// ** React Imports
import { useState, forwardRef, useEffect, useRef } from 'react'

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
import { fetchData } from 'src/store/apps/companyEmployee'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import Loading from 'src/views/loading'
import NoPermission from 'src/views/noPermission'

import { styled } from '@mui/material/styles'

const { StringType, ArrayType } = Schema.Types

const styles = {
  marginBottom: 10
}
import dynamic from 'next/dynamic'

import 'suneditor/dist/css/suneditor.min.css' // Import Sun Editor's CSS File
import View from '../view'
import font from 'public/font/Tajawal-Regular-normal'

// import SunEditor, { buttonList } from 'suneditor-react'

// buttonList: [
//   ['undo', 'redo'],
//   ['bold', 'underline', 'italic', 'list'],
//   ['table', 'link', 'image'],
//   ['align', 'font', 'fontColor', 'fontSize'],
//   ['preview', 'print'],
//   ['list'],
//   [
//     {
//       name: 'customLink',
//       dataDisplay: 'dialog',
//       title: 'Custom link',
//       buttonClass: '111',
//       innerHTML: 'Employee Name'
//     }
//   ]
// ]

// SunEditor.insertHTML('...')

// const list = dynamic(() => import('suneditor/src/plugins/submenu/list'), {
//   ssr: false
// })

// import SunEditor, { buttonList } from 'suneditor-react'

// import suneditor from 'suneditor'
// import plugins from 'suneditor/src/plugins'
// import list from 'suneditor/src/plugins/submenu/list'

const fileType = ex => {
  switch (ex) {
    case 'jpg':
      return '/images/icons/file-icons/img.png'
      break
    default:
      return '/images/icons/file-icons/rar.png'
  }
}

const StyledList = styled(List)(({ theme }) => ({
  '& .MuiListItem-container': {
    border: `1px solid ${theme.palette.divider}`,
    '&:first-of-type': {
      borderTopLeftRadius: theme.shape.borderRadius,
      borderTopRightRadius: theme.shape.borderRadius
    },
    '&:last-child': {
      borderBottomLeftRadius: theme.shape.borderRadius,
      borderBottomRightRadius: theme.shape.borderRadius
    },
    '&:not(:last-child)': {
      borderBottom: 0
    },
    '& .MuiListItem-root': {
      paddingRight: theme.spacing(24)
    },
    '& .MuiListItemText-root': {
      marginTop: 0,
      '& .MuiTypography-root': {
        fontWeight: 500
      }
    }
  }
}))

const AddFormRequest = ({ popperPlacement, id }) => {
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
  const [notAuthorized, setNotAuthorized] = useState([]);
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
    getEmployees(), getForm()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    change_content()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEmployee])

  const getEmployees = () => {
    setLoading(true);

    axios.get('/api/company-employee', {}).then(res => {
      setallEmployees(res.data.data)
      res.data.data.map(employee => {
        employeesDataSource.push({
          label: employee.firstName + ' ' + employee.lastName + ' (' + employee.email + ')',
          value: employee._id
        })
      })
      setEmployeesDataSource(employeesDataSource)
      setLoading(false)
    }).catch(err => {

      let message = err?.response?.data?.message || err.toString();
      if (err.response.status == 401) {
        setNotAuthorized([...notAuthorized, 'ViewEmployee']);
        setEmployeesDataSource([{
          label: <div style={{ color: 'red' }}>
            no permission to View Employees
          </div>,
          value: undefined
        }])
        message = 'Error : Failed to fetch employees (No Permission to view Employees';
      }
      toast.error(message, { duraiton: 5000, position: 'bottom-right' });
      setLoading(false);

    })


  }

  const getForm = () => {
    axios.get('/api/form/' + id, {}).then(res => {
      setSelectedForm(res.data.data[0])
    }).catch((err) => { })
  }

  const handleClose = () => {
    router.push('/company-dashboard/form-request/')
  }

  const printRef = useRef(null)

  // ------------------------------ validate Mmodel ------------------------------------

  const validateMmodel = Schema.Model({
    title: StringType().isRequired('This field is required.'),
    type: StringType().isRequired('This field is required.'),
    version: StringType().isRequired('This field is required.')
  })

  // ------------------------------- Submit --------------------------------------

  const handleSubmit = async () => {
    let image = await saveCapture()

    let data = {
      type: selectedForm.type,
      content: image,
      applicant_id: selectedEmployee,
      form_id: router.query.id
    }

    axios
      .post('/api/request/add-request', {
        data
      })
      .then(function (response) {
        toast.success('requested Successfully.', {
          delay: 3000,
          position: 'bottom-right'
        })
        handleClose()
      })
      .catch(function (error) {
        toast.error('Error : ' + error.response.data.message + ' !', {
          delay: 3000,
          position: 'bottom-right'
        })
      })

    // formRef.current.checkAsync().then(result => {
    //   if (!result.hasError) {
    //     let data = {}
    //     data.title = formValue.title
    //     data.version = formValue.version
    //     data.type = formValue.type
    //     data.description = formValue.description
    //     data.content = content
    //     data.status = 'active'
    //     data.created_at = new Date().toISOString()()
    //     setLoading(true)
    //     setLoadingDescription('Form is inserting')

    //     // axios
    //     //   .post('/api/form/add-form', {
    //     //     data
    //     //   })
    //     //   .then(function (response) {
    //     //     router.push('/company-dashboard/form')
    //     //     toast.success('Form (' + data.title + ') Inserted Successfully.', {
    //     //       delay: 3000,
    //     //       position: 'bottom-right'
    //     //     })
    //     //   })
    //     //   .catch(function (error) {
    //     //     toast.error('Error : ' + error.response.data.message + ' !', {
    //     //       delay: 3000,
    //     //       position: 'bottom-right'
    //     //     })
    //     //     setLoading(false)
    //     //   })
    //   }
    // })
  }

  const change_content = () => {
    if (selectedEmployee) {
      const u = allEmployees.find(val => {
        return val._id == selectedEmployee
      })
      if (!u?.positions_info || !u?.positions_info?.length || u?.position_info?.length == 0) {
        toast.error('Employee is not assigned a position', { duration: 5000, position: 'bottom-right' });
        setSelectedEmployee(null);

        return;
      }
      setoptions(
        removedub(
          [
            ...options,
            {
              label: 'Employee Name',
              key: '--[Employee Name]--',
              replace: '<b>' + u.firstName + ' ' + u.lastName + ' </b>'
            },
            {
              label: 'Employee Position',
              key: '--[Employee Position]--',
              replace:
                '<b style="direction: rtl;letter-spacing: normal">' +
                u.positions_info.map(val => {
                  return val.positionTitle
                }) +
                '</b>'
            },
            {
              label: 'Employee Date',
              key: '--[Employee Date]--',
              replace:
                '<b>' +
                u.positions_info.reduce((a, b) => {
                  return new Date(a.startChangeDate) < new Date(b.startChangeDate) ? a : b
                }).startChangeDate +
                '</b>'
            },
            { label: 'Employee ID', key: '--[Employee ID]--', replace: '<b>' + u.idNo + '</b>' },
            { label: 'Company Name', key: '--[Company Name]--', replace: '<b>Company Name</b>' },
            { label: 'Date', key: '--[Date]--', replace: '<b>' + dateToYMD(new Date()) + '</b>' },
            { label: 'Time', key: '--[Time]--', replace: '<b>' + new Date().toLocaleTimeString() + '</b>' }
          ],
          'key'
        )
      )
    }
  }

  function dateToYMD(date) {
    var d = date.getDate()
    var m = date.getMonth() + 1 //Month from 0 to 11
    var y = date.getFullYear()

    return '' + y + '-' + (m <= 9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d)
  }

  function removedub(arr, key) {
    return [...new Map(arr.map(item => [item[key], item])).values()]
  }

  async function saveCapture() {
    const elemente = printRef.current
    const canvas = await html2canvas(elemente)
    const data = canvas.toDataURL('image/png')

    const pdf = new jsPDF()
    const imgProperties = pdf.getImageProperties(data)
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width

    pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save('print.pdf')

    return data
  }

  // -------------------------------- Routes -----------------------------------------------

  const close = () => {
    router.push('/company-dashboard/department')
  }

  const addToFiles = e => {
    let temp = files
    temp.push(e.blobFile)
    setFiles(temp)
  }

  // const Textarea = forwardRef((props, ref) => <Input as='textarea' />)

  // ------------------------------ View ---------------------------------

  if (loading) return <Loading header='Please Wait' description={loadingDescription}></Loading>

  if (session && session.user && !session.user.permissions.includes('AddFormRequest'))
    return <NoPermission header='No Permission' description='No permission to add Request'></NoPermission>

  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title='Add Request Form' sx={{ pb: 0, pt: 2 }} />
            <Divider />
            {selectedForm && (
              <Grid container>
                <Grid container spacing={2} xs={12} sm={12} md={12} sx={{ p: 2, px: 5, mb: 5 }}>
                  <Grid item sm={12} md={3}>
                    <small>Form Request</small>
                    <Typography sx={{ fontWeight: 'bold' }}>{selectedForm.title} </Typography>
                  </Grid>
                  <Grid item sm={12} md={4} mb={5}>
                    <small>Applicant</small>
                    <SelectPicker
                      size='sm'
                      controlId='type'
                      value={selectedEmployee}
                      name='type'
                      data={employeesDataSource}
                      block
                      onChange={setSelectedEmployee}
                    />
                  </Grid>

                  <div style={{ width: '100%', minWidth: '595px' }}>
                    <div className='content' ref={printRef}>
                      {selectedForm && <View divcontent={selectedForm.content} options={options}></View>}
                    </div>
                  </div>

                  {!loading && (
                    <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 40, mt: 5, mx: 2 }}>
                      <>
                        <Button color='success' onClick={handleSubmit} variant='contained' sx={{ mr: 3 }}>
                          Send
                        </Button>

                        <Button
                          type='button'
                          color='warning'
                          variant='contained'
                          sx={{ mr: 3 }}
                          onClick={() => setForm(false)}
                        >
                          Close
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

AddFormRequest.getInitialProps = async ({ query: { id } }) => {
  return { id: id }
}

export default AddFormRequest
