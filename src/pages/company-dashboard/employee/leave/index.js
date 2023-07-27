// ** React Imports
import { useState, useEffect, useCallback } from 'react'

// ** Next Imports
import Link from 'next/link'

import { getInitials } from 'src/@core/utils/get-initials'

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

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Custom Components Imports
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'

// ** Actions Imports
import { fetchData } from 'src/store/apps/employeeLeave'
import { EmployeeDeductionsType } from 'src/local-db'

// ** Third Party Components
import axios from 'axios'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import NoPermission from 'src/views/noPermission'
import { right } from '@popperjs/core'
import { Breadcrumbs } from '@mui/material'

// // ** Status Obj

const StatusObj = {
  active: 'success',
  pending: 'warning',
  blocked: 'error'
}

const statusName = {
  paidLeave: 'Paid leave' ,
  unpaidLeave: 'Unpaid Leave',
  sickLeave: 'Sick Leave',
  maternityLeave: 'Maternity Leave',
  parentalLeave: 'Parental Leave',
  otherLeave: 'Other Leave' 
}

const statusDs = [
  { label: 'Paid leave', value: 'paidLeave' },
  { label: 'Unpaid Leave', value: 'unpaidLeave' },
  { label: 'Sick Leave', value: 'sickLeave' },
  { label: 'Maternity Leave', value: 'maternityLeave' },
  { label: 'Parental Leave', value: 'parentalLeave' },
  { label: 'Other Leave', value: 'otherLeave' }
]

