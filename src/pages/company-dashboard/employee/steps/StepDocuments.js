// ** React Imports
import { useEffect, useRef, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Checkbox, DatePicker, Form, InputNumber, Loader, Schema, SelectPicker } from 'rsuite'

// ** Custom Components Imports
import { styled } from '@mui/material/styles'
import {
  Card,
  CardActions,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  ListItemSecondaryAction,
  Paper
} from '@mui/material'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Axios Imports
import axios from 'axios'
import { toast } from 'react-hot-toast'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Actions Imports
import { fetchData, deleteUser } from 'src/store/apps/employeeDocument'
import { DataGrid } from '@mui/x-data-grid'

const { StringType } = Schema.Types

const StepDocuments = ({ handleNext, employee }) => {
  const [employeeId, setEmployeeId] = useState('')
  const [fileLoading, setFileLoading] = useState(false)
  const [userStatus, setUserStatus] = useState('')
  const [value, setValue] = useState('')
  const [form, setForm] = useState(false)
  const [action, setAction] = useState('add')
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState()

  const [expiryDateFlag, setExpiryDateFlag] = useState(false)
  const [expiryDate, setExpiryDate] = useState(new Date().toISOString().substring(0, 10))

  const dispatch = useDispatch()

  const store = useSelector(state => state.employeeDocument)
  const inputFile = useRef(null)

  const [formError, setFormError] = useState({})
  const [formValue, setFormValue] = useState({})
  const [pageSize, setPageSize] = useState(7)
  const formRef = useRef()

  // ------------------------- build------------------------------------------

  useEffect(() => {
    if (employee) {
          getDepartments()
    setEmployeeId(employee._id)
    dispatch(
      fetchData({
        employeeId: employeeId,
        userStatus,
        q: value
      })
    ).then(setLoading(false))
    }
    else{
      <Typography
      sx={{
        mt: 2,
        mb: 3,
        px: 2,
        fontWeight: 400,
        fontSize: 15,
        color: 'red',
        textAlign: 'center',
        fontStyle: 'italic'
      }}
    >
      You must insert employee ..
    </Typography>
    }


  }, [dispatch, employeeId, userStatus, value])



  // ----------------------------- Get Options ----------------------------------

  const getDepartments = async () => {}

  const validateMmodel = Schema.Model({
    documentTitle: StringType().isRequired('Document Title is required')
  })

  // ------------------------------- Submit --------------------------------------

  const handleSubmit = () => {
    formRef.current.checkAsync().then(result => {
      if (!result.hasError) {
        let data = {}
        data.documentTitle = formValue.documentTitle
        data.documentNo = formValue.documentNo
        data.documentDescription = formValue.documentDescription
        data.employee_id = employee._id
        if (!expiryDateFlag) {
          data.expiryDate = expiryDate
        } else {
          delete data.expiryDate
        }
        if (action == 'add') {
          data.created_at = new Date()
          axios
            .post('/api/employee-document/add-document', {
              data
            })
            .then(function (response) {
              dispatch(fetchData({ employeeId: employee._id })).then(() => {
                toast.success('Document (' + data.documentTitle + ') Inserted Successfully.', {
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
        if (action == 'edit') {
          data._id = selectedDocument._id
          data.updated_at = new Date()
          axios
            .post('/api/employee-document/edit-document', {
              data
            })
            .then(function (response) {
              dispatch(fetchData({ employeeId: employee._id })).then(() => {
                toast.success('Document (' + data.documentTitle + ') Inserted Successfully.', {
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

  const handleAdd = () => {
    setFormValue({})
    setAction('add')
    setForm(true)
  }

  const handleDelete = e => {
    setSelectedDocument(e)
    setOpen(true)
  }

  const deleteDocument = () => {
    setLoading(true)
    axios
      .post('/api/employee-document/delete-document', {
        selectedDocument
      })
      .then(function (response) {
        dispatch(fetchData({})).then(() => {
          toast.success('Employee document (' + selectedDocument.documentTitle + ') Deleted Successfully.', {
            delay: 1000,
            position: 'bottom-right'
          })
          setOpen(false)
          setAction('add')
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

  const open_file = fileName => {
    window.open('https://robin-sass.pioneers.network/assets/testFiles/employeeDocument/' + fileName, '_blank')
  }

  const uploadFile = async event => {
    setFileLoading(true)
    const file = event.target.files[0]
    let formData = new FormData()
    formData.append('file', file)
    formData.append('id', selectedDocument._id)
    formData.append('type', 'employeeDocument')
    let data = {}
    data.id = selectedDocument._id
    data.formData = formData
    axios
      .post('https://robin-sass.pioneers.network/api/test', formData)
      .then(response => {
        let data = {}
        data.documentTitle = selectedDocument.documentTitle
        data.documentNo = selectedDocument.documentNo
        data.documentDescription = selectedDocument.documentDescription
        data._id = selectedDocument._id
        data.created_at = selectedDocument.created_at
        data.company_id = selectedDocument.company_id
        if (selectedDocument.expiryDate) data.expiryDate = selectedDocument.expiryDate
        data.employee_id = employee._id
        data.file = response.data
        data.updated_at = new Date()
        axios
          .post('/api/employee-document/edit-document', {
            data
          })
          .then(function (response) {
            dispatch(fetchData({ employeeId: employee._id })).then(() => {
              toast.success('Document (' + data.documentTitle + ') Inserted Successfully.', {
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
        setFileLoading(false)
      })
      .catch(function (error) {
        toast.error('Error : ' + error.response + ' !', {
          delay: 3000,
          position: 'bottom-right'
        })
      })
  }

  const openUploadFile = row => {
    setSelectedDocument(row)
    inputFile.current.click()
  }
  
  // ------------------------------- handle Edit --------------------------------------

  const handleEdit = e => {
    setFormValue({})
    setSelectedDocument(e)
    setFormValue(e)
    if (e.expiryDate) {
      setExpiryDateFlag(false)
      setExpiryDate(new Date(e.expiryDate).toISOString().substring(0, 10))
    } else {
      setExpiryDateFlag(true)
      setExpiryDate(new Date().toISOString().substring(0, 10))
    }
    setAction('edit')
    setForm(true)
  }

  const columns = [
    {
      flex: 0.3,
      minWidth: 100,
      field: 'title',
      headerName: 'Title',
      renderCell: ({ row }) => <Typography variant='body2'>{row.documentTitle}</Typography>
    },
    {
      flex: 0.3,
      minWidth: 100,
      field: 'no',
      headerName: 'No',
      renderCell: ({ row }) => <Typography variant='body2'>{row.documentNo}</Typography>
    },
    {
      flex: 0.15,
      minWidth: 100,
      field: 'expiryDate',
      headerName: 'Expiry Date',
      renderCell: ({ row }) => <Typography variant='body2'>{row.expiryDate}</Typography>
    },
    {
      flex: 0.15,
      minWidth: 130,
      field: 'action',
      headerName: '',
      renderCell: ({ row }) => (
        <span>
          {fileLoading && (
            <span style={{ alignItems: 'center' }}>
              <Loader size='xs' />
            </span>
          )}

          {!fileLoading && (
            <>
              <IconButton
                size='small'
                onClick={e => {
                  handleEdit(row)
                }}
              >
                <Icon icon='mdi:pencil-outline' fontSize={18} />
              </IconButton>
              <IconButton
                size='small'
                onClick={e => {
                  handleDelete(row)
                }}
              >
                <Icon icon='mdi:delete-outline' fontSize={18} />
              </IconButton>
              {row.file && (
                <IconButton size='small' onClick={() => open_file(row.file)}>
                  <Icon icon='ic:outline-remove-red-eye' fontSize={18} />
                </IconButton>
              )}
              <IconButton
                size='small'
                onClick={e => {
                  openUploadFile(row)
                }}
              >
                <Icon icon='mdi:upload-outline' fontSize={18} />
              </IconButton>
            </>
          )}
        </span>
      )
    }
  ]

  return (
    <>
      <Typography sx={{ mt: 2, mb: 3, px: 2, fontWeight: 600, fontSize: 20, color: 'blue' }}>Documents</Typography>
      <Grid spacing={6}>
        <Grid item xs={12} lg={12}>
          <Grid container spacing={1}>
            {/* --------------------------- Emirates  View ------------------------------------ */}

            <Grid xs={12} md={7} lg={7} sx={{ px: 1, mt: 2 }}>
              <Button variant='outlined' size='small' onClick={handleAdd} sx={{ px: 2, mt: 2, mb: 2 }}>
                Add Employee Document
              </Button>
              <Card xs={12} md={12} lg={12}>
                <DataGrid
                  autoHeight
                  rows={store.data}
                  columns={columns}
                  pageSize={pageSize}
                  disableSelectionOnClick
                  rowsPerPageOptions={[7, 10, 25, 50]}
                  onPageSizeChange={newPageSize => setPageSize(newPageSize)}
                />
              </Card>
            </Grid>

            {/* --------------------------- Passport  ------------------------------------ */}

            <Grid xs={12} md={5} lg={5} sx={{ px: 1, mt: 2 }}>
              {form && (
                <Card xs={12} md={12} lg={12} sx={{ px: 1, pb: 8 }}>
                  {action == 'add' && (
                    <Typography variant='h6' sx={{ px: 2, pt: 2 }}>
                      Add New Document
                    </Typography>
                  )}
                  {action == 'edit' && (
                    <Typography variant='h6' sx={{ px: 2, pt: 2 }}>
                      Edit Document
                    </Typography>
                  )}
                  <Form
                    fluid
                    ref={formRef}
                    onChange={setFormValue}
                    onCheck={setFormError}
                    formValue={formValue}
                    model={validateMmodel}
                  >
                    <Grid container sx={{ mt: 3, px: 5 }}>
                      <Grid item sm={12} md={12} sx={{ mt: 2 }}>
                        <small>Document Title</small>
                        <Form.Control
                          controlId='documentTitle'
                          size='sm'
                          name='documentTitle'
                          placeholder='Document Title'
                        />
                      </Grid>
                      <Grid item sm={12} md={12} sx={{ mt: 2 }}>
                        <small>Document No.</small>
                        <Form.Control
                          controlId='documentNo'
                          size='sm'
                          type='number'
                          name='documentNo'
                          placeholder='Document No.'
                        />
                      </Grid>
                      <Grid item sm={12} md={12} sx={{ mt: 2 }}>
                        <small>Document Description</small>
                        <Form.Control
                          controlId='documentDescription'
                          size='sm'
                          type='text'
                          name='documentDescription'
                          placeholder='Document Description'
                        />
                      </Grid>
                      <Grid container spacing={3}>
                        <Grid item sm={6} xs={12} mt={2}>
                          {!expiryDateFlag && (
                            <div className='flex d-flex row-flex'>
                              <small>Expiry Date</small>
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
                            </div>
                          )}
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

                      <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 40, mt: 3 }}>
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
                </Card>
              )}
            </Grid>

            <input
              id='file'
              ref={inputFile}
              hidden
              type='file'
              onChange={e => {
                uploadFile(e)
              }}
              name='file'
            />

            {/* -------------------------- Clinician  ------------------------------------- */}

            <Dialog
              open={open}
              disableEscapeKeyDown
              aria-labelledby='alert-dialog-title'
              aria-describedby='alert-dialog-description'
              onClose={(event, reason) => {
                if (reason !== 'backdropClick') {
                  handleClose()
                }
              }}
            >
              <DialogTitle id='alert-dialog-title text'>Warning</DialogTitle>
              <DialogContent>
                <DialogContentText id='alert-dialog-description'>
                  Are you sure , you want to delete employee document{' '}
                  <span className='bold'>{selectedDocument && selectedDocument.documentTitle}</span>
                </DialogContentText>
              </DialogContent>
              <DialogActions className='dialog-actions-dense'>
                <Button onClick={deleteDocument}>Yes</Button>
                <Button onClick={() => setOpen(false)}>No</Button>
              </DialogActions>
            </Dialog>
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}

export default StepDocuments
