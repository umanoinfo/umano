// ** React Imports
import { useState, useEffect, useCallback, forwardRef } from 'react'

import * as XLSX from 'xlsx'

// ** Next Imports
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import { DataGrid } from '@mui/x-data-grid'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import toast from 'react-hot-toast'
import { Breadcrumbs } from '@mui/material'
import {
  Checkbox,
  DialogActions,
  DialogContentText,
  Divider,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Switch
} from '@mui/material'

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
import { fetchData, deleteUser } from 'src/store/apps/vendor'

// ** Third Party Components
import axios from 'axios'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Controller } from 'react-hook-form'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import NoPermission from 'src/views/noPermission'
import Loading from 'src/views/loading'


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

const VendorsList = () => {
  // ** State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [value, setValue] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [oldTitle, setOldTitle] = useState()
  const [deleteValue, setDeleteValue] = useState('')
  const { data: session, status } = useSession()

  // ** Hooks

  const dispatch = useDispatch()

  const store = useSelector(state => state.vendor)
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
        q: value
      })
    ).then(() => setLoading(false));
  }, [dispatch, value])




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

  const handleDialogDeleteToggle = () => setDeleteDialogOpen(!deleteDialogOpen)

  const handleDeleteVendor = permission => {
    setDeleteValue(permission)
    setOldTitle(permission.title)
    setDeleteDialogOpen(true)
  }


  const handleEditVendor = (row) => {
    router.push('/company-dashboard/vendors-list/' + row._id + '/edit-vendor')
  }

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
      headerName: 'Name',
      renderCell: ({ row }) => {
        const { name } = row

        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
              <Typography noWrap sx={{ color: 'text.primary', textTransform: 'capitalize' }}>
                {name}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.1,
      field: 'email',
      minWidth: 100,
      headerName: 'email',
      renderCell: ({ row }) => {

        const { email } = row

        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography noWrap variant='caption'>
              {email}
            </Typography>
          </Box>
        )
      }
    },
    {
      flex: 0.09,
      minWidth: 100,
      field: 'mobile',
      headerName: 'Mobile',
      renderCell: ({ row }) => {
        return (
          <Typography variant='subtitle1' noWrap sx={{ textTransform: 'capitalize' }}>
            {row.mobile}
          </Typography>
        )
      }
    },
    {
      flex: 0.09,
      minWidth: 100,
      field: 'landline',
      headerName: 'Landline',
      renderCell: ({ row }) => {
        return (
          <Typography variant='subtitle1' noWrap sx={{ textTransform: 'capitalize' }}>
            {row.landline}
          </Typography>
        )
      }
    },
    {
      flex: 0.09,
      minWidth: 100,
      field: 'contactperson',
      headerName: 'Contact Person',
      renderCell: ({ row }) => {
        return (
          <Typography variant='subtitle1' noWrap sx={{ textTransform: 'capitalize' }}>
            {row.contactperson}
          </Typography>
        )
      }
    },
    {
      flex: 0.05,
      minWidth: 25,
      sortable: false,
      field: 'actions',
      headerName: '',
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {session && session.user && session.user.permissions.includes('EditVendor') && (
            <IconButton onClick={() => handleEditVendor(row)}>
              <Icon icon='mdi:pencil-outline' />
            </IconButton>
          )}
          {session && session.user && session.user.permissions.includes('DeleteVendor') && (
            <IconButton onClick={() => handleDeleteVendor(row)}>
              <Icon icon='mdi:delete-outline' />
            </IconButton>
          )}
        </Box>
      )
    }
  ]

  // ----------------------------- Add User --------------------------------------------

  const addVendor = () => {
    router.push('/company-dashboard/vendors-list/add-vendor')
  }

  const deletePernission = () => {
    setLoading(true);
    axios
      .post('/api/vendor-list/delete-vendor', {
        id: deleteValue.id
      })
      .then(function (response) {
        dispatch(fetchData({})).then(() => {
          toast.success('Permission (' + deleteValue.title + ') Deleted Successfully.', {
            delay: 3000,
            position: 'bottom-right'
          })

          setDeleteDialogOpen(false)
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

  //   --------------------------- Return ----------------------------------------------

  // if (loading) return <Loading header='Please Wait' description='Users are loading'></Loading>

  if (session && !session.user && session.user.permissions.includes('ViewUser'))
    return <NoPermission header='No Permission' description='No permission to View Users'></NoPermission>

  return (
    <>

      <Grid container spacing={6}>
        <Grid item xs={12}>

          <Card>
            {!loading && <>
              <Breadcrumbs aria-label='breadcrumb' sx={{ pb: 0, p: 3 }}>
                <Link underline='hover' color='inherit' href='/'>
                  Home
                </Link>
                <Typography color='text.primary' sx={{ fontSize: 18, fontWeight: '500' }}>
                  Vendors List
                </Typography>
              </Breadcrumbs>

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
                    placeholder='Search Vendor'
                    onChange={e => handleFilter(e.target.value)}
                  />

                  {session && session.user.permissions.includes('AddVendor') && (
                    <Button type='button' variant='contained' sx={{ mb: 3 }} onClick={() => addVendor()}>
                      Add Vendor
                    </Button>
                  )}
                </Box>
              </Box>
            </>}
            {/* ------------------------------- Table --------------------------------- */}
            {
              loading ?
                <Loading header='Please Wait' description='Users are loading'></Loading> :

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

      </Grid>

      <Dialog
        open={deleteDialogOpen}
        disableEscapeKeyDown
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            // handleClose()
          }
        }}
      >
        <DialogTitle id='alert-dialog-title text'>Warning</DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>
            Are you sure , you want to delete vendor{' '}
            <span className='bold'>{deleteValue && deleteValue.title}</span>
          </DialogContentText>
        </DialogContent>
        <DialogActions className='dialog-actions-dense'>
          <Button onClick={deletePernission}>Yes</Button>
          <Button onClick={handleDialogDeleteToggle}>No</Button>
        </DialogActions>
      </Dialog>

    </>

  )

}


export default VendorsList