const LeaveList = () => {
  // ** State
  
  const [leaveType, setLeaveType] = useState('')
  const [leaveStatus, setLeaveStatus] = useState('')
  const [value, setValue] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedLeave, setselectedLeave] = useState()
  const { data: session, status } = useSession()

  // ** Hooks

  const dispatch = useDispatch()
  const store = useSelector(state => state.employeeLeave)
  
  const router = useRouter()

  useEffect(() => {
    dispatch(
      fetchData({
        leaveType,
        leaveStatus,
        q: value
      })
    ).then(setLoading(false))
  }, [dispatch, leaveType, leaveStatus, value])

  // ----------------------- Handle ------------------------------

  const handleClose = () => {
    setOpen(false)
  }

  const handleFilter = useCallback(val => {
    setValue(val)
  }, [])

  const HandleStatusChange = useCallback(e => {
    setLeaveStatus(e.target.value)
  }, [])

  const HandleTypeChange = useCallback(e => {
    setLeaveType(e.target.value)
  }, [])

  // -------------------------- Delete Form --------------------------------

  const deleteLeaves = () => {
    axios
      .post('/api/employee-leave/delete-leave', {
        selectedLeave
      })
      .then(function (response) {
        dispatch(fetchData({})).then(() => {
          toast.success('leave (' + selectedLeave.title + ') Deleted Successfully.', {
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

  // -------------------------- Add Document -----------------------------------------------

  const addLeave = () => {
    router.push('/company-dashboard/employee/leave/add-leave')
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
      router.push('/company-dashboard/employee/leave/' + row._id)
      handleRowOptionsClose()
    }

    const handleDelete = () => {
      setselectedLeave(row)
      setOpen(true)
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

          {session && session.user && session.user.permissions.includes('EditEmployeeLeave') && (
            <MenuItem onClick={handleEditRowOptions} sx={{ '& svg': { mr: 2 } }}>
              <Icon icon='mdi:pencil-outline' fontSize={20} />
              Edit
            </MenuItem>
          )}
          {session && session.user && session.user.permissions.includes('DeleteEmployeeLeave') && (
            <MenuItem onClick={handleDelete} sx={{ '& svg': { mr: 2 } }}>
              <Icon icon='mdi:delete-outline' fontSize={20} />
              Delete
            </MenuItem>
          )}
        </Menu>
      </>
    )
  }

  // ------------------------------- Table columns --------------------------------------------

  const renderClient = row => {
    if (row.logo) {
      return <CustomAvatar src={row.logo} sx={{ mr: 3, width: 34, height: 34 }} />
    } else {
      return (
        <CustomAvatar
          skin='light'
          color={row.avatarColor || 'primary'}
          sx={{ mr: 3, width: 34, height: 34, fontSize: '1rem' }}
        >
          {getInitials(row.firstName ? row.firstName + ' ' + row.lastName : '@')}
        </CustomAvatar>
      )
    }
  }

  const columns = [
    {
      flex: 0.02,
      minWidth: 50,
      field: 'index',
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
      flex: 0.15,
      minWidth: 150,
      field: 'employee',
      headerName: 'Employee',
      renderCell: ({ row }) => {
        const { email, firstName, lastName } = row.employee_info[0]
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {renderClient(row.employee_info[0])}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
              <Typography noWrap sx={{ color: 'text.primary', textTransform: 'capitalize' }}>
                {firstName} {lastName}
              </Typography>
              <Typography noWrap variant='caption'>
                {email}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.08,
      field: 'reason',
      minWidth: 100,
      headerName: 'Reason',
      renderCell: ({ row }) => {
        return <>{row.reason}</>
      }
    },
    {
      flex: 0.08,
      field: 'type',
      minWidth: 100,
      headerName: 'Types',
      renderCell: ({ row }) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', height: 250 }}>
            <Icon fontSize={20} />
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              <CustomChip
                color='primary'
                skin='light'
                size='small'
                sx={{ mx: 0.5, mt: 0.5, mb: 0.5 , textTransform: 'capitalize' }}
                label={row.type}
              />
            </div>
          </Box>
        )
      }
    },
    {
      flex: 0.08,
      field: 'status_reason',
      minWidth: 100,
      headerName: 'Status',
      renderCell: ({ row }) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', height: 250 }}>
            <Icon fontSize={20} />
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              <CustomChip
                color='info'
                skin='light'
                size='small'
                sx={{ mx: 0.5, mt: 0.5, mb: 0.5 , textTransform: 'capitalize' }}
                label={statusName[row.status_reason]}
              />
            </div>
          </Box>
        )
      }
    },
    {
      flex: 0.11,
      minWidth: 120,
      field: 'from',
      headerName: 'From Date',
      renderCell: ({ row }) => {
        const [date, time, ...r] = row.date_from.split('T')
        return <>{date} { row.type == 'hourly' && <span style={{'paddingRight' : '5px' , 'paddingLeft' : '5px'}}>{ time.substring(0, 5)} </span>} </>
      }
    },
    {
      flex: 0.11,
      minWidth: 120,
      field: 'to',
      headerName: 'To Date',
      renderCell: ({ row }) => {
        const [date, time, ...r] = row.date_to.split('T')
        return <>{date} { row.type == 'hourly' && <span style={{'paddingRight' : '5px' , 'paddingLeft' : '5px'}}>{ time.substring(0, 5)} </span>} </>
      }
    },
    {
      flex: 0.07,
      minWidth: 45,
      field: 'paidValue',
      headerName: 'Paid Value',
      renderCell: ({ row }) => {
        return (
          <>{row.paidValue} %</>
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

  if (loading) return <Loading header='Please Wait' description='Leaves is loading'></Loading>

  if (session && session.user && !session.user.permissions.includes('ViewEmployeeLeave'))
    return <NoPermission header='No Permission' description='No permission to view employees leaves'></NoPermission>

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <Breadcrumbs aria-label='breadcrumb' sx={{ pb: 0, p: 3 }}>
            <Link underline='hover' color='inherit' href='/'>
              Home
            </Link>
            <Typography color='text.primary' sx={{ fontSize: 18, fontWeight: '500' }}>
              Leaves List
            </Typography>
          </Breadcrumbs>
          <Divider />
          <Grid container spacing={6} sx={{ px: 5, pt: 3 }}>
            <Grid item sm={2} xs={6} sx={{ p: 2, pb: 0 }}>
              <FormControl fullWidth size='small'>
                <InputLabel id='status-select'>Select Type</InputLabel>
                <Select
                  fullWidth
                  value={leaveType}
                  id='select-type'
                  label='Select Type'
                  labelId='select-type'
                  onChange={HandleTypeChange}
                  inputProps={{ placeholder: 'Select Type' }}
                >
                  <MenuItem value=''>All Type</MenuItem>
                  <MenuItem value='daily'>Daily</MenuItem>
                  <MenuItem value='hourly'>Hourly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item sm={2} xs={6}>
              <FormControl fullWidth size='small'>
                <InputLabel id='status-select'>Select Status</InputLabel>
                <Select
                  fullWidth
                  value={leaveStatus}
                  id='select-status'
                  label='Select Status'
                  labelId='status-select'
                  onChange={HandleStatusChange}
                  inputProps={{ placeholder: 'Select Status' }}
                >
                  <MenuItem value=''>All Type</MenuItem>
                  {statusDs &&
                    statusDs.map((status, index) => {
                      return (
                        <MenuItem key={index} value={status.value}>
                          {status.label}
                        </MenuItem>
                      )
                    })}
                </Select>
              </FormControl>
            </Grid>
            <Grid item sm={3} xs={12}>
              <FormControl fullWidth size='small'>
                <TextField
                  size='small'
                  label='Search'
                  value={value}
                  sx={{ mr: 6, mb: 2 }}
                  placeholder='Search User'
                  onChange={e => handleFilter(e.target.value)}
                />
              </FormControl>
            </Grid>

            <Grid item sm={5} xs={12} textAlign={right}>
              <Button
                sx={{ mr: 4, mb: 2 }}
                color='secondary'
                variant='outlined'
                startIcon={<Icon icon='mdi:export-variant' fontSize={20} />}
              >
                Export
              </Button>
              {session && session.user && session.user.permissions.includes('AddEmployeeLeave') && (
                <Button type='button' variant='contained' sx={{ mb: 3 }} onClick={() => addLeave()}>
                  Add Leave
                </Button>
              )}
            </Grid>
          </Grid>

          <Divider />

          {/* -------------------------- Table -------------------------------------- */}
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
            Are you sure , you want to delete leaves
            <span className='bold'>{selectedLeave && selectedLeave.title}</span>
          </DialogContentText>
        </DialogContent>
        <DialogActions className='dialog-actions-dense'>
          <Button onClick={deleteLeaves}>Yes</Button>
          <Button onClick={handleClose}>No</Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )

}

export default LeaveList
