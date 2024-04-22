// ** React Imports
import { useState, useEffect, useCallback, forwardRef } from 'react'

import * as XLSX from 'xlsx'

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
import CardContent from '@mui/material/CardContent'
import Select from '@mui/material/Select'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContentText from '@mui/material/DialogContentText'
import toast from 'react-hot-toast'
import { Breadcrumbs } from '@mui/material'

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
import { fetchData, deleteUser } from 'src/store/apps/company-user'

// ** Third Party Components
import axios from 'axios'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Controller } from 'react-hook-form'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import NoPermission from 'src/views/noPermission'
import Loading from 'src/views/loading'

// ** Vars
const userTypeObj = {
  employee: { icon: 'mdi:account-outline', color: 'warning.main' },
  manager: { icon: 'mdi:account-outline', color: 'success.main' }
}

const userStatusObj = {
  active: 'success',
  pending: 'warning',
  blocked: 'error'
}

const StyledLink = styled(Link)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '1rem',
  cursor: 'pointer',
  textDecoration: 'none',
  color: theme.palette.text.secondary,
  '&:hover': {
    color: theme.palette.primary.main
  }
}))

// ** renders client column
const renderClient = row => {
  if (row.avatar) {
    return <CustomAvatar src={row.avatar} sx={{ mr: 3, width: 34, height: 34 }} />
  } else {
    return (
      <CustomAvatar
        skin='light'
        color={row.avatarColor || 'primary'}
        sx={{ mr: 3, width: 34, height: 34, fontSize: '1rem' }}
      >
        {getInitials(row.name ? row.name : 'ZZ')}
      </CustomAvatar>
    )
  }
}

