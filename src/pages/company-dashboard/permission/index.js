// ** React Imports
import { useState, useEffect, useCallback } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import { DataGrid } from '@mui/x-data-grid'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Custom Components Imports
import CustomChip from 'src/@core/components/mui/chip'

// ** Actions Imports
import permissions, { fetchData } from 'src/store/apps/permissions'
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
import axios from 'axios'
import { toast } from 'react-hot-toast'
import Loading from 'src/views/loading'
import { useSession } from 'next-auth/react'
import NoPermission from 'src/views/noPermission'

const colors = {
  support: 'info',
  users: 'success',
  manager: 'warning',
  administrator: 'primary',
  'restricted-user': 'error'
}

const PermissionsTable = () => {
  // ** State
  const [value, setValue] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [editValue, setEditValue] = useState('')
  const [deleteValue, setDeleteValue] = useState('')
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [group, setGroup] = useState('User')
  const [title, setTitle] = useState()
  const [loading, setLoading] = useState(true)
  const [oldTitle, setOldTitle] = useState()
  const [isCompany, setIsCompany] = useState(true)

  const { data: session, status } = useSession()

  // ** Hooks
  const dispatch = useDispatch()
  const store = useSelector(state => state.permissions)
  useEffect(() => {
    dispatch(
      fetchData({
        q: value
      })
    ).then( () => setLoading(false))
  }, [dispatch, value])

  const handleFilter = useCallback(val => {
    setValue(val)
  }, [])

  // -------------------------- Columns ----------------------------------------

  const columns = [
    {
      flex: 0.25,
      field: 'group',
      minWidth: 140,
      headerName: 'Group',
      renderCell: ({ row }) => <Typography>{row.group}</Typography>
    },
    {
      flex: 0.25,
      field: 'name',
      minWidth: 140,
      headerName: 'Name',
      renderCell: ({ row }) => <Typography>{row.title}</Typography>
    },
    {
      flex: 0.35,
      minWidth: 280,
      field: 'assignedTo',
      headerName: 'Assigned To',
      renderCell: ({ row }) => {
        if (row.roles)
          return row.roles.map((assignee, index) => (
            <CustomChip
              size='small'
              key={index}
              skin='light'
              color={colors[assignee]}
              label={assignee.replace('-', ' ')}
              sx={{ '& .MuiChip-label': { textTransform: 'capitalize' }, '&:not(:last-of-type)': { mr: 3 } }}
            />
          ))
      }
    },
    {
      flex: 0.15,
      minWidth: 115,
      sortable: false,
      field: 'actions',
      headerName: '',
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {session && session.user && session.user.permissions.includes('AdminEditPermission') && (
            <IconButton onClick={() => handleAdminEditPermission(row)}>
              <Icon icon='mdi:pencil-outline' />
            </IconButton>
          )}
          {session && session.user && session.user.permissions.includes('AdminDeletePermission') && (
            <IconButton onClick={() => handleAdminDeletePermission(row)}>
              <Icon icon='mdi:delete-outline' />
            </IconButton>
          )}
        </Box>
      )
    }
  ]

  // -------------------------- Add Permission ----------------------------------------

  const handleDialogAddToggle = () => setAddDialogOpen(!addDialogOpen)

  const onSubmitAdd = () => {
    if (!title) {
      toast.error('Error : You must insert title !', {
        delay: 2000,
        position: 'bottom-right'
      })

      return <></>
    }

    setLoading(true)

    const data = {
      title: title,
      alias: title.replace(/\s/g, ''),
      group: group,
      type: 'admin',
      status: 'Active',
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null
    }

    axios
      .post('/api/permission/add-permission', {
        data: data,
        user: session.user
      })
      .then(function (response) {
        dispatch(fetchData({})).then(() => {
          toast.success('Permission (' + data.title + ') Inserted Successfully.', {
            delay: 3000,
            position: 'bottom-right'
          })
          setLoading(false)
          setTitle('')
        })
      })
      .catch(function (error) {
        toast.error('Error : ' + error.response.data.message + ' !', {
          delay: 2000,
          position: 'bottom-right'
        })
        setLoading(false)
      })
    setEditDialogOpen(false)
  }

  // -------------------------- Delete Permission ----------------------------------------

  const handleDialogDeleteToggle = () => setDeleteDialogOpen(!deleteDialogOpen)

  const handleAdminDeletePermission = permission => {
    setDeleteValue(permission)
    setOldTitle(permission.title)
    setDeleteDialogOpen(true)
  }

  const deletePernission = () => {
    axios
      .post('/api/permission/delete-permission', {
        deleteValue: deleteValue,
        user: session.user
      })
      .then(function (response) {
        dispatch(fetchData({})).then(() => {
          toast.success('Permission (' + deleteValue.title + ') Deleted Successfully.', {
            delay: 3000,
            position: 'bottom-right'
          })
          setDeleteDialogOpen(false)
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

  // -------------------------- Edit Permission ----------------------------------------

  const handleDialogEditToggle = () => setEditDialogOpen(!editDialogOpen)

  const handleAdminEditPermission = permission => {
    setEditValue(permission)
    setOldTitle(permission.title)
    setTitle(permission.title)
    setGroup(permission.group)
    setEditDialogOpen(true)
  }

  const handleChange = event => {
    if (event.target.checked && !isCompany) {
      setIsCompany(true)
    } else {
      setIsCompany(false)
    }
  }

  const onSubmitEdit = () => {
    setLoading(true)
    let type
    if (isCompany) {
      type = 'company'
    } else {
      type = 'admin'
    }

    const data = {
      _id: editValue._id,
      title: title,
      alias: title.replace(/\s/g, ''),
      group: group,
      type: type,
      status: 'Active',
      updated_at: new Date(),
      deleted_at: null
    }

    axios
      .post('/api/permission/edit-permission', {
        data: data,
        user: session.user,
        oldTitle: oldTitle
      })
      .then(function (response) {
        dispatch(fetchData({})).then(() => {
          toast.success('Permission (' + data.title + ') Updated Successfully.', {
            delay: 2000,
            position: 'bottom-right'
          })
          setLoading(false)
          setTitle('')
        })
      })
      .catch(function (error) {
        toast.error('Error : ' + error.response.data.message + ' !', {
          delay: 2000,
          position: 'bottom-right'
        })
        setLoading(false)
      })
    setEditDialogOpen(false)
  }

  // ----------------------------  Columns -----------------------------------------

  // if (loading) return <Loading header='Please Wait' description='Permissions is loading'></Loading>

  if (session && session.user && !session.user.permissions.includes('AdminViewPermission')) {
    return <NoPermission header='No Permission' description='No permission to View permissions'></NoPermission>
  }

  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title='Permissions List' sx={{ pb: 1, '& .MuiCardHeader-title': { letterSpacing: '.1px' } }} />
            <CardContent></CardContent>
            <Divider />
            <Grid item xs={12}>
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
                <Box />
                {session && session.user && session.user.permissions.includes('AdminAddPermission') && (
                  <Button sx={{ mb: 2.5 }} variant='contained' onClick={handleDialogAddToggle}>
                    Add Permission
                  </Button>
                )}
              </Box>
{
              loading ? 
              <Loading header='Please Wait' description='Permissions is loading'></Loading>:
              <DataGrid
                autoHeight
                rows={store.data}
                columns={columns}
                pageSize={pageSize}
                disableSelectionOnClick
                rowsPerPageOptions={[10, 25, 50]}
                onPageSizeChange={newPageSize => setPageSize(newPageSize)}
                sx={{ '& .MuiDataGrid-columnHeaders': { borderRadius: 0 } }}
              />
}
            </Grid>
          </Card>
        </Grid>
      </Grid>

      {/* ---------------------------------- Edit Dialog----------------------------------------- */}

      <Dialog fullWidth maxWidth='sm' onClose={handleDialogEditToggle} open={editDialogOpen}>
        <DialogTitle sx={{ pt: 12, mx: 'auto', textAlign: 'center' }}>
          <Typography variant='h5' component='span' sx={{ mb: 2 }}>
            Edit Permission
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pb: 12, mx: 'auto' }}>
          <Box component='form' sx={{ mt: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <Select
              fullWidth
              value={group}
              id='select-group'
              label='Select Group'
              labelId='group-select'
              onChange={e => setGroup(e.target.value)}
              inputProps={{ placeholder: 'Select Group' }}
            >
              <MenuItem value='User'>User</MenuItem>
              <MenuItem value='Role'>Role</MenuItem>
              <MenuItem value='Permission'>Permission</MenuItem>
              <MenuItem value='Company'>Company</MenuItem>
              <MenuItem value='Card'>Card</MenuItem>
            </Select>

            <TextField
              fullWidth
              value={title}
              name='title'
              label='Permission Title'
              onChange={e => {
                setTitle(e.target.value)
              }}
              sx={{ mb: 1, mt: 3, maxWidth: 360 }}
              placeholder='Enter Permission Name'
            />

            <Box sx={{ mb: 2, alignItems: 'center' }}>{loading && <LinearProgress />}</Box>
            {!loading && (
              <Box className='demo-space-x' sx={{ '& > :last-child': { mr: '0 !important' } }}>
                <Button
                  size='large'
                  onClick={e => {
                    onSubmitEdit()
                  }}
                  variant='contained'
                >
                  Save Permission
                </Button>
                <Button type='reset' size='large' variant='outlined' color='secondary' onClick={handleDialogEditToggle}>
                  Discard
                </Button>
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      {/* -----------------------------------Add Dialog----------------------------------------- */}

      <Dialog fullWidth maxWidth='sm' onClose={handleDialogAddToggle} open={addDialogOpen}>
        <DialogTitle sx={{ pt: 12, mx: 'auto', textAlign: 'center' }}>
          <Typography variant='h5' component='span' sx={{ mb: 2 }}>
            Add New Permission
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pb: 12, mx: 'auto' }}>
          <Box component='form' sx={{ mt: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <Select
              fullWidth
              value={group}
              id='select-group'
              label='Select Group'
              labelId='group-select'
              onChange={e => setGroup(e.target.value)}
              inputProps={{ placeholder: 'Select Group' }}
            >
              <MenuItem value='User'>User</MenuItem>
              <MenuItem value='Role'>Role</MenuItem>
              <MenuItem value='Permission'>Permission</MenuItem>
              <MenuItem value='Company'>Company</MenuItem>
              <MenuItem value='Card'>Card</MenuItem>
            </Select>

            <TextField
              fullWidth
              value={title}
              name='title'
              label='Permission Title'
              onChange={e => {
                setTitle(e.target.value)
              }}
              sx={{ mb: 1, mt: 1, maxWidth: 360 }}
              placeholder='Enter Permission Name'
            />
            <span>Company</span>
            <Switch checked={isCompany} onChange={handleChange} value={isCompany} />

            <Box sx={{ mb: 2, alignItems: 'center' }}>{loading && <LinearProgress />}</Box>
            {!loading && (
              <Box className='demo-space-x' sx={{ '& > :last-child': { mr: '0 !important' } }}>
                <Button
                  size='large'
                  onClick={e => {
                    onSubmitAdd()
                  }}
                  variant='contained'
                >
                  Create Permission
                </Button>
                <Button type='reset' size='large' variant='outlined' color='secondary' onClick={handleDialogAddToggle}>
                  Close
                </Button>
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      {/* -------------------------------------Delete Dialog------------------------------------------------- */}
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
            Are you sure , you want to delete permission{' '}
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

export default PermissionsTable
