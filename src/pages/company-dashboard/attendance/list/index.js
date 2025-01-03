// ** React Imports
import { useState, useEffect, useCallback, createRef, Fragment } from 'react'

// ** Next Imports
import Link from 'next/link'


// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Menu from '@mui/material/Menu'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import { DataGrid } from '@mui/x-data-grid'
import { styled } from '@mui/material/styles'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContentText from '@mui/material/DialogContentText'
import toast from 'react-hot-toast'
import Loading from 'src/views/loading'

import { functions } from '../../../../helpers/fingerprint-device-functions'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Custom Components Imports
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials'

import attendance, { fetchData } from 'src/store/apps/attendance'

// ** Actions Imports
import { FormType } from 'src/local-db'

// ** Third Party Components
import axios from 'axios'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import NoPermission from 'src/views/noPermission'
import { right } from '@popperjs/core'
import { Breadcrumbs, List, ListItem, ListItemSecondaryAction, ListItemText, useMediaQuery } from '@mui/material'
import DialogEditAttendance from './edit-attendance-dialog'
import DialogAddAttendance from './add-attendance-dialog'
import { DatePicker, Input } from 'rsuite'

// ** Status Obj

const StatusObj = {
  active: 'success',
  pending: 'warning',
  blocked: 'error'
}

// ** Day Color

const dayColor = days => {
  if (days > 30) {
    return 'success'
  }
  if (days < 30 && days > 6) {
    return 'warning'
  }
  if (days <= 5) {
    return 'error'
  }
}