const UserList = () => {
  // ** State
  const [type, setType] = useState('')
  const [plan, setPlan] = useState('')
  const [userStatus, setUserStatus] = useState('')
  const [value, setValue] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const [selectedUser, setSelectedUser] = useState()

  const { data: session, status } = useSession()

  // ** Hooks

  const dispatch = useDispatch()

  const store = useSelector(state => state.user)
  const router = useRouter()

  const handleExcelExport = () => {
    const wb = XLSX.utils.book_new()
    let ex = [...store.data]

    ex = ex.map(val => {
      let c = { ...val }
      delete c['_id']
      delete c['roles']
      delete c['permissions']
      delete c['password']
      delete c['created_at']
      delete c['company_info']
      delete c['company_id']
      delete c['updated_at']
      delete c['last_login']
      c.roles = c.roles_info.map(v => {
        return v.title
      })
      c.roles = c.roles.toString()
      delete c['roles_info']

      return c
    })

    const ws = XLSX.utils.json_to_sheet(ex)
    XLSX.utils.book_append_sheet(wb, ws, 'Comments')
    XLSX.writeFile(wb, 'users.xlsx')
  }

  useEffect(() => {
    setLoading(true);
    dispatch(
      fetchData({
        type,
        userStatus,
        q: value
      })
    ).then(setLoading(false))
  }, [dispatch, type, userStatus, value])

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const showErrors = (field, valueLen, min) => {
    if (valueLen === 0) {
      return `${field} field is required`
    } else if (valueLen > 0 && valueLen < min) {
      return `${field} must be at least ${min} characters`
    } else {
      return ''
    }
  }

  const schema = yup.object().shape({
    email: yup.string().email().required(),
    password: yup
      .string()
      .min(6, obj => showErrors('Password', obj.value.length, obj.min))
      .required(),
    name: yup
      .string()
      .min(3, obj => showErrors('Name', obj.value.length, obj.min))
      .required()
  })

  const defaultValues = {
    email: '',
    password: '',
    name: ''
  }

  const {
    reset,
    control,
    setValues,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver(schema)
  })

  const handleFilter = useCallback(val => {
    setValue(val)
  }, [])

  const handleTypeChange = useCallback(e => {
    setType(e.target.value)
  }, [])

  const handlePlanChange = useCallback(e => {
    setPlan(e.target.value)
  }, [])

  const handleStatusChange = useCallback(e => {
    setUserStatus(e.target.value)
  }, [])

  // ------------------------ Row Options -----------------------------------------

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
      router.push('/company-dashboard/user/' + row._id + '/edit-user')
      handleRowOptionsClose()
    }

    const handleRowView = () => {
      router.push('/company-dashboard/user/' + row._id + '/view/permission')
      handleRowOptionsClose()
    }

    const handleActivation =(row)=>{
      activationLink(row)
    }

    const handlePassword = () => {
      router.push('/company-dashboard/user/' + row._id + '/change-pass')
      handleRowOptionsClose()
    }

    const handleDelete = () => {
      setSelectedUser(row)
      setOpen(true)
    }


    //----------------- Request mail ------------------------------

      const activationLink = (row) => {
        setLoading(true);
        const { email } = row
        fetch("/api/reset-password/request/", {
          method: "POST",
          body: JSON.stringify({ email: email }),
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })
          .then((res) => res.json())
          .then((data) => {
            if(data.success){
              toast.success("Email Sent" , {
              delay: 5000,
              })
            }
            else{
              toast.error(data.message , {
              delay: 5000,
            })
            }
        
            setLoading(false);
          });
      };

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
          {session && session.user.permissions.includes('ViewUser') && (
            <MenuItem onClick={handleRowView} sx={{ '& svg': { mr: 2 } }}>
              <Icon icon='mdi:eye-outline' fontSize={20} />
              View
            </MenuItem>
          )}
          {session && session.user.permissions.includes('EditUser') && (
            <MenuItem onClick={handleEditRowOptions} sx={{ '& svg': { mr: 2 } }}>
              <Icon icon='mdi:pencil-outline' fontSize={20} />
              Edit
            </MenuItem>
          )}
          {session && session.user.permissions.includes('ChangePassword') && (
            <MenuItem onClick={handlePassword} sx={{ '& svg': { mr: 2 } }}>
              <Icon icon='mdi:key-outline' fontSize={20} />
              Change Password
            </MenuItem>
          )}
          {session && session.user.permissions.includes('ChangePassword') && (
            <MenuItem onClick={handleActivation} sx={{ '& svg': { mr: 2 } }}>
              <Icon icon='mdi:mail-outline' fontSize={20} />
              Send Activation Password
            </MenuItem>
          )}
          {session && session.user.permissions.includes('DeleteUser')  && session.user._id != row._id && row.type != 'manager'  && (
            <MenuItem onClick={handleDelete} sx={{ '& svg': { mr: 2 } }}>
              <Icon icon='mdi:delete-outline' fontSize={20} />
              Delete
            </MenuItem>
          )}
        </Menu>
      </>
    )
  }

  // ----------------------------- Columns --------------------------------------------

  const columns = [
    {
      flex: 0.05,
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
      flex: 0.15,
      minWidth: 150,
      field: 'name',
      headerName: 'User',
      renderCell: ({ row }) => {
        const { email, name } = row

        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {renderClient(row)}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
              <Typography noWrap sx={{ color: 'text.primary', textTransform: 'capitalize' }}>
                {name}
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
      flex: 0.1,
      field: 'type',
      minWidth: 100,
      headerName: 'Type',
      renderCell: ({ row }) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', '& svg': { mr: 3, color: userTypeObj[row.type].color } }}>
            <Icon icon={userTypeObj[row.type].icon} fontSize={20} />
            <Typography noWrap sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
              {row.type}
            </Typography>
          </Box>
        )
      }
    },
    {
      flex: 0.09,
      minWidth: 100,
      field: 'created_at',
      headerName: 'Created at',
      renderCell: ({ row }) => {
        return (
          <Typography variant='subtitle1' noWrap sx={{ textTransform: 'capitalize' }}>
            {new Date(row.created_at).toISOString().substring(0, 10)}
          </Typography>
        )
      }
    },
    {
      flex: 0.13,
      minWidth: 60,
      field: 'roles',
      sortable: false,
      headerName: 'Roles',
      renderCell: ({ row }) => {
        return row.roles_info.map((e, index) => {
          return (
            <CustomChip
              key={index}
              skin='light'
              size='small'
              label={e.title}
              color={userStatusObj[e.title]}
              sx={{ textTransform: 'capitalize', '& .MuiChip-label': { lineHeight: '18px' } ,mr:1 }}
            />
          )
        })
      }
    },
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
            color={userStatusObj[row.status]}
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

  // ----------------------------- Add User --------------------------------------------

  const addUser = () => {
    router.push('/company-dashboard/user/add-user')
  }

  const deleteUser = () => {
    setLoading(true)
    axios
      .post('/api/company-user/delete-user', {
        selectedUser
      })
      .then(function (response) {
        dispatch(fetchData({})).then(() => {
          toast.success('User (' + selectedUser.name + ') Deleted Successfully.', {
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

  //   --------------------------- Return ----------------------------------------------

  if (loading) return <Loading header='Please Wait' description='Users are loading'></Loading>

  if (session && !session.user && session.user.permissions.includes('ViewUser'))
    return <NoPermission header='No Permission' description='No permission to View Users'></NoPermission>

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>

        <Breadcrumbs aria-label='breadcrumb' sx={{ pb: 0, p: 3 }}>
            <Link underline='hover' color='inherit' href='/'>
              Home
            </Link>
            <Typography color='text.primary' sx={{ fontSize: 18, fontWeight: '500' }}>
              Users List
            </Typography>
          </Breadcrumbs>

          <Divider />
          
          <CardContent>
            <Grid container spacing={6}>
              <Grid item sm={4} xs={12}>
                <FormControl fullWidth size='small'>
                  <InputLabel id='type-select'>Select Type</InputLabel>
                  <Select
                    fullWidth
                    value={type}
                    id='select-type'
                    label='Select Type'
                    labelId='type-select'
                    onChange={handleTypeChange}
                    inputProps={{ placeholder: 'Select Type' }}
                  >
                    <MenuItem value=''>All Types</MenuItem>
                    <MenuItem value='employee'>Employee</MenuItem>
                    <MenuItem value='manager'>Manager</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item sm={4} xs={12}>
                <FormControl fullWidth size='small'>
                  <InputLabel id='status-select'>Select Status</InputLabel>
                  <Select
                    fullWidth
                    value={userStatus}
                    id='select-status'
                    label='Select Status'
                    labelId='status-select'
                    onChange={handleStatusChange}
                    inputProps={{ placeholder: 'Select Status' }}
                  >
                    <MenuItem value=''>All Status</MenuItem>
                    <MenuItem value='blocked'>Blocked</MenuItem>
                    <MenuItem value='active'>Active</MenuItem>
                    <MenuItem value='pending'>Pending</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item sm={4} xs={12}></Grid>
            </Grid>
          </CardContent>
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
              onClick={handleExcelExport}
              sx={{ mr: 4, mb: 2 }}
              color='secondary'
              variant='outlined'
              startIcon={<Icon icon='mdi:export-variant' fontSize={20} />}
            >
              Export
            </Button>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
              <TextField
                size='small'
                value={value}
                sx={{ mr: 6, mb: 2 }}
                placeholder='Search User'
                onChange={e => handleFilter(e.target.value)}
              />

              {session && session.user.permissions.includes('AddUser') && (
                <Button type='button' variant='contained' sx={{ mb: 3 }} onClick={() => addUser()}>
                  Add User
                </Button>
              )}
            </Box>
          </Box>

          {/* ------------------------------- Table --------------------------------- */}

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
            Are you sure , you want to delete user <span className='bold'>{selectedUser && selectedUser.name}</span>
          </DialogContentText>
        </DialogContent>
        <DialogActions className='dialog-actions-dense'>
          <Button onClick={deleteUser}>Yes</Button>
          <Button onClick={handleClose}>No</Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}


export default UserList
