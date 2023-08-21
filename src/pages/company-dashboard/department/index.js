// ** React Imports
import { useState, useEffect, useCallback, forwardRef } from 'react'

// ** Next Imports
import Link from 'next/link'
import Fade from '@mui/material/Fade'

import * as XLSX from 'xlsx'

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
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContentText from '@mui/material/DialogContentText'
import toast from 'react-hot-toast'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Custom Components Imports
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials'

// ** Actions Imports
import { fetchDepartmentData } from 'src/store/apps/company-department'

// ** Third Party Components
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Loading from 'src/views/loading'
import NoPermission from 'src/views/noPermission'
import { Breadcrumbs } from '@mui/material'

// ** Vars
const companyTypeObj = {
  healthCenter: { icon: 'mdi:laptop', color: 'success.main', name: 'Health center' },
  clinic: { icon: 'mdi:account-outline', color: 'warning.main', name: 'Clinic' }
}

const StatusObj = {
  active: 'success',
  pending: 'warning',
  blocked: 'error'
}

const handleExcelExport = () => {
  const wb = XLSX.utils.book_new()
  let ex = [...store.data]

  ex = ex.map(val => {
    let c = { ...val }
    delete c['company_id']
    delete c['created_at']
    delete c['children_info']
    delete c['parent']
    delete c['updated_at']
    delete c['user_id']
    delete c['user_info']
    delete c['_id']
    c.parent = c.parent_info.map(v => {
      return v.name
    })
    delete c['parent_info']

    return c
  })
}