const AllDocumentsList = () => {
  // ** State
  const [employeeType, setEmployeeType] = useState('')
  const [value, setValue] = useState('')
  const [type, setType] = useState('')

  const [pageSize, setPageSize] = useState(10)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedAttendance, setSelectedAttendance] = useState()
  const { data: session, status } = useSession()
  const [dialogEmployeesList, setDialogEmployeesList] = useState([]);
  const myRef = createRef()

  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [openAddDialog, setOpenAddDialog] = useState(false)
  const [SelectedEditRow, setSelectedEditRow] = useState()

  const [fromDate, setFromDate] = useState(new Date())
  const [toDate, setToDate] = useState(new Date())

  const [employeesList, setEmployeesList] = useState([])
  const [notAuthorized, setNotAuthorized] = useState([]);

  const [companyFingerprintDevice , setCompanyFingerprintDevice ] = useState();
  
  // ** Hooks

  const [openExcel, setOpenExcel] = useState(false)
  const [Unvalid, setUnvalid] = useState([])
  const [update, setupdate] = useState(new Date())

  const router = useRouter()

  const dispatch = useDispatch()
  const store = useSelector(state => state.attendance)

  useEffect(() => {
    setLoading(true);
    dispatch(
      fetchData({
        fromDate: fromDate,
        toDate: toDate,
        employee_no: value
      })
    ).then(() => setLoading(false))
  }, [dispatch, fromDate, toDate, value])


  const getCompany = async (resolve) => {
        setLoading(true)
        axios
          .get('/api/company/my-company/' , {})
          .then(function (response) {
            console.log('te', response.data.data[0].fingerprintDevice[0].functionName)
            
            setCompanyFingerprintDevice(response?.data?.data?.[0]?.fingerprintDevice[0])
            

            resolve()
          })
          .catch(function (error) {
            setLoading(false)
          })
  }

  const getEmployees = () => {

    axios.get('/api/company-employee', {}).then(res => {
      setEmployeesList(res.data.data)
      let arr = []
      res.data.data.map(employee => {
        arr.push({
          label: employee.firstName + ' ' + employee.lastName,
          value: employee.idNo
        })
      })
      setDialogEmployeesList(arr)

    }).catch(err => {
      let message = err?.response?.data?.message || err?.toString();
      if (err.response.status == 401) {
        setNotAuthorized([...notAuthorized, 'ViewEmployee']);
        message = 'Error: Failed to fetch employees : (No Permission to View Employees';
      }
      toast.error(message, { duration: 5000, position: 'bottom-right' });
      setDialogEmployeesList([{
        label: <div style={{ color: 'red' }}> You do not have permission to view Employees </div>,
        value: undefined
      }])
    })
  }
  useEffect(() => {
    getEmployees()
    getCompany();

  }, [open])

  // ----------------------- Handle ------------------------------

  const handleClose = () => {
    setOpen(false)
  }

  const handleFilter = useCallback(val => {
    setValue(val)
  }, [])

  const handleStatusChange = useCallback(e => {
    setType(e.target.value)
  }, [])

  const handleTypeChange = useCallback(e => {
    setEmployeeType(e.target.value)
  }, [])

  const handleCloseExcel = () => {
    setOpenExcel(false)
  }

  // -------------------------- Delete Form --------------------------------

  const deleteAttendance = () => {
    setLoading(true);
    axios
      .post('/api/attendance/delete-attendance', {
        selectedAttendance
      })
      .then(function (response) {
        dispatch(
          fetchData({
            fromDate: fromDate,
            toDate: toDate,
            employee_no: value
          })
        ).then(() => {
          toast.success('Attendance Deleted Successfully.', {
            delay: 1000,
            position: 'bottom-right'
          })
          setLoading(false);
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

  // -------------------------- Add Document -----------------------------------------------

  const addAttendance = () => {
    router.push('/company-dashboard/form/add-form')
  }

  // -------------------------- Row Options -----------------------------------------------

  const RowOptions = ({ row }) => {
    // ** State
    const [anchorEl, setAnchorEl] = useState(null)
    const rowOptionsOpen = Boolean(anchorEl)

    const handleRowOptionsClick = event => {
      setAnchorEl(event.currentTarget)
    }

    const handleRowOptionsClose = () => {
      setAnchorEl(null)
    }

    const handleEditRowOptions = () => {
      setSelectedEditRow(row)
      setOpenEditDialog(true)
      handleRowOptionsClose()
    }

    const handleEditClose = () => {

    }

    const handleRowView = () => {
      router.push('/company-dashboard/form/' + row._id)
      handleRowOptionsClose()
    }

    const handleDelete = () => {
      setSelectedAttendance(row)
      setOpen(true)
    }

    const handleResetAttendance = (_id)=>{
      setLoading(true);
      axios.post('/api/attendance/reset-attendance' , {id:_id}).then((response)=>{

        setLoading(true);
        dispatch(
          fetchData({        
            fromDate: fromDate,
            toDate: toDate,
            employee_no: value
          })
        ).then(()=>{
          setLoading(false);
        })

      }).catch((err)=>{
        setLoading(false);
      })

    }

    // ------------------------------ Table Definition ---------------------------------

    return (
      <>
        <IconButton size='small' onClick={handleRowOptionsClick}>
          <Icon icon='mdi:dots-vertical' />
        </IconButton>
        <Menu
          keepMounted
          anchorEl={anchorEl}
          open={rowOptionsOpen}
          onClose={handleRowOptionsClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right'
          }}
          PaperProps={{ style: { minWidth: '8rem' } }}
        >
          {/* {session && session.user && session.user.permissions.includes('ViewForm') && (
            <MenuItem onClick={handleRowView} sx={{ '& svg': { mr: 2 } }}>
              <Icon icon='mdi:eye-outline' fontSize={20} />
              View
            </MenuItem>
          )} */}
          {session && session.user && session.user.permissions.includes('EditAttendance') && (
            <MenuItem onClick={()=>handleResetAttendance(row._id)} sx={{ '& svg': { mr: 2 } }}>
              <Icon icon='mdi:recycle' fontSize={20} />
              Reset
            </MenuItem>
          )}
          {session && session.user && session.user.permissions.includes('EditAttendance') && (
            <MenuItem onClick={handleEditRowOptions} sx={{ '& svg': { mr: 2 } }}>
              <Icon icon='mdi:pencil-outline' fontSize={20} />
              Edit
            </MenuItem>
          )}
          {session && session.user && session.user.permissions.includes('DeleteAttendance') && (
            <MenuItem onClick={handleDelete} sx={{ '& svg': { mr: 2 } }}>
              <Icon icon='mdi:delete-outline' fontSize={20} />
              Delete
            </MenuItem>
          )}
        </Menu>
      </>
    )
  }

  // ----------------------------excel ------------------------------------------

  const importExcel = () => {
    myRef.current.click()
  }

  

  const onFileChange = event => {
    
    /* wire up file reader */
    if (notAuthorized.includes('ViewEmployee')) {
      toast.error('You do not have permission to view Employees', {
        duration: 5000, position: 'bottom-right'
      });

      return;
    }
    const filename = event.target.files[0].name;
    console.log(companyFingerprintDevice?.functionName)
    if(companyFingerprintDevice?.functionName){
      onCustomFileChange(event);
    }
    else {
      let functions_ = {
        setOpenExcel ,
        setUnvalid 
      };
      functions["excel"](event , employeesList, handleSubmit , functions_ );

    }
    event.target.value = '' ;


    // if(target.files[0])

  }

  const onCustomFileChange = (event)=>{
    if(!event?.target?.files?.[0]?.name.endsWith(companyFingerprintDevice?.extension) ){
      toast.error('File Fomat should be ' + companyFingerprintDevice?.extension ,{delay:3000 , position:'bottom-right'});

      return ;
    }

    let functions_ = {
      setOpenExcel ,
      setUnvalid 
    };
    console.log(companyFingerprintDevice?.functionName == 'excel');
    console.log(functions );
    functions[companyFingerprintDevice?.functionName](event , employeesList, handleSubmit , functions_ );
  }



  const downloadExcel = () => {
    const link = document.getElementById('attendanceTemplate');
    link.href = '/attendance.xlsx';
    link.setAttribute('download', 'attendance-template.xlsx');
    link.click();
  }

  const handleSubmit = data => {
    data = data.map(({ reasons, index, Name, ...item }) => {
      return {
        date: new Date(item.Date),
        timeOut: item['Clock Out'],
        timeIn: item['Clock In'],
        employee_no: item['Emp No.'],
        employee_id : item['employee_id']
      }
    })
    console.log(data);
    setLoading(true)

    axios
      .post('/api/attendance/add-attendances', {
        data
      })
      .then(function (response) {
        toast.success('Form (' + data.title + ') Inserted Successfully.', {
          delay: 3000,
          position: 'bottom-right'
        })

        if (response.data.existing && response.data.existing.length > 0) {
          let attendances = new Array(response.data.existing);
          let str = (attendances.toString());
          toast.success(`the following attendances already exists at lines: ` + str, { duration: 5000, position: 'bottom-right', icon: 'ℹ️', });
        }
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

  const updateData = data => {
    setLoading(true);
    dispatch(
      fetchData({
        fromDate: fromDate,
        toDate: toDate,
        employee_no: value
      })
    ).then(() => setLoading(false))

  }

  // ------------------------------- Table columns --------------------------------------------

  const columns = [
    {
      flex: 0.02,
      minWidth: 50,
      field: '#',
      headerName: '#',
      renderCell: ({ row }) => {
        return (
          <Typography variant='subtitle1' noWrap sx={{ textTransform: 'capitalize' }}>
            {row.index}
          </Typography>
        )
      }
    },
    {
      flex: 0.11,
      minWidth: 120,
      field: 'employee_no',
      headerName: 'Id',
      renderCell: ({ row }) => {
        return (
          <Typography variant='subtitle1' noWrap sx={{ textTransform: 'capitalize' }}>
            {row.employee_no}
          </Typography>
        )
      }
    },
    {
      flex: 0.17,
      minWidth: 100,
      field: 'name',
      headerName: 'Name',
      renderCell: ({ row }) => {
        console.log(row.employee_info)

        return (
          <Typography variant='subtitle1' noWrap sx={{ textTransform: 'capitalize' }}>
            {row?.employee_info?.[0]?.firstName + ' ' + row?.employee_info?.[0]?.lastName}
          </Typography>
        )
      }
    },
    {
      flex: 0.11,
      minWidth: 120,
      field: 'date',
      headerName: 'Date',
      renderCell: ({ row }) => {
        return <>{new Date(row.date)?.toLocaleDateString('en-GB')}</>
      }
    },
    {
      flex: 0.11,
      minWidth: 120,
      field: 'timeIn',
      headerName: 'Time in',
      renderCell: ({ row }) => {
        let color = '' ;
        if(row?.shift_info?.[0]?.times){
          color = row?.timeIn < row?.shift_info?.[0]?.times?.[0]?.timeIn ? 'green' : color ;
          color = row?.timeIn > row?.shift_info?.[0]?.times?.[0]?.timeIn ? 'red' : color ;
        }

        return <span style={{color:color}}>{row.timeIn}</span>
      }
    },
    {
      flex: 0.11,
      minWidth: 120,
      field: 'timeOut',
      headerName: 'Time out',
      renderCell: ({ row }) => {
        let color = '' ;
        if(row?.shift_info?.[0]?.times){
          color = row?.timeOut > row?.shift_info?.[0]?.times?.[0]?.timeOut ? 'green' : color ;
          color = row?.timeOut < row?.shift_info?.[0]?.times?.[0]?.timeOut ? 'red' : color ;
        }

        return <span style={{color:color}}>{row.timeOut}</span>
      }
    },
    {
      flex: 0.11,
      minWidth: 120,
      field: 'timeInDif',
      headerName: 'Time In difference',
      renderCell: ({ row }) => {
        let diff = '-'; 

        if(row?.shift_info?.[0]?.times?.[0]){
          let timeIn = new Date('1970-01-01 ' + row?.shift_info?.[0]?.times?.[0]?.timeIn).getTime();
          let empTimeIn = new Date('1970-01-01 ' + row?.timeIn).getTime();
          diff = new Date(Math.abs( timeIn - empTimeIn ))
          diff = diff.toUTCString().substr(17,diff.toUTCString().length ).substr(0,8);
          diff =( timeIn <  empTimeIn ? '-'  : '+' ) + diff ;
        }

        return <span >{diff }</span>
      }
    },
    {
      flex: 0.11,
      minWidth: 120,
      field: 'timeOutDif',
      headerName: 'Time out difference',
      renderCell: ({ row }) => {
         let diff = '-'; 

        if(row?.shift_info?.[0]?.times?.[0]){
          let timeOut = new Date('1970-01-01 ' + row?.shift_info?.[0]?.times?.[0]?.timeOut).getTime();
          let empTimeOut = new Date('1970-01-01 ' + row?.timeOut).getTime();
          diff = new Date(Math.abs( timeOut - empTimeOut ))
          diff = diff.toUTCString().substr(17,diff.toUTCString().length ).substr(0,8);
          diff =( timeOut > empTimeOut ? '-'  : '+' ) + diff ;
        }
        
        return <span >{diff }</span>

      }
    },
    {
      flex: 0.11,
      minWidth: 120,
      field: 'time',
      headerName: 'Time',
      renderCell: ({ row }) => {
        // Logic in store
        // var timeStart = new Date('01/01/2007 ' + row.timeIn)
        // var timeEnd = new Date('01/01/2007 ' + row.timeOut)

        // return <>{((timeEnd - timeStart) / 60 / 60 / 1000).toFixed(2)}</>
        return <>{row.time} </>
      }
    },

    {
      flex: 0.07,
      minWidth: 45,
      field: 'status',
      headerName: 'Status',
      renderCell: ({ row }) => {
        return (
          <CustomChip
            skin='light'
            size='small'
            label={row.status}
            color={StatusObj[row.status]}
            sx={{ textTransform: 'capitalize', '& .MuiChip-label': { lineHeight: '18px' } }}
          />
        )
      }
    },
    {
      flex: 0.01,
      minWidth: 45,
      sortable: false,
      field: 'actions',
      headerName: '',
      renderCell: ({ row }) => <RowOptions row={row} />
    }
  ]

  // ------------------------------------ View ---------------------------------------------

  // if (loading) return <Loading header='Please Wait' description='Attendances are loading'></Loading>

  if (session && session.user && !session.user.permissions.includes('ViewAttendance'))
    return <NoPermission header='No Permission' description='No permission to view attendance'></NoPermission>

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <Breadcrumbs aria-label='breadcrumb' sx={{ pb: 0, p: 3 }}>
            <Link underline='hover' color='inherit' href='/'>
              Home
            </Link>
            <Typography color='text.primary' sx={{ fontSize: 18, fontWeight: '500' }}>
              Attendance List
            </Typography>
          </Breadcrumbs>
          <Divider sx={{ pb: 0, mb: 0 }} />
          <Grid container spacing={2} sx={{ px: 5, pt: 0, mt: -2 }}>
            <Grid item sm={2} xs={6}>
              <FormControl fullWidth size='small' sx={{ mt: 0 }}>
                <small>Date From</small>
                <DatePicker
                  value={new Date(fromDate)}
                  onChange={e => {
                    setFromDate(e)
                  }}
                  format={'dd/MM/yyyy'}
                  size='sm'
                />
              </FormControl>
            </Grid>
            <Grid item sm={2} xs={6}>
              <FormControl fullWidth size='small' sx={{ mt: 0 }}>
                <small>Date To</small>
                <DatePicker
                  size='sm'
                  value={new Date(toDate)}
                  format={'dd/MM/yyyy'}
                  onChange={e => {
                    setToDate(e)
                  }}
                />
              </FormControl>
            </Grid>
            <Grid item sm={1} xs={12} mt={0}>
              <FormControl fullWidth size='small' sx={{ mt: 0 }}>
                <small>ID</small>
                <Input
                  placeholder='ID'
                  size='sm'
                  onChange={e => {
                    setValue(e)
                  }}
                />
              </FormControl>
            </Grid>
            <Grid item sm={3} xs={12} mt={0}>
              {/* <FormControl fullWidth size='small' sx={{ mt: 0 }}>
                <small>Name</small>
                <Input placeholder='Name' size='sm' />
              </FormControl> */}
            </Grid>

            <Grid item sm={4} xs={12} textAlign={right}>
              {session && session.user && session.user.permissions.includes('AddAttendance') && (
                <>
                  <Button
                    type='button'
                    variant='contained'
                    size='small'
                    sx={{ mr: 1, mt: 2 }}
                    onClick={() => downloadExcel()}
                  >
                    Download template
                  </Button>
                  <a style={{ display: 'hidden' }} id='attendanceTemplate' />
                  <Button type='button' variant='contained' size='small' sx={{ mt: 2 }} onClick={() => importExcel()}>
                    Import
                  </Button>
                  <Button
                    type='button'
                    variant='contained'
                    size='small'
                    sx={{ mt: 2, mx: 2 }}
                    onClick={() => {
                      setOpenAddDialog(true)
                    }}
                  >
                    Add
                  </Button>
                  <input
                    type='file'
                    ref={myRef}
                    accept={'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,' + companyFingerprintDevice?.extension}
                    style={{ display: 'none' }}
                    onChange={e => {
                      onFileChange(e)
                    }}
                  />
                </>
              )}
            </Grid>
          </Grid>

          <Divider />

          {/* -------------------------- Table -------------------------------------- */}
        {
          loading ? 
          <Loading header='Please Wait' description='Attendances are loading'></Loading>:
          <DataGrid
            autoHeight
            rows={store.data}
            columns={columns}
            pageSize={pageSize}
            disableSelectionOnClick
            rowsPerPageOptions={[10, 25, 50]}
            sx={{ '& .MuiDataGrid-columnHeaders': { borderRadius: 0 } }}
            onPageSizeChange={newPageSize => setPageSize(newPageSize)}
          />
        }
        </Card>
      </Grid>
      {/* -------------------------- Delete Dialog -------------------------------------- */}
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
            Are you sure , you want to delete this Attendance
          </DialogContentText>
        </DialogContent>
        <DialogActions className='dialog-actions-dense'>
          <Button onClick={deleteAttendance}>Yes</Button>
          <Button onClick={handleClose}>No</Button>
        </DialogActions>
      </Dialog>
      <DialogShareProject openExcel={openExcel} setOpenExcel={setOpenExcel} Unvalid={Unvalid} />
      {openEditDialog ? (
        <DialogEditAttendance
          open={openEditDialog}
          setOpen={setOpenEditDialog}
          attendance={SelectedEditRow}
          updateData={updateData}
          setupdate={setupdate}
          dataSource={dialogEmployeesList}
        />
      ) : null}
      {openAddDialog ? (
        <DialogAddAttendance
          sx={{ zIndex: -1 }}
          open={openAddDialog}
          setOpen={setOpenAddDialog}
          attendance={SelectedEditRow}
          updateData={updateData}
          setupdate={setupdate}
          dataSource={dialogEmployeesList}
          onClose={(e => { console.log("55555") })}
        />
      ) : null}
    </Grid>
  )
}

const DialogShareProject = ({ openExcel, setOpenExcel, Unvalid }) => {
  // ** States

  const handleClose = () => {
    setOpenExcel(false)
  }

  return (
    <Dialog
      fullWidth
      open={openExcel}
      maxWidth='md'
      scroll='body'
      onClose={() => setOpenExcel(false)}
      onBackdropClick={() => setOpenExcel(false)}
    >
      <DialogContent sx={{ px: { xs: 8, sm: 15 }, py: { xs: 8, sm: 12.5 }, position: 'relative' }}>
        <IconButton
          size='small'
          onClick={() => setOpenExcel(false)}
          sx={{ position: 'absolute', right: '1rem', top: '1rem' }}
        >
          <Icon icon='mdi:close' />
        </IconButton>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant='h5' sx={{ mb: 3, lineHeight: '2rem' }}>
            Errors
          </Typography>
          <Typography variant='body2'>Errors with the file you want to upload fix them than retry again </Typography>
        </Box>

        <Typography variant='h6'>{`${Unvalid.length} Errors`}</Typography>
        <List dense sx={{ py: 4 }}>
          {Unvalid.map((val, index) => {
            return (
              <ListItem
                key={index}
                sx={{
                  p: 0,
                  display: 'flex',
                  flexWrap: 'wrap',
                  '.MuiListItem-container:not(:last-child) &': { mb: 4 },
                  borderBottom: '1px dashed black',
                  padding: '5px'
                }}
              >
                <ListItemText
                  primary={'line number ' + val.index}
                  secondary={'user :' + val.Name}
                  sx={{ m: 0, '& .MuiListItemText-primary, & .MuiListItemText-secondary': { lineHeight: '1.25rem' } }}
                />
                <ListItemSecondaryAction sx={{ right: 0 }}>
                  {val.reasons.map((val, index) => {
                    return <CustomChip key={index} label={val} skin='light' color='error' />
                  })}
                </ListItemSecondaryAction>
              </ListItem>
            )
          })}
        </List>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
          <Button variant='contained' onClick={handleClose}>
            ok
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default AllDocumentsList
