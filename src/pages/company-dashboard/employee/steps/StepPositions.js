// ** MUI Imports
import MuiChip from '@mui/material/Chip'

// ** React Imports
import { useEffect, useRef, useState } from 'react'

// ** Next Import
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { DatePicker, Form, Loader, Schema, SelectPicker } from 'rsuite'

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

// ** React Imports
import { Fragment } from 'react'

import { PositionChangeStartTypes, PositionChangeEndTypes } from 'src/local-db'

// ** MUI Imports
import List from '@mui/material/List'
import Divider from '@mui/material/Divider'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import ListItemButton from '@mui/material/ListItemButton'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Axios Imports
import axios from 'axios'
import { toast } from 'react-hot-toast'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Actions Imports
import { fetchData } from 'src/store/apps/employeePosition'
import { DataGrid } from '@mui/x-data-grid'

const { StringType } = Schema.Types

// Styled Grid component
const StyledGrid1 = styled(Grid)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  [theme.breakpoints.down('md')]: {
    paddingTop: '0 !important'
  },
  '& .MuiCardContent-root': {
    padding: theme.spacing(3, 4.75),
    [theme.breakpoints.down('md')]: {
      paddingTop: 0
    }
  }
}))

// Styled Grid component
const StyledGrid2 = styled(Grid)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  [theme.breakpoints.up('md')]: {
    paddingLeft: '0 !important'
  },
  [theme.breakpoints.down('md')]: {
    order: -1
  }
}))

// Styled component for the image
const Img = styled('img')(({ theme }) => ({
  height: '11rem',
  borderRadius: theme.shape.borderRadius
}))

