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

import CustomChip from 'src/@core/components/mui/chip'


// ** React Imports
import { Fragment } from 'react'

import { SalaryChange } from 'src/local-db'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Axios Imports
import axios from 'axios'
import { toast } from 'react-hot-toast'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Actions Imports
import { fetchData, deleteUser } from 'src/store/apps/employeeSalary'
import { DataGrid } from '@mui/x-data-grid'
import Loading from 'src/views/loading'

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

const StepSalary = ({ handleNext, employee }) => {
  const [emiratesID, setEmiratesID] = useState()
  const inputFrontEmiratesFile = useRef(null)
  const inputBackEmiratesFile = useRef(null)

  const [employeeId, setEmployeeId] = useState('')
  const [plan, setPlan] = useState('')
  const [userStatus, setUserStatus] = useState('')
  const [value, setValue] = useState('')
  const [form, setForm] = useState(false)
  const [action, setAction] = useState('add')
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const [fileLoading, setFileLoading] = useState(false)
  const [selectedSalary, setSelectedSalary] = useState()

  const [salaryChanges, setSalaryChanges] = useState()
  const [salaryChange, setSalaryChange] = useState()
  const [startChangeDate, setStartChangeDate] = useState(new Date().toISOString().substring(0, 10))

  const dispatch = useDispatch()

  const store = useSelector(state => state.employeeSalary)

  const [formError, setFormError] = useState({})
  const [formValue, setFormValue] = useState({})
  const [pageSize, setPageSize] = useState(7)
  const formRef = useRef()
  const inputFile = useRef()

  useEffect(() => {
    if (employee) {
      setEmployeeId(employee._id)
      getOptions()
      setLoading(true);
      dispatch(
        fetchData({
          employeeId: employeeId,
          userStatus,
          q: value
        })
      ).then(setLoading(false))
    }else{
      return (
        <>
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
        </>
      )
    }
    
  }, [dispatch, employeeId, userStatus, value,employee])

  // ----------------------------- Get Options ----------------------------------

  const getOptions = async () => {
    const salaryChanges = SalaryChange.map(type => ({
      label: type.title,
      value: type.value
    }))

    setSalaryChanges(salaryChanges)
  }

  const open_file = fileName => {
    window.open('https://robin-sass.pioneers.network/assets/testFiles/employeeSalary/' + fileName, '_blank')
  }

  const openUploadFile = row => {
    setSelectedSalary(row)
    inputFile.current.click()
  }

  const uploadFile = async event => {
    setFileLoading(true)
    const file = event.target.files[0]
    let formData = new FormData()
    formData.append('file', file)
    formData.append('id', selectedSalary._id)
    formData.append('type', 'employeeSalary')
    let data = {}
    data.id = selectedSalary._id
    data.formData = formData
    axios
      .post('https://robin-sass.pioneers.network/api/test', formData)
      .then(response => {
        let data = {}
        data = {}
        data = {...selectedSalary}
        data.updated_at = new Date()
        data.file = response.data
        delete data.department_info
        
        axios
          .post('/api/employee-salary/edit-salary', {
            data
          })
          .then(function (response) {
            dispatch(fetchData({ employeeId: employee._id })).then(() => {
              toast.success('Salary (' + selectedSalary.positionTitle + ') Updated Successfully.', {
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

  //-------------------------- validate -----------------------------------

  const validateMmodel = Schema.Model({
    // overtimeSalary: StringType().isRequired('Overtime Salary is required.'),
    lumpySalary: StringType().isRequired('lumpy Salary is required.')
  })

  // ------------------------------- Submit --------------------------------------

  const handleSubmit = () => {
    formRef.current.checkAsync().then(result => {
      if (!result.hasError) {
        let data = {}
        setLoading(true)
        data = {...formValue}
        console.log(startChangeDate)
        data.startChangeDate = new Date(startChangeDate)
        data.employee_id = employee._id
        data.overtimeSalary = data.lumpySalary;
        if (action == 'add') {
          data.created_at = new Date()
          axios
            .post('/api/employee-salary/add-salary', {
              data
            })
            .then(function (response) {
              dispatch(fetchData({ employeeId: employee._id })).then(() => {
                toast.success('Salary Inserted Successfully.', {
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
          Object.assign({}, data._id, selectedSalary._id)
          data.updated_at = new Date()
          data.overtimeSalary = data.lumpySalary;
          axios
            .post('/api/employee-salary/edit-salary', {
              data
            })
            .then(function (response) {
              dispatch(fetchData({ employeeId: employee._id })).then(() => {
                toast.success('Salary Updated Successfully.', {
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

  const colorChip =(data)=>{
    if(data > 0)
    return 'success'
    if(data < 0)
    return 'error'
  }

  const labelChip =(data)=>{
    if(data > 0)
    return (data + '%')
    if(data < 0)
    return (data + '%')
    if(data == '-')
    return ('-')
  }

  const handleAdd = () => {
    setFormValue({})
    setAction('add')
    setForm(true)
  }

  const handleDelete = e => {
    setSelectedSalary(e)
    setOpen(true)
  }

  const deletePosition = () => {
    setLoading(true)
    axios
      .post('/api/employee-salary/delete-salary', {
        selectedSalary
      })
      .then(function (response) {
        dispatch(fetchData({ employeeId: employeeId })).then(() => {
          toast.success('Employee salary Deleted Successfully.', {
            delay: 1000,
            position: 'bottom-right'
          })
          setOpen(false)
          setLoading(false);
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

  // ------------------------------- handle Edit --------------------------------------

  const handleEdit = e => {
    setFormValue({})
    setSelectedSalary(e)
    setFormValue(e)
    setStartChangeDate(new Date(e.startChangeDate).toISOString().substring(0, 10))
    setSalaryChange(e.salaryChange)
    setAction('edit')
    setForm(true)
  }

  const columns = [
    {
      flex: 0.3,
      minWidth: 100,
      field: 'lumpySalary',
      headerName: 'Basic Salary',
      renderCell: ({ row }) => (
      <>
        <Typography variant='body2' sx={{ fontWeight: 900 , fontSize: '0.85rem'}}>{Number((Number(row.lumpySalary)).toFixed(2)).toLocaleString("en-US")}</Typography>
        <CustomChip
            skin='light'
            size='small'
            label={labelChip(row.lumpySalaryPercentageChange)}
            color={colorChip(row.lumpySalaryPercentageChange)}
            sx={{ ml: 4.5, height: 20, fontSize: '0.65rem', fontWeight: 500 }}
          />
          
      </>
      )
    },
    {
      flex: 0.3,
      minWidth: 100,
      field: 'total_salary',
      headerName: 'Total Salary',
      renderCell: ({ row }) => ( 
      <>
        <Typography variant='body2' sx={{ fontWeight: 900 , fontSize: '0.85rem'}}>
          {row.totalSalary ??  '-' }  
        </Typography>
        </>)
    },

    // {
    //   flex: 0.3,
    //   minWidth: 100,
    //   field: 'overtimeٍٍSalary',
    //   headerName: 'Overtime Salary',
    //   renderCell: ({ row }) => ( 
    //   <>
    //     <Typography variant='body2' sx={{ fontWeight: 900 , fontSize: '0.85rem'}}>{Number((Number(row.overtimeSalary)).toFixed(2)).toLocaleString("en-US")}</Typography>
    //       <CustomChip
    //         skin='light'
    //         size='small'
    //         label={labelChip(row.overtimeSalaryPercentageChange)}
    //         color={colorChip(row.overtimeSalaryPercentageChange)}
    //         sx={{ ml: 4.5, height: 20, fontSize: '0.65rem', fontWeight: 500 }}
    //       />
    //     </>)
    // },
    {
      flex: 0.15,
      minWidth: 100,
      field: 'date',
      headerName: 'Date',
      renderCell: ({ row }) => 
      <Typography variant='body2'>{new Date(row.startChangeDate).toLocaleDateString()}</Typography>
    },
    {
      flex: 0.15,
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
  if(loading){
    return <Loading header='Please Wait' description='Salaries is loading' />
  }

  return (
    <Grid spacing={6}>
      <Grid item xs={12} lg={12}>
        <Grid container spacing={1}>
          {/* --------------------------- Emirates  View ------------------------------------ */}

          <Grid xs={12} md={7} lg={7} sx={{ px: 3, mt: 2 }}>
            <Box 
               sx={{
                  mb: 2.5,
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                <Typography sx={{ mt: 2, mb: 3, px: 2, fontWeight: 600, fontSize: 20, color: 'blue' }}>Salary</Typography>
                <Button variant='outlined' size='small' onClick={handleAdd} sx={{ px: 2, mt: 2, mb: 2 }}>
                Add Employee Salary
                </Button>
              </Box>

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
                    Add New Salary
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
                    <Grid container spacing={3}>
                      <Grid item sm={12} md={12} sx={{ mt: 2 }}>
                        <small>Monthly Basic Salary</small>
                        <Form.Control
                          type='number'
                          controlId='lumpySalary'
                          size='lg'
                          name='lumpySalary'
                          placeholder='Basic Salary'
                        />
                      </Grid>
                      {/* <Grid item sm={12} md={6} sx={{ mt: 2 }}>
                        <small>Monthly Overtime Salary</small>
                        <Form.Control
                          controlId='overtimeSalary'
                          type='number'
                          size='lg'
                          name='overtimeSalary'
                          placeholder='Overtime Salary'
                        />
                      </Grid> */}
                    </Grid>

                    <Grid container spacing={3}>
                      <Grid item sm={6} xs={12} mt={2}>
                        <small>Reason</small>
                        <SelectPicker
                          size='lg'
                          name='salaryChange'
                          onChange={e => {
                            setSalaryChange(e)
                          }}
                          value={salaryChange}
                          data={salaryChanges}
                          defaultValue={'other'}
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

                    <Grid container>
                      <Grid item sm={12} md={12} sx={{ mt: 2 }}>
                        <small>Financial No</small>
                        <Form.Control
                          type='number'
                          controlId='financialNo'
                          size='lg'
                          name='financialNo'
                          placeholder='Financial No'
                        />
                      </Grid>
                      <Grid item sm={12} md={12} sx={{ mt: 2 }}>
                        <small>Remarks</small>
                        <Form.Control controlId='remarks' size='lg' name='remarks' placeholder='Remarks' />
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
                Are you sure , you want to delete employee salary{' '}
                <span className='bold'>{selectedSalary && selectedSalary.positionTitle}</span>
              </DialogContentText>
            </DialogContent>
            <DialogActions className='dialog-actions-dense'>
              <Button onClick={deletePosition}>Yes</Button>
              <Button onClick={() => setOpen(false)}>No</Button>
            </DialogActions>
          </Dialog>
        </Grid>
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
    </Grid>
    
  )
}

export default StepSalary
