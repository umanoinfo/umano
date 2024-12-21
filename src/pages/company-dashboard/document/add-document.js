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
  const router = useRouter()
  const documentCategory = router.query?.category ;
  const [employeeId, setEmployeeId] = useState('')
  const [plan, setPlan] = useState('')
  const [loadingDescription, setLoadingDescription] = useState('')
  const [value, setValue] = useState('')
  const [form, setForm] = useState(false)
  const [action, setAction] = useState('add')
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState([])
  const [selectedDocument, setSelectedDocument] = useState()
  const [tags, setTags] = useState(documentCategory ? [documentCategory] : []);
  const [notAuthorized, setNotAuthorized] = useState([]);
  const [expiryDateFlag, setExpiryDateFlag] = useState(false)
  const [expiryDate, setExpiryDate] = useState(new Date().toISOString().substring(0, 10))
  const [issueDate, setIssueDate] = useState(new Date().toISOString().substring(0, 10))
  const [preparedDate, setPreparedDate] = useState(new Date().toISOString().substring(0, 10))
  const [preparedBy, setPreparedBy] = useState()
  const [approvedDate, setApprovedDate] = useState(new Date().toISOString().substring(0, 10))
  const [approvedBy, setApprovedBy] = useState()
  const { data: session, status } = useSession
  const formRef = useRef()
  const inputFile = useRef(null)
  const [formError, setFormError] = useState({})
  const [formValue, setFormValue] = useState({})
  const [AllDocumentTypes, setAllDocumentTypes] = useState();
  const [documentTypeCategory, setDocumentTypeCategory] = useState();
  
  const getDocumentTypes = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/document-types');
      if (res.status == 200) {
        const documents = new Map();

        let data = res?.data?.data?.map((document) => {
          return { label: document.name + ' ( ' + document.category + ' )', value: document.name, category: document.category };
        })
        let map = new Map();
        res?.data?.data?.map((document) => {
          map[document.name] = document.category;
        });
        setDocumentTypeCategory(map);
        setAllDocumentTypes(data);
        setLoading(false);
      }

    } catch (err) {
      let message = err.toString();
      if (err.response.status == 401) {
        message = 'Error : Failed to fetch Document type (No Permission to View Document Types)';
        setAllDocumentTypes([{
          label: 'You do not have permission to view Document types',
          value: undefined
        }])
        setNotAuthorized([...notAuthorized, 'ViewDocumentTypes']);
      }
      toast.error(message, { duration: 5000, position: 'bottom-right' });
      setLoading(false);
    }
  }

  useEffect(() => {
    getDocumentTypes();
  }, [])

  const goToIndex = () => {
    router.push('/company-dashboard/document')
  }

  // ------------------------------ validate Mmodel ------------------------------------

  const validateMmodel = Schema.Model({
    title: StringType().isRequired('This field is required.'),
    type: ArrayType().minLength(1, 'Please select at least 1 types.').isRequired('This field is required.'),
    version: StringType().isRequired('This field is required.')
  })

  const renderThumbnail = (file) => { // Check if the file has a thumbnail, otherwise use the default
    // const thumbnail = file.url ? file.url : defaultThumbnail;

    return ( <img src={'/images/icons/file-icons/file.png'} alt="Document" style={{ width: 50, height: 50, objectFit: 'cover' }} /> );
 };

  const handleTagsChange = (e) => {
    console.log(e , documentTypeCategory , notAuthorized);
    
    // if (notAuthorized.includes('ViewDocumentTypes'));
    // {

    //   return;
    // }

    let categories = new Set(e?.map((type) => {

      return documentTypeCategory[type];
    }));
    categories = [...categories];
    setTags(categories);
  }

  // ------------------------------- Submit --------------------------------------

  const handleSubmit = () => {
    if (notAuthorized.includes('ViewDocumentTypes'))
      return;

    formRef.current.checkAsync().then(result => {
      if (!result.hasError) {
        let data = {}
        console.log(formValue);
        data.title = formValue.title
        data.version = formValue.version
        data.type = formValue.type

        let categories = new Set(data.type?.map((type) => {
          return documentTypeCategory[type];
        }));
        data.category = [...categories];
        let arr = []
        data.description = formValue.description
        data.preparedDate = preparedDate
        data.approvedDate = approvedDate
        data.preparedBy = formValue.preparedBy
        data.approvedBy = formValue.approvedBy
        data.notifyBefore = formValue.notifyBefore
        data.renewing_name = formValue.renewing_name
        data.renewing_phone = formValue.renewing_phone
        data.renewing_email = formValue.renewing_email
        data.status = 'active'
        data.issueDate = issueDate
        data.expiryDateFlag = expiryDateFlag

        // if (tags.includes('Vendors')) 
        {
          data.companyEmail = formValue.companyEmail;
          data.companyName = formValue.companyName;
          data.companyMobile = formValue.companyMobile;
          data.companyFax = formValue.companyFax;
          data.companyLandline = formValue.companyLandline;
          data.companyContactPerson = formValue.companyContactPerson;
        }

        // if (tags.includes('Third Party Contracts')) 
        {
          data.thirdPartyContractorsEmail = formValue.thirdPartyContractorsEmail;
          data.thirdPartyContractorsLandline = formValue.thirdPartyContractorsLandline;
        }



        if (!expiryDateFlag) {
          data.expiryDate = expiryDate
        } else {
          delete data.expiryDate
        }

        if (action == 'add') {
          setLoading(true)
          setLoadingDescription('Document is loading')
          data.created_at = new Date().toISOString()
          axios
            .post('/api/document/add-document', {
              data
            })
            .then(async function (response) {

              let doc_id = response.data.data._id
              let count = 0

              await new Promise((resolve, reject) => {
                files.map(async (_file, index) => {
                  const file = _file.blobFile;
                  setLoadingDescription(file.name + ' is uploading')
                  let formData = new FormData()
                  formData.append('file', file)
                  formData.append('type', 'document')
                  try {
                    const res = await axios.post('https://umanu.blink-techno.com/api/upload', formData)
                    let data = {}
                    data.name = file.name
                    data.linked_id = doc_id
                    data.type = 'document'
                    data.url = res.data ;
                    data.created_at = new Date().toISOString()
                    data.originalFileObject = _file;
                    const res2 = await axios.post('/api/file/add-file', { data })
                  }
                  catch (err) {
                    toast.error('Error uploading document ' + data.name, { delay: 1000, position: 'bottom-right' });
                  }
                  if (index == files.length - 1) {
                    resolve();
                  }
                })
              })
              toast.success('Document (' + data.title + ') Inserted Successfully.', {
                delay: 3000,
                position: 'bottom-right'
              })
              goToIndex()
              close()
              setLoading(false);
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
            .then(async function (response) {
              let doc_id = response.data.data._id
              let count = 0
              await new Promise((resolve, reject) => {
                files.map(async (_file, index) => {
                  const file = _file.blobFile;
                  setLoadingDescription(file.name + ' is uploading')
                  let formData = new FormData()
                  formData.append('file', file)
                  formData.append('type', 'document')
                  try {
                    const res = await axios.post('https://umanu.blink-techno.com/api/upload', formData)
                    let data = {}
                    data.name = file.name
                    data.linked_id = doc_id
                    data.type = 'document'
                    data.url = response.data
                    data.created_at = new Date().toISOString()
                    data.originalFileObject = _file;
                    const res2 = await axios.post('/api/file/add-file', { data })
                  }
                  catch (err) {
                    toast.error('Error uploading document ' + data.name, { delay: 1000, position: 'bottom-right' });
                  }
                  if (index == files.length - 1) {
                    resolve();
                  }
                })
              })
              toast.success('Document (' + data.title + ') Inserted Successfully.', {
                delay: 3000,
                position: 'bottom-right'
              })
              goToIndex()
              close()
              setForm(false)
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
      }
    })
  }

  // -------------------------------- Routes -----------------------------------------------

  const close = () => {
    router.push('/company-dashboard/document')
  }

  const addToFiles = e => {
    let temp = files
    temp.push(e)
    setFiles(temp)
  }

  const removeFile = e => {
    let temp = files.filter((file) => {
      return e.fileKey != file.fileKey;
    });
    setFiles(temp);
  }

  // const Textarea = forwardRef((props, ref) => <Input as='textarea' />)

  // ------------------------------ View ---------------------------------

  if (loading) return <Loading header='Please Wait' description={loadingDescription}></Loading>

  if (session && session.user && !session.user.permissions.includes('AddDocument'))
    return <NoPermission header='No Permission' description='No permission to add document'></NoPermission>

  return (
    <>
      <Form
        fluid
        ref={formRef}
        onChange={setFormValue}
        onCheck={setFormError}
        formValue={formValue}
        model={validateMmodel}
      >
        <Grid item xs={12} sm={6} lg={6}></Grid>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <Breadcrumbs aria-label='breadcrumb' sx={{ pb: 0, p: 3 }}>
                <Link underline='hover' color='inherit' href='/'>
                  Home
                </Link>
                <Link underline='hover' color='inherit' href='/company-dashboard/document/'>
                  {documentCategory ?? "All Documents List"}
                </Link>
                <Typography color='text.primary' sx={{ fontSize: 18, fontWeight: '500' }}>
                  Add Document
                </Typography>
              </Breadcrumbs>
              <Divider />
              <Grid container>
                <Grid item xs={12} sm={6} md={6} sx={{ p: 2, px: 5, mb: 5 }}>

                  <Grid container sx={{ px: 5 }}>
                    <Grid item spacing={3} sm={12} md={12}>
                      <small>Tags</small>
                      <Form.Control
                        name='type'
                        controlId='type'
                        accepter={TagPicker}
                        data={AllDocumentTypes}
                        style={{ width: '100%' }}
                        defaultValue={tags}
                        onChange={(e) => handleTagsChange(e)}
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
                      <Form.Control rows={2} name='description' controlId='description' />
                    </Grid>


                    <Grid item sm={12} md={12} sx={{ mt: 2 }}>
                      <small>Issue date</small>
                      <Form.Control
                        size='sm'
                        oneTap
                        accepter={DatePicker}
                        name='issueDate'
                        onChange={e => {
                          setIssueDate(e.toISOString().substring(0, 10))
                        }}
                        value={new Date(issueDate)}
                        block
                      />
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


                    {!expiryDateFlag && (<Grid container spacing={3}>
                      <Grid item sm={6} xs={12} mt={2}>
                        <div className='flex d-flex row-flex'>
                          <small>Notify before <span>(Days)</span></small>
                          <div className='flex d-flex row-flex'>
                            <Form.Control
                              controlId='notifyBefore'
                              size='sm'
                              type='number'
                              name='notifyBefore'
                              placeholder='Notify before'
                            />
                          </div>

                        </div>
                      </Grid>
                    </Grid>)}


                    <Grid container spacing={3}>


                      <Grid item sm={12} xs={12} mt={5}>
                        <strong pt={5} className='px-5 pt-4'>Person In-Charge of renewing licenses informations</strong >

                        <div className='flex d-flex row-flex'>
                          <small>Name</small>
                          <Form.Control
                            controlId='renewing_name'
                            size='sm'
                            type='text'
                            name='renewing_name'
                            placeholder='Name'
                          />
                          <Grid container sm={12} md={12}>
                            <Grid item sm={6} md={6} pr={2}>
                              <small>Phone</small>
                              <Form.Control
                                controlId='renewing_phone'
                                size='sm'
                                type='number'
                                name='renewing_phone'
                                placeholder='Phone'
                              />
                            </Grid>
                            <Grid item sm={6} md={6} pr={2}>
                              <small>Email</small>
                              <Form.Control
                                controlId='renewing_email'
                                size='sm'
                                type='text'
                                name='renewing_email'
                                placeholder='Email'
                              />
                            </Grid>
                          </Grid>
                        </div>
                      </Grid>

                    </Grid>
                  </Grid>

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
                        listType='picture'
                        autoUpload
                        renderThumbnail={renderThumbnail}
                        onRemove={e => removeFile(e)}
                        onUpload={e => addToFiles(e)}
                        action=''
                      />
                    </Box>
                  </Card>
                  {

                    // tags.includes('Vendors') ?
                    <>
                      <br></br>
                      <Grid item sm={12} md={12} pr={1} pt={6}  >
                        <Typography sx={{ fontWeight: 'bold', fontSize: 18 }} >
                          Company Information
                        </Typography>
                      </Grid>
                      <Grid item sm={12} md={8} pr={2} pt={3}>
                        <small> Company Name </small>
                        <Form.Control type='text' controlId='companyName' size='sm' name='companyName' placeholder='Company Name' />
                      </Grid>
                      <Grid container sm={12} md={12} pt={3}>
                        <Grid item sm={6} md={6} pr={2}>
                          <small> Company Mobile </small>
                          <Form.Control type='number' controlId='companyMobile' size='sm' name='companyMobile' placeholder='Company Mobile' />
                        </Grid>
                        <Grid item sm={6} md={6} pr={2}>
                          <small> Company Email </small>
                          <Form.Control type='email' controlId='companyEmail' size='sm' name='companyEmail' placeholder='Company Email' />
                        </Grid>
                      </Grid>
                      <Grid container sm={12} md={12} pt={3}>
                        <Grid item sm={6} md={6} pr={2}>
                          <small> Company Landline </small>
                          <Form.Control type='number' controlId='companyLandline' size='sm' name='companyLandline' placeholder='Company Landline' />
                        </Grid>
                      </Grid>

                      <Grid item sm={12} md={8} pr={2} pt={3}>
                        <small> Company Contact Person </small>
                        <Form.Control controlId='companyContactPerson' size='sm' name='companyContactPerson' placeholder='company Contact Person' />
                      </Grid>

                    </>

                    // :
                    // <>
                    // </>
                  }
                  {

                    // tags.includes('Third Party Contracts') ?
                    // <>
                    //   <Typography sx={{ fontWeight: 'bold', fontSize: 18 }} >
                    //     Third Party Contractors Information
                    //   </Typography>
                    //   <Grid item sm={12} md={8} pr={2}>
                    //     <small> Email </small>
                    //     <Form.Control controlId='thirdPartyContractorsEmail' size='sm' name='thirdPartyContractorsEmail' placeholder='Third Party Contractors Email' />
                    //   </Grid>
                    //   <Grid item sm={12} md={8} pr={2}>
                    //     <small> LandLine </small>
                    //     <Form.Control type='number' controlId='thirdPartyContractorsLandline' size='sm' name='thirdPartyContractorsLandline' placeholder='Third Party Contractors Landline' />
                    //   </Grid>
                    // </>

                    // :
                    // <></>
                  }

                </Grid>

              </Grid>
              <Box sx={{ display: 'block', alignItems: 'center', minHeight: 40, marginLeft: 10 }}>
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
                      onClick={() => { setForm(false); router.push('/company-dashboard/document') }}
                    >
                      Close
                    </Button>
                  </>
                )}
              </Box>
            </Card>


          </Grid>
        </Grid>

      </Form>
    </>
  )
}

AddDepartment.getInitialProps = async ({ query: { id } }) => {
  return { id: id }
}

export default AddDepartment
