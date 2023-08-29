// ** React Imports
import { useState, forwardRef, useEffect, useRef } from 'react'

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
import { Breadcrumbs, Divider, InputAdornment, Typography } from '@mui/material'
import List from '@mui/material/List'
import ListItemText from '@mui/material/ListItemText'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction'
import ListItem from '@mui/material/ListItem'
import Avatar from '@mui/material/Avatar'
import toast from 'react-hot-toast'

// ** Rsuite Imports
import { Form, Schema, DatePicker, TagPicker, Uploader, Input, Checkbox } from 'rsuite'
import 'rsuite/dist/rsuite.min.css'

// ** Axios Imports
import axios from 'axios'

// ** Actions Imports
import { fetchData } from 'src/store/apps/company'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import Loading from 'src/views/loading'
import NoPermission from 'src/views/noPermission'

import { styled } from '@mui/material/styles'
import Link from 'next/link'

const { StringType, ArrayType } = Schema.Types

const styles = {
  marginBottom: 10
}

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

const AddDepartment = ({ popperPlacement, id }) => {
  // ** States
  const [employeeId, setEmployeeId] = useState('')
  const [plan, setPlan] = useState('')
  const [loadingDescription, setLoadingDescription] = useState('')
  const [value, setValue] = useState('')
  const [form, setForm] = useState(false)
  const [action, setAction] = useState('add')
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState([])
  const [selectedDocument, setSelectedDocument] = useState()

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

  const selectData = [
    'DOH',
    'CIVIL defense',
    'Waste management',
    'MCC',
    'Tasneef',
    'Oshad',
    'ADHICS',
    'Third Party Contracts',
    'Others'
  ].map(item => ({
    label: item,
    value: item
  }))

  const goToIndex = () => {
    router.push('/company-dashboard/document')
  }

  // ------------------------------ validate Mmodel ------------------------------------

  const validateMmodel = Schema.Model({
    title: StringType().isRequired('This field is required.'),
    type: ArrayType().minLength(1, 'Please select at least 1 types.').isRequired('This field is required.'),
    version: StringType().isRequired('This field is required.')
  })

  // ------------------------------- Submit --------------------------------------

  const handleSubmit = () => {
    formRef.current.checkAsync().then(result => {
      if (!result.hasError) {
        let data = {}
        data.title = formValue.title
        data.version = formValue.version
        data.type = formValue.type
        let arr = []
        data.description = formValue.description
        data.preparedDate = preparedDate
        data.approvedDate = approvedDate
        data.preparedBy = formValue.preparedBy
        data.approvedBy = formValue.approvedBy
        data.status = 'active'
        data.expiryDateFlag = expiryDateFlag
        if (!expiryDateFlag) {
          data.expiryDate = expiryDate
        } else {
          delete data.expiryDate
        }
        if (action == 'add') {
          setLoading(true)
          setLoadingDescription('Document is loading')
          data.created_at = new Date()
          axios
            .post('/api/document/add-document', {
              data
            })
            .then(function (response) {
              let doc_id = response.data.data._id
              let count = 0
              files.map(async file => {
                setLoadingDescription(file.name + ' is uploading')
                let formData = new FormData()
                formData.append('file', file)
                formData.append('type', 'document')
                axios.post('https://robin-sass.pioneers.network/api/test', formData).then(response => {
                  let data = {}
                  data.name = file.name
                  data.linked_id = doc_id
                  data.type = 'document'
                  data.url = response.data
                  data.created_at = new Date()
                  axios
                    .post('/api/file/add-file', {
                      data
                    })
                    .then(res => {})
                })
                goToIndex()
              })

              toast.success('Document (' + data.title + ') Inserted Successfully.', {
                delay: 3000,
                position: 'bottom-right'
              })

              close()
            })
            .catch(function (error) {
              toast.error('Error : ' + error.response.data.message + ' !', {
                delay: 3000,
                position: 'bottom-right'
              })
              setLoading(false)
            })
        }
        if (action == 'edit') {
          data._id = selectedDocument._id
          data.updated_at = new Date()
          axios
            .post('/api/employee-document/edit-document', {
              data
            })
            .then(function (response) {
              dispatch(fetchData({ employeeId: employee._id })).then(() => {
                toast.success('Document (' + data.title + ') Inserted Successfully.', {
                  delay: 3000,
                  position: 'bottom-right'
                })
                setForm(false)
                setLoading(false)
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
      }
    })
  }

  // -------------------------------- Routes -----------------------------------------------

  const close = () => {
    router.push('/company-dashboard/document')
  }

  const addToFiles = e => {
    let temp = files
    temp.push(e.blobFile)
    setFiles(temp)
  }

  const removeFile = e => {}

  // const Textarea = forwardRef((props, ref) => <Input as='textarea' />)

  // ------------------------------ View ---------------------------------

  if (loading) return <Loading header='Please Wait' description={loadingDescription}></Loading>

  if (session && session.user && !session.user.permissions.includes('AddDocument'))
    return <NoPermission header='No Permission' description='No permission to add document'></NoPermission>

  return (
    <>
      <Grid item xs={12} sm={6} lg={6}></Grid>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <Breadcrumbs aria-label='breadcrumb' sx={{ pb: 0, p: 3 }}>
              <Link underline='hover' color='inherit' href='/'>
                Home
              </Link>
              <Link underline='hover' color='inherit' href='/company-dashboard/document/'>
                All Documents List
              </Link>
              <Typography color='text.primary' sx={{ fontSize: 18, fontWeight: '500' }}>
                Add Document
              </Typography>
            </Breadcrumbs>
            <Divider />
            <Grid container>
              <Grid item xs={12} sm={6} md={6} sx={{ p: 2, px: 5, mb: 5 }}>
                <Form
                  fluid
                  ref={formRef}
                  onChange={setFormValue}
                  onCheck={setFormError}
                  formValue={formValue}
                  model={validateMmodel}
                >
                  <Grid container sx={{ px: 5 }}>
                    <Grid item spacing={3} sm={12} md={12}>
                      <small>Tags</small>
                      <Form.Control
                        name='type'
                        controlId='type'
                        accepter={TagPicker}
                        data={selectData}
                        style={{ width: '100%' }}
                      />
                    </Grid>
                    <Grid container sm={12} md={12}>
                      <Grid item sm={8} md={8} pr={2}>
                        <small>Title</small>
                        <Form.Control controlId='title' size='sm' name='title' placeholder='Title' />
                      </Grid>
                      <Grid item sm={4} md={4}>
                        <small>Version</small>
                        <Form.Control
                          controlId='version'
                          size='sm'
                          type='text'
                          name='version'
                          placeholder='Version'
                        />
                      </Grid>
                    </Grid>

                    <Grid item sm={12} md={12} sx={{ mt: 2 }}>
                      <small>Description</small>
                      <Form.Control rows={2} name='description' controlId='description'  />
                    </Grid>
                    <Grid container spacing={3}>
                      <Grid item sm={6} xs={12} mt={2}>
                        <div className='flex d-flex row-flex'>
                          <small>Expiry Date</small>
                          {!expiryDateFlag && (
                            <Form.Control
                              size='sm'
                              oneTap
                              accepter={DatePicker}
                              name='expiryDate'
                              onChange={e => {
                                setExpiryDate(e.toISOString().substring(0, 10))
                              }}
                              value={new Date(expiryDate)}
                              block
                            />
                          )}
                        </div>
                      </Grid>
                      <Grid item sm={6} xs={12} mt={2}>
                        <Typography sx={{ pt: 6 }}>
                          <Form.Control
                            name='checkbox'
                            accepter={Checkbox}
                            inline
                            checked={expiryDateFlag}
                            onChange={e => {
                              setExpiryDateFlag(!expiryDateFlag)
                            }}
                          >
                            For ever
                          </Form.Control>
                        </Typography>
                      </Grid>
                    </Grid>
                    {/* <Grid container spacing={3} sx={{ mt: 0.1 }}>
                      <Grid item sm={4} xs={4}>
                        <div className='flex d-flex row-flex'>
                          <small>Prepared Date</small>
                          <Form.Control
                            size='sm'
                            oneTap
                            accepter={DatePicker}
                            name='preparedDate'
                            onChange={e => {
                              setPreparedDate(e.toISOString().substring(0, 10))
                            }}
                            value={new Date(preparedDate)}
                            block
                          />
                        </div>
                      </Grid>
                      <Grid item sm={8} md={8}>
                        <small>Prepared By</small>
                        <Form.Control
                          controlId='preparedBy'
                          size='sm'
                          type='text'
                          name='preparedBy'
                          placeholder='Prepared By'
                        />
                      </Grid>
                    </Grid>
                    <Grid container spacing={3} sx={{ mt: 0.1 }}>
                      <Grid item sm={4} xs={4}>
                        <div className='flex d-flex row-flex'>
                          <small>Approved Date</small>
                          <Form.Control
                            size='sm'
                            oneTap
                            accepter={DatePicker}
                            name='approvedDate'
                            onChange={e => {
                              setApprovedDate(e.toISOString().substring(0, 10))
                            }}
                            value={new Date(approvedDate)}
                            style={{ zIndex: '0 !important' }}
                            block
                          />
                        </div>
                      </Grid>
                      <Grid item sm={8} md={8}>
                        <small>Approved By</small>
                        <Form.Control
                          controlId='approvedBy'
                          size='sm'
                          type='text'
                          name='approvedBy'
                          placeholder='Approved By'
                        />
                      </Grid>
                    </Grid> */}

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
                      )}
                    </Box>
                  </Grid>
                </Form>
              </Grid>
              <Grid item xs={12} sm={6} md={6} sx={{ p: 2, px: 5, mb: 5 }}>
                <small style={{ color: 'white' }}>.</small>
                <Card>
                  <Box
                    sx={{
                      pt: 2,
                      px: 2,
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Typography sx={{ fontWeight: 'bold' }}>Files</Typography>

                    {/* <Button
                      variant='outlined'
                      size='small'
                      onClick={e => {
                        openUploadFile()
                      }}
                    >
                      Add File
                    </Button> */}
                  </Box>

                  <Divider />
                  <Box sx={{ p: 2 }}>
                    <Uploader
                      listType='picture-text'
                      autoUpload
                      onRemove={e => removeFile(e)}
                      onUpload={e => addToFiles(e)}
                      action=''
                    />
                  </Box>
                </Card>
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
