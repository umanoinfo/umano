// ** React Imports
import { useState, forwardRef, useEffect, useRef, useCallback } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'
import Icon from 'src/@core/components/icon'
import { Divider, Typography } from '@mui/material'
import toast from 'react-hot-toast'
import { Breadcrumbs } from '@mui/material'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'


// ** Rsuite Imports
import { Form, Schema, DatePicker, TagPicker, Uploader, Checkbox } from 'rsuite'
import 'rsuite/dist/rsuite.min.css'

// ** Axios Imports
import axios from 'axios'

// ** Actions Imports
import { fetchData } from 'src/store/apps/company'

// ** Store Imports
import { DocumentStatus } from 'src/local-db'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import Loading from 'src/views/loading'
import NoPermission from 'src/views/noPermission'

import { SelectPicker } from 'rsuite'
import { grey } from '@mui/material/colors'

import defaultThumbnail from '../../../../../public/images/avatars/1.png';

const { StringType, ArrayType } = Schema.Types

const styles = {
  marginBottom: 10
}

const AddDepartment = ({ popperPlacement, id, search }) => {
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
  const [issueDate, setIssueDate] = useState(new Date().toISOString().substring(0, 10))
  const [preparedBy, setPreparedBy] = useState()
  const [approvedDate, setApprovedDate] = useState(new Date().toISOString().substring(0, 10))
  const [notifyBeforeDays, setNotifyBeforeDays] = useState()
  const router = useRouter()
  const { data: session, status } = useSession
  const formRef = useRef()
  const inputFile = useRef(null)
  const [formError, setFormError] = useState({})
  const [formValue, setFormValue] = useState({})
  const [DocumentStatusDataSource, setDocumentStatusDataSource] = useState([]);
  const [DocStatus, setDocStatus] = useState('active');
  const [AllDocumentTypes, setAllDocumentTypes] = useState([]);
  const [documentTypeCategory, setDocumentTypeCategory] = useState();
  const [vendorsDataSource, setVendorsDataSource] = useState([])
  const [vendors, setVendors] = useState([])
  const [vendor, setVendor] = useState()
  const [tags, setTags] = useState()





  const renderThumbnail = (file) => { // Check if the file has a thumbnail, otherwise use the default
    const thumbnail = file.url ? file.url : defaultThumbnail;

    return <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"><path fill="currentColor" d="M2 6V1h5v2H4v3zm18 0V3h-3V1h5v5zM2 23v-5h2v3h3v2zm15 0v-2h3v-3h2v5zM7 20q-.825 0-1.412-.587T5 18V6q0-.825.588-1.412T7 4h10q.825 0 1.413.588T19 6v12q0 .825-.587 1.413T17 20zm2-10h6V8H9zm0 3h6v-2H9zm0 3h6v-2H9z" /></svg>

    //  return ( <img src={'/images/icons/file-icons/file.png'} alt="Document" style={{ width: 50, height: 50, objectFit: 'cover' }} /> );
  };

  // ----------------------------- Get Options ----------------------------------

  const getVendors = async () => {
    setLoading(true);
    axios.get('/api/vendor-list', {}).then(function (response) {
      setVendors(response.data?.data)

      const arr = response.data?.data?.map(department => ({
        label: department.name,
        value: department._id
      }))

      setVendorsDataSource(arr)

      // if (response.data.data && response.data.data.length > 0)
      //   setVendor(response.data.data[0]._id)
      // setFormValue({
      //   companyName: response.data.data[0].name,
      //   companyMobile: response.data.data[0].mobile,
      //   companyEmail: response.data.data[0].email,
      //   companyLandline: response.data.data[0].landline,
      //   companyContactPerson: response.data.data[0].contactperson,
      // })
    }).catch((err) => {
    })
  }

  const getDocumentTypes = async (resolve, reject) => {
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
        resolve();
      }

    } catch (err) {
      toast.error('Failed to fetch documents types', { duration: 5000, position: 'bottom-right' });
      reject();
      setLoading(false);
    }
  }

  const fetchOnInit = async () => {
    await new Promise((resolve, reject) => { getDocumentTypes(resolve, reject) });
    await new Promise((resolve, reject) => { getDocument(resolve, reject) })
    await new Promise((resolve, reject) => { getDocumentStatus(resolve, reject) })
  }

  const getDocumentStatus = async () => {
    const documentStatus = DocumentStatus.map(type => ({
      label: type.title,
      value: type.value
    }))

    setDocumentStatusDataSource(documentStatus)

  }

  useEffect(() => {
    fetchOnInit();
    getVendors();
  }, [])

  const goToIndex = () => {
    const { type } = router.query;
    router.push('/company-dashboard/document/category/Third Party Contracts/' + type)
  }

  const selectVendor = e => {
    const selectedVendor = vendors.find(ven => ven._id === e);
    setFormValue({
      companyName: selectedVendor.name,
      companyMobile: selectedVendor.mobile,
      companyEmail: selectedVendor.email,
      companyLandline: selectedVendor.landline,
      companyContactPerson: selectedVendor.contactperson,
    })
  }


  // ------------------------------ Get Document ------------------------------------

  const getDocument = async (resolve, reject) => {
    setLoading(true)
    axios.get('/api/document/' + id, {}).then(response => {
      if (response.data.data[0]) {
        setSelectedDocument(response?.data?.data?.[0])
        setExpiryDateFlag(response?.data?.data?.[0]?.expiryDateFlag)
        setExpiryDate(response?.data?.data?.[0]?.expiryDate)
        setIssueDate(response?.data?.data?.[0]?.issueDate)
        setNotifyBeforeDays(response?.data?.data?.[0]?.notifyBeforeDays)
        let tempArr = []
        console.log(
          response.data.data[0]
        )
        response?.data?.data?.[0]?.files_info?.map((file, index) => {
          console.log(file);
          if (!file?.deleted_at) {
            tempArr.push({
              _id: file?._id,
              name: file?.name,
              fileKey: index,
              url: 'https://umanu.blink-techno.com/' + file?.url,
              created_at: new Date((file?.created_at)).toISOString().substring(0, 10)
            })
          }
        })
        setFiles(tempArr);

        setFormValue(response.data.data[0])
        resolve()
        setLoading(false);
      }
      setLoading(false)
    }).catch((err) => { reject(); setLoading(false) })
  };



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
        data.notifyBefore = formValue.notifyBefore
        data.renewing_name = formValue.renewing_name
        data.renewing_phone = formValue.renewing_phone
        data.renewing_email = formValue.renewing_email
        data.another_renewing_name = formValue.another_renewing_name
        data.another_renewing_phone = formValue.another_renewing_phone
        data.another_renewing_email = formValue.another_renewing_email
        data.issueDate = issueDate
        data.status = DocStatus

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
          data.expiryDateFlag = false
        } else {
          data.expiryDateFlag = true
        }

        setLoading(true)
        setLoadingDescription('Document is updating')
        data._id = selectedDocument._id
        data.updated_at = new Date()
        axios
          .post('/api/document/edit-document', {
            data
          })
          .then(async function (response) {
            if (files.length == 0) {
              goToIndex()
            }
            let doc_id = response.data.data._id
            let count = 0
            await new Promise((resolve, reject) => {
              if (files.length == 0) {
                resolve();
              }
              files.map(async (_file, index) => {
                const file = _file?.blobFile;

                // for files that are already saved on server
                if (!_file?.blobFile) {
                  if (index == files.length - 1) {
                    resolve();
                  }

                  return;
                }
                console.log(file);
                setLoadingDescription(file?.name + ' is uploading')
                let formData = new FormData()
                formData.append('file', file)
                formData.append('type', 'document')
                try {
                  const res = await axios.post('https://umanu.blink-techno.com/api/upload', formData)
                  let data = {}
                  data.name = file.name
                  data.linked_id = doc_id
                  data.type = 'document'
                  data.url = res.data;
                  data.created_at = new Date().toISOString()
                  data.originalFileObject = _file;
                  const res2 = await axios.post('/api/file/add-file', { data })
                }
                catch (err) {
                  toast.error('Error uploading document ' + data.name, { delay: 1000, position: 'bottom-right' });
                }
                console.log(index, files.length - 1);
                if (index == files.length - 1) {
                  resolve();
                }
              })
            })
            goToIndex()


            toast.success('Document (' + data.title + ') Inserted Successfully.', {
              delay: 3000,
              position: 'bottom-right'
            })


            setLoading(false)
          })
      }
    })
  }

  // -------------------------------- Routes -----------------------------------------------

  const addToFiles = e => {
    let temp = files
    temp.push(e)
    console.log(temp);
    setFiles(temp)
  }


  const handleTagsChange = (e) => {
    let categories = new Set(e?.map((type) => {
      return documentTypeCategory[type];
    }));
    categories = [...categories];
    setTags(categories);
  }



  const removeFile = e => {
    let temp = files.filter((file) => {
      return e.fileKey != file.fileKey;
    })
    axios.post('/api/file/delete-file', e).then(response => { }).catch((err) => { })
    setFiles(temp);
  }

  const changeDocumentStatus = selectedStatus => {
    console.log(selectedStatus)
    setDocStatus(selectedStatus)
  }

  // ------------------------------ View ---------------------------------

  if (loading) return <Loading header='Please Wait' description={loadingDescription}></Loading>

  if (session && session.user && !session.user.permissions.includes('EditDocument'))
    return <NoPermission header='No Permission' description='No permission to edit document'></NoPermission>

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
                Edit Document
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

                  <Grid item sm={6} md={8} xs={12} spacing={3} mt={2}>
                    <Grid item sm={12} xs={12}>
                      <small>Status</small>
                      <SelectPicker
                        size='sm'
                        name='status'
                        onChange={e => {
                          changeDocumentStatus(e)
                        }}
                        value={DocStatus}
                        data={DocumentStatusDataSource}
                        block
                      />
                    </Grid>
                  </Grid>


                  <Grid item sm={12} md={12} sx={{ mt: 2 }}>
                    <small>Issue date</small>
                    <Form.Control
                      size='sm'
                      oneTap
                      accepter={DatePicker}
                      name='issueDate'
                      format={'dd/MM/yyyy'}
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
                            format={'dd/MM/yyyy'}
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
                            value={notifyBeforeDays}
                            onChange={e => {
                              setNotifyBeforeDays(e)
                            }}
                            placeholder='Notify before'
                          />
                        </div>

                      </div>
                    </Grid>
                  </Grid>)}


                  <Grid container spacing={3}>


                    <Grid item sm={12} xs={12} mt={5}>
                      <strong pt={5} className='px-5 pt-4'>Person in charge of renewing licences informations</strong >

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
                      listType='picture-text'
                      defaultFileList={files}
                      autoUpload
                      onRemove={e => removeFile(e)}
                      onUpload={e => addToFiles(e)}
                      renderThumbnail={renderThumbnail}
                      action=''
                      renderFileInfo={(file, fileElement) => {
                        return (
                          <>
                            {file.url && (
                              <a href={file.url} style={{ overflow: 'hidden' }}>
                                {file.name}
                              </a>
                            )}
                            {!file.url && <>{file.name}</>}
                            {file.created_at && (
                              <div>
                                <Icon icon='mdi:calendar-blank-outline' sx={{ bt: 5 }} fontSize='0.7rem' />{' '}
                                <small style={{ color: grey }}>{file.created_at}</small>
                              </div>
                            )}
                          </>
                        )
                      }}
                    />
                  </Box>
                </Card>
                {

                  // tags.includes('Vendors') ?

                  <>
                    <Grid item sm={12} md={12} pr={1}  >
                      <Typography sx={{ fontWeight: 'bold', fontSize: 18 }} >
                        Company Information
                      </Typography>
                    </Grid>
                    {/* {vendorsDataSource && (
                      <Grid item sm={12} xs={12} mt={2}>
                        <small>Select Vendor</small>
                        <SelectPicker
                          size='sm'
                          name='vendor1'
                          controlId='vendor1'
                          onChange={e => {
                            setVendor(e)
                            selectVendor(e)
                          }}
                          value={vendor}
                          data={vendorsDataSource}
                          block
                        />
                      </Grid>
                    )} */}
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

                    <Grid item sm={12} xs={12} mt={5}>
                      <strong pt={5} mt={5} className='px-5 pt-4'>Additional Contact Person </strong >

                      <div className='flex d-flex row-flex'>
                        <small>Name</small>
                        <Form.Control
                          controlId='another_renewing_name'
                          size='sm'
                          type='text'
                          name='another_renewing_name'
                          placeholder='Name'
                        />
                        <Grid container sm={12} md={12}>
                          <Grid item sm={6} md={6} pr={2}>
                            <small>Phone</small>
                            <Form.Control
                              controlId='another_renewing_phone'
                              size='sm'
                              type='number'
                              name='another_renewing_phone'
                              placeholder='Phone'
                            />
                          </Grid>
                          <Grid item sm={6} md={6} pr={2}>
                            <small>Email</small>
                            <Form.Control
                              controlId='another_renewing_email'
                              size='sm'
                              type='text'
                              name='another_renewing_email'
                              placeholder='Email'
                            />
                          </Grid>
                        </Grid>
                      </div>

                    </Grid>

                  </>

                  // :
                  // <>
                  // </>
                }
                {

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
      </Form>
    </>
  )
}

AddDepartment.getInitialProps = async ({ query: { id } }) => {
  return { id: id }
}

export default AddDepartment