const Steppositions = ({ handleNext, employee }) => {
  const [emiratesID, setEmiratesID] = useState()
  const inputFrontEmiratesFile = useRef(null)
  const inputBackEmiratesFile = useRef(null)

  const [employeeId, setEmployeeId] = useState('')
  const [plan, setPlan] = useState('')
  const [userStatus, setUserStatus] = useState('')
  const [value, setValue] = useState('')
  const [form, setForm] = useState(false)
  const [action, setAction] = useState('add')
  const [positionChangeType, setPositionChangeType] = useState()
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [departmentsDataSource, setDepartmentsDataSource] = useState([])
  const [positionChangeStartTypes, setPositionChangeStartTypes] = useState([])
  const [positionChangeEndTypes, setPositionChangeEndTypes] = useState([])
  const [selectedPosition, setSelectedPosition] = useState()
  const [fileLoading, setFileLoading] = useState(false)
  const [startChangeType, setStartChangeType] = useState()
  const [startChangeDate, setStartChangeDate] = useState(new Date().toISOString().substring(0, 10))

  const [endChangeType, setEndChangeType] = useState('onPosition')
  const [endChangeDate, setEndChangeDate] = useState(new Date().toISOString().substring(0, 10))

  const dispatch = useDispatch()

  const store = useSelector(state => state.employeePosition)
  const departmentStore = useSelector(state => state.companyDepartment)
  const [department, setDepartment] = useState()

  const [formError, setFormError] = useState({})
  const [formValue, setFormValue] = useState({})
  const [pageSize, setPageSize] = useState(7)
  const formRef = useRef()

  const inputFile = useRef(null)

  // ----------------------- bulid -------------------------------------------

  useEffect(() => {
    if (employee) {
      getDepartments()
      setEmployeeId(employee._id)
        dispatch(
        fetchData({
          employeeId: employee._id,
          userStatus,
          q: value
        })
      ).then(setLoading(false))
    }
  }, [dispatch, employeeId, userStatus, value])

  // ----------------------------- Get Options ----------------------------------

  const getDepartments = async () => {
    axios.get('/api/company-department', {}).then(function (response) {
      const arr = response.data.data.map(department => ({
        label: department.name,
        value: department._id
      }))

      setDepartmentsDataSource(arr)
      setDepartment(response.data.data[0]._id)
    })

    const positionChangeStartTypes = PositionChangeStartTypes.map(type => ({
      label: type.title,
      value: type.value
    }))

    setPositionChangeStartTypes(positionChangeStartTypes)
    setStartChangeType(positionChangeStartTypes[0].value)

    const positionChangeEndTypes = PositionChangeEndTypes.map(type => ({
      label: type.title,
      value: type.value
    }))

    positionChangeEndTypes.push({label: 'On Position',value: 'onPosition' })

    setPositionChangeEndTypes(positionChangeEndTypes)
    setEndChangeType(positionChangeEndTypes[0].value)
  }

  const validateMmodel = Schema.Model({
    positionTitle: StringType().isRequired('Position Title is required')
  })

  // ------------------------------- Submit --------------------------------------

  const handleSubmit = () => {
    formRef.current.checkAsync().then(result => {
      if (!result.hasError) {
        let data = {formValue}
        data.positionTitle = formValue.positionTitle
        data.startChangeType = startChangeType
        data.endChangeType = endChangeType
        data.department_id = department
        data.startChangeDate = startChangeDate
        data.employee_id = employee._id
        if (endChangeType != 'onPosition') {
          data.endChangeDate = endChangeDate
        } else {
          delete data.endChangeDate
        }
        if (action == 'add') {
          data.created_at = new Date()
          axios
            .post('/api/employee-position/add-position', {
              data
            })
            .then(function (response) {
              dispatch(fetchData({ employeeId: employee._id })).then(() => {
                toast.success('position (' + data.positionTitle + ') Inserted Successfully.', {
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
          data._id = selectedPosition._id
          data.updated_at = new Date()
          axios
            .post('/api/employee-position/edit-position', {
              data
            })
            .then(function (response) {
              dispatch(fetchData({ employeeId: employee._id })).then(() => {
                toast.success('position (' + data.positionTitle + ') Inserted Successfully.', {
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
    setSelectedPosition(e)
    setOpen(true)
  }

  const deletePosition = () => {
    setLoading(true)
    axios
      .post('/api/employee-position/delete-position', {
        selectedPosition
      })
      .then(function (response) {
        dispatch(fetchData({ employeeId: employeeId })).then(() => {
          toast.success('Employee Position (' + selectedPosition.positionTitle + ') Deleted Successfully.', {
            delay: 1000,
            position: 'bottom-right'
          })
          setOpen(false)
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

  const uploadFile = async event => {
    setFileLoading(true)
    const file = event.target.files[0]
    let formData = new FormData()
    formData.append('file', file)
    formData.append('id', selectedPosition._id)
    formData.append('type', 'employeePosition')
    let data = {}
    data.id = selectedPosition._id
    data.formData = formData
    axios
      .post('https://robin-sass.pioneers.network/api/test', formData)
      .then(response => {
        let data = {}
        data = {}
        data = {...selectedPosition}
        data.updated_at = new Date()
        data.file = response.data
        delete data.department_info
        
        axios
          .post('/api/employee-position/edit-position', {
            data
          })
          .then(function (response) {
            dispatch(fetchData({ employeeId: employee._id })).then(() => {
              toast.success('Position (' + selectedPosition.positionTitle + ') Updated Successfully.', {
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

  const open_file = fileName => {
    window.open('https://robin-sass.pioneers.network/assets/testFiles/employeePosition/' + fileName, '_blank')
  }

  // ------------------------------- handle Edit --------------------------------------

  const handleEdit = e => {
    setFormValue({})
    setSelectedPosition(e)
    setFormValue(e)
    setDepartment(e.department_id)
    setEndChangeType(e.endChangeType)
    setStartChangeType(e.startChangeType)
    setStartChangeDate(e.startChangeDate)
    if (e.endChangeDate) {
      setEndChangeDate(e.endChangeDate)
    }
    setAction('edit')
    setForm(true)
  }

  const openUploadFile = row => {
    setSelectedPosition(row)
    inputFile.current.click()
  }

  const columns = [
    {
      flex: 0.2,
      minWidth: 100,
      field: 'title',
      headerName: 'Title',
      renderCell: ({ row }) => <Typography variant='body2'>{row.department_info[0].name} / {row.positionTitle}</Typography>
    },
    {
      flex: 0.15,
      minWidth: 100,
      field: 'startAt',
      headerName: 'Start at',
      renderCell: ({ row }) => <Typography variant='body2'>{row.startChangeDate}</Typography>
    },
    {
      flex: 0.15,
      minWidth: 100,
      field: 'endAt',
      headerName: 'End at',
      renderCell: ({ row }) => <Typography variant='body2'>{row.endChangeDate}</Typography>
    },
    {
      flex: 0.2,
      minWidth: 100,
      field: 'action',
      headerName: '',
      renderCell: ({ row }) => (
        <>
          {fileLoading && (
            <span style={{ alignItems: 'center' }}>
              <Loader size='xs' />
            </span>
          )}
          {!fileLoading && (<span>
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
          </span>)}
      
        </>
      )
    }
  ]

  if (!employee) {
    return <Typography  sx={{mt: 2,mb: 3,px: 2,fontWeight: 400,fontSize: 15,color: 'red',textAlign: 'center',fontStyle: 'italic'}}>You must insert employee ..</Typography>
  }

  return (
    <Grid spacing={6}>
      <Typography sx={{ mt: 2, mb: 3, px: 2, fontWeight: 600, fontSize: 20, color: 'blue' }}>Positions</Typography>

      <Grid item xs={12} lg={12}>
        <Grid container spacing={1}>
          {/* --------------------------- Emirates  View ------------------------------------ */}

          <Grid xs={12} md={7} lg={7} sx={{ px: 1, mt: 2 }}>
            <Button variant='outlined' size='small' onClick={handleAdd} sx={{ px: 2, mt: 2, mb: 2 }}>
              Add Employee Position
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
                    Add New Position
                  </Typography>
                )}
                {action == 'edit' && (
                  <Typography variant='h6' sx={{ px: 2, pt: 2 }}>
                    Edit Position
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
                    {departmentsDataSource && (
                      <Grid item sm={12} xs={12} mt={2}>
                        <small>Department</small>
                        <SelectPicker
                          size='lg'
                          name='department'
                          onChange={e => {
                            setDepartment(e)
                          }}
                          value={department}
                          data={departmentsDataSource}
                          block
                        />
                      </Grid>
                    )}
                    <Grid item sm={12} md={12} sx={{ mt: 2 }}>
                      <small>Position Title</small>
                      <Form.Control
                        controlId='positionTitle'
                        size='lg'
                        name='positionTitle'
                        placeholder='position Title'
                      />
                    </Grid>

                    <Grid container spacing={3}>
                      <Grid item sm={6} xs={12} mt={2}>
                        <small>Reason</small>
                        <SelectPicker
                          size='lg'
                          name='startChangeType'
                          onChange={e => {
                            setStartChangeType(e)
                          }}
                          value={startChangeType}
                          data={positionChangeStartTypes}
                          block
                        />
                      </Grid>
                      <Grid item sm={6} xs={12} mt={2}>
                        <small>Date of Start</small>
                        <Form.Control
                          size='lg'
                          oneTap
                          accepter={DatePicker}
                          name='startChangeDate'
                          onChange={e => {
                            setStartChangeDate(e.toISOString().substring(0, 10))
                          }}
                          value={new Date(startChangeDate)}
                          block
                        />
                      </Grid>
                    </Grid>

                    <Grid container spacing={3}>
                      <Grid item sm={6} xs={12} mt={2}>
                        <small>Reason</small>
                        <SelectPicker
                          size='lg'
                          name='startChangeType'
                          onChange={e => {
                            setEndChangeType(e)
                          }}
                          value={endChangeType}
                          data={positionChangeEndTypes}
                          block
                        />
                      </Grid>
                      {endChangeType != 'onPosition' && (
                        <Grid item sm={6} xs={12} mt={2}>
                          <small>Date of End</small>
                          <Form.Control
                            size='lg'
                            oneTap
                            accepter={DatePicker}
                            name='endChangeDate'
                            onChange={e => {
                              setEndChangeDate(e.toISOString().substring(0, 10))
                            }}
                            value={new Date(endChangeDate)}
                            block
                          />
                        </Grid>
                      )}
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
                Are you sure , you want to delete employee position{' '}
                <span className='bold'>{selectedPosition && selectedPosition.positionTitle}</span>
              </DialogContentText>
            </DialogContent>
            <DialogActions className='dialog-actions-dense'>
              <Button onClick={deletePosition}>Yes</Button>
              <Button onClick={() => setOpen(false)}>No</Button>
            </DialogActions>
          </Dialog>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default Steppositions