const DepartmentList = ({ apiData }) => {
  // ** State
  const [type, setType] = useState('')
  const [plan, setPlan] = useState('')
  const [departmentStatus, setDepartmentStatus] = useState('')
  const [value, setValue] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [addUserOpen, setAddUserOpen] = useState(false)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const [selectedDepartment, setSelectedDepartment] = useState()

  const [editUserOpen, setEditUserOpen] = useState(false)
  const { data: session, status } = useSession()
  const [show, setShow] = useState(false)

  // ** Hooks

  const dispatch = useDispatch()

  const store = useSelector(state => state.companyDepartment)
  const router = useRouter()

  const handleExcelExport = () => {
    const wb = XLSX.utils.book_new()
    let ex = [...store.data]

    ex = ex.map(val => {
      let c = { ...val }
      delete c['company_id']
      delete c['created_at']
      delete c['children_info']
      delete c['parent']
      delete c['updated_at']
      delete c['user_id']
      c.manager = c.user_info.map(v => {
        return v.name
      })
      c.manager = c.manager.toString()
      delete c['user_info']
      delete c['_id']
      c.parent = c.parent_info.map(v => {
        return v.name
      })
      c.parent = c.parent.toString()

      delete c['parent_info']

      return c
    })

    const ws = XLSX.utils.json_to_sheet(ex)
    XLSX.utils.book_append_sheet(wb, ws, 'Comments')
    XLSX.writeFile(wb, 'departments.xlsx')
  }

  useEffect(() => {
    dispatch(
      fetchDepartmentData({
        type,
        departmentStatus,
        q: value
      })
    ).then(setLoading(false))
  }, [dispatch, type, departmentStatus, value])

  const handleClose = () => {
    setOpen(false)
  }

  const handleFilter = useCallback(val => {
    setValue(val)
  }, [])

  const RowOptions = ({ row }) => {
    // ** Hooks
    const dispatch = useDispatch()

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
      router.push('/company-dashboard/department/' + row._id + '/edit-department')
      handleRowOptionsClose()
    }

    const handleRowView = () => {
      router.push('/company-dashboard/company-dashboard/' + row._id + '/view/subscriptions')
      handleRowOptionsClose()
    }

    const handleDelete = () => {
      setSelectedDepartment(row)
      setOpen(true)
    }

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
          {/* {session && session.user && session.user.permissions.includes('ViewDepartment') && (
            <MenuItem onClick={handleRowView} sx={{ '& svg': { mr: 2 } }}>
              <Icon icon='mdi:eye-outline' fontSize={20} />
              View
            </MenuItem>
          )} */}
          {session && session.user && session.user.permissions.includes('EditDepartment') && (
            <MenuItem onClick={handleEditRowOptions} sx={{ '& svg': { mr: 2 } }}>
              <Icon icon='mdi:pencil-outline' fontSize={20} />
              Edit
            </MenuItem>
          )}
          {session && session.user && session.user.permissions.includes('DeleteDepartment') && (
            <MenuItem onClick={handleDelete} sx={{ '& svg': { mr: 2 } }}>
              <Icon icon='mdi:delete-outline' fontSize={20} />
              Delete
            </MenuItem>
          )}
        </Menu>
      </>
    )
  }

  const columns = [
    {
      flex: 0.02,
      minWidth: 100,
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
      flex: 0.12,
      minWidth: 100,
      field: 'department',
      headerName: 'Department',
      renderCell: ({ row }) => {
        return (
          <Typography variant='subtitle1' noWrap sx={{ textTransform: 'capitalize' }}>
            {row.name}
          </Typography>
        )
      }
    },

    {
      flex: 0.1,
      field: 'parent',
      minWidth: 100,
      headerName: 'Core Department',
      renderCell: ({ row }) => {
        return (
          <>
            {row.parent_info[0] && <Box sx={{ display: 'flex', alignItems: 'center' }}>{row.parent_info[0].name}</Box>}
            {!row.parent_info[0] && <Box sx={{ display: 'flex', alignItems: 'center' }}>-</Box>}
          </>
        )
      }
    },

    {
      flex: 0.11,
      minWidth: 120,
      field: 'user',
      headerName: 'Manager',
      renderCell: ({ row }) => {
        const { user_info } = row

        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            { row.user_info[0] && (
              <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
                <Typography noWrap variant='caption' sx={{ color: 'text.primary' }}>
                  {row.user_info[0].firstName +' '+row.user_info[0].lastName}
                </Typography>
                <Typography noWrap variant='caption'>
                  {row.user_info[0].email}
                </Typography>
              </Box>
            )}
          </Box>
        )
      }
    },

    // {
    //   flex: 0.08,
    //   minWidth: 60,
    //   field: 'employees',
    //   headerName: 'Employees',
    //   renderCell: ({ row }) => {
    //     return (
    //       <Typography noWrap variant='caption' sx={{ color: 'text.primary' }}>
    //         0
    //       </Typography>
    //     )
    //   }
    // },
    
    {
      flex: 0.08,
      minWidth: 60,
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
      flex: 0.08,
      minWidth: 10,
      sortable: false,
      field: 'actions',
      headerName: '',
      renderCell: ({ row }) => <RowOptions row={row} />
    }
  ]

  const addDepartment = () => {
    router.push('/company-dashboard/department/add-department')
  }

  const deleteDepartment = () => {
    axios
      .post('/api/company-department/delete-department', {
        selectedDepartment
      })
      .then(function (response) {
        dispatch(fetchDepartmentData({})).then(() => {
          toast.success('Department (' + selectedDepartment.name + ') Deleted Successfully.', {
            delay: 5000,
            position: 'bottom-right'
          })
          setOpen(false)
        })
      })
      .catch(function (error) {
        toast.error('Error : ' + error.response.data.message + ' !', {
          delay: 5000,
          position: 'bottom-right'
        })
        setLoading(false)
      })
  }

  // ------------------------------ View ---------------------------------

  if (loading) return <Loading header='Please Wait' description='Department is inseting'></Loading>

  if (session && session.user && !session.user.permissions.includes('ViewDepartment'))
    return <NoPermission header='No Permission' description='No permission to view departments'></NoPermission>

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <Breadcrumbs aria-label='breadcrumb' sx={{ pb: 0, p: 3 }}>
            <Link underline='hover' color='inherit' href='/'>
              Home
            </Link>
            <Typography color='text.primary' sx={{ fontSize: 18, fontWeight: '500' }}>
              Departments List
            </Typography>
          </Breadcrumbs>

          <Divider />

          {/* ------------------------- Table Header -------------------------------- */}
          <Box
            sx={{
              p: 5,
              pb: 3,
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Button
              sx={{ mr: 4, mb: 2 }}
              color='secondary'
              variant='outlined'
              onClick={handleExcelExport}
              startIcon={<Icon icon='mdi:export-variant' fontSize={20} />}
            >
              Export
            </Button>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
              <TextField
                size='small'
                value={value}
                sx={{ mr: 6, mb: 2 }}
                placeholder='Search Department'
                onChange={e => handleFilter(e.target.value)}
              />

              {session && session.user && session.user.permissions.includes('AddDepartment') && (
                <Button type='button' variant='contained' sx={{ mb: 3 }} onClick={() => addDepartment()}>
                  Add Department
                </Button>
              )}
            </Box>
          </Box>

          {/* ------------------------------- Table --------------------------------- */}

          {store.data && (
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
          )}
        </Card>
      </Grid>

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
            Are you sure , you want to delete department{' '}
            <span className='bold'>{selectedDepartment && selectedDepartment.name}</span>
          </DialogContentText>
        </DialogContent>
        <DialogActions className='dialog-actions-dense'>
          <Button onClick={deleteDepartment}>Yes</Button>
          <Button onClick={handleClose}>No</Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default DepartmentList
