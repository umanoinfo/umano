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
import documentTypes, { fetchData } from 'src/store/apps/document-types'
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

const DocumentsTable = () => {
  // ** State
  const [value, setValue] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [editValue, setEditValue] = useState('')
  const [deleteValue, setDeleteValue] = useState('')
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [category, setCategory] = useState()
  const [title, setTitle] = useState()
  const [loading, setLoading] = useState(true)
  const [oldTitle, setOldTitle] = useState()
  

  const { data: session, status } = useSession()

  // ** Hooks
  const dispatch = useDispatch()

  const store = useSelector(state => state.documentTypes)
  
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
      field: 'category',
      minWidth: 140,
      headerName: 'Category',
      renderCell: ({ row }) => <Typography className={row.deleted_at ? 'line-through' : ''}>{row.category}</Typography>
    },
    {
      flex: 0.25,
      field: 'name',
      minWidth: 140,
      headerName: 'Name',
      renderCell: ({ row }) => <Typography className={row.deleted_at ? 'line-through' : ''} >{row.name}</Typography>
    },
    {
      flex: 0.15,
      minWidth: 115,
      sortable: false,
      field: 'actions',
      headerName: '',
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {session && session.user && session.user.permissions.includes('EditDocumentType') && row.company_id != 'general'  && (
            <IconButton onClick={() => handleAdminEditDocumentType(row)}>
              <Icon icon='mdi:pencil-outline' />
            </IconButton>
          )}
          {row.deleted_at && session && session.user && session.user.permissions.includes('DeleteDocumentType') &&  row.company_id != 'general' && (
            <IconButton onClick={() => handleAdminRestoreDocumentType(row)}>
              <Icon icon='mdi:replay' />
            </IconButton>
          )}
          {!row.deleted_at && session && session.user && session.user.permissions.includes('DeleteDocumentType') && row.company_id != 'general' && (
            <IconButton onClick={() => handleAdminDeleteDocumentType(row)}>
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
        position: 'bottom-right',
      })

      return
    }
    setLoading(true)
   

    const data = {
      name : title,
      category: category ,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null
    }
    
 

    axios
      .post('/api/document-types/add-document-type', {
        data: data,
        user: session.user
      })
      .then(function (response) {
        dispatch(fetchData({q: value})).then(() => {
          toast.success('Document Type (' + data.title + ') Inserted Successfully.', {
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
    setAddDialogOpen(false)
  }

  // -------------------------- Delete Permission ----------------------------------------

  const handleDialogDeleteToggle = () => setDeleteDialogOpen(!deleteDialogOpen)

  const handleAdminRestoreDocumentType  = DocumentType =>{
    setDeleteValue(DocumentType);
    setOldTitle(DocumentType.name);
    deleteDocumentType(1);
  }

  const handleAdminDeleteDocumentType = DocumentType => {
    setDeleteValue(DocumentType);
    setOldTitle(DocumentType.name);
    setDeleteDialogOpen(true);
  }

  const deleteDocumentType = (type) => {
    setLoading(true)
    axios
      .post('/api/document-types/delete-document-type', {
        id: deleteValue._id,
        user: session.user
      })
      .then(function (response) {
        dispatch(fetchData({q: value})).then(() => {
          let message = '';
          if(type == 1  )
          {
            // <div onClick={() => toast.dismiss(t.id)}>
            //       'Document Type (' + {deleteValue.name} + ') Restored Successfully.';
            // </div>

            message =  'Document Type (' + deleteValue.name + ') Restored Successfully';
          }
          else{
            message = 'Document Type (' + deleteValue.name + ') Deleted Successfully.';
          }
          toast.success(message , {
            delay: 3000,
            position: 'bottom-right',
            
          })
          setLoading(false)
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

  const handleAdminEditDocumentType = DocumentType => {
    setEditValue(DocumentType)
    setOldTitle(DocumentType.name)
    setTitle(DocumentType.name)
    setCategory(DocumentType.category)
    setEditDialogOpen(true)
  }
 
  const onSubmitEdit = () => {
    setLoading(true)
    

    const data = {
      _id: editValue._id,
      name: title,
      category: category,
      updated_at: new Date(),
      deleted_at: null
    };

    axios
      .post('/api/document-types/edit-document-type', {
        data: data,
        user: session.user,
      })
      .then(function (response) {
        dispatch(fetchData({q: value})).then(() => {
          toast.success('Document Type (' + data.title + ') Updated Successfully.', {
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

  // if (loading) return <Loading header='Please Wait' description='Documents types are loading'></Loading>
  if (session && session.user && !session.user.permissions.includes('ViewDocumentType')) {

    return <NoPermission header='No Permission' description='No permission to View Documents'></NoPermission>
  }
  
  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title='Documents Types List' sx={{ pb: 1, '& .MuiCardHeader-title': { letterSpacing: '.1px' } }} />
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
                {session && session.user && session.user.permissions.includes('AddDocumentType') && (
                  <Button sx={{ mb: 2.5 }} variant='contained' onClick={handleDialogAddToggle}>
                    Add Document Type
                  </Button>
                )}
              </Box>
{
              loading ? 
              <Loading header='Please Wait' description='Documents types are loading'></Loading>:
              
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
            Edit Document Type
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pb: 12, mx: 'auto' }}>
          <Box component='form' sx={{ mt: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <Select
              fullWidth
              value={category}
              id='select-category'
              label='Select Category'
              labelId='category-select'
              onChange={e => setCategory(e.target.value)}
              inputProps={{ placeholder: 'Select Category' }}
            >
              <MenuItem value='Third Party Contracts'>Third Party Contracts</MenuItem>
              <MenuItem value='Entity Documents'>Entity Documents</MenuItem>
              <MenuItem value='Ownership Documents'>Ownership Documents</MenuItem>
              <MenuItem value='Vendors'>Vendors</MenuItem>
   
            </Select>

            <TextField
              fullWidth
              value={title}
              name='title'
              label='Document Type Title'
              onChange={e => {
                setTitle(e.target.value)
              }}
              sx={{ mb: 1, mt: 3, maxWidth: 360 }}
              placeholder='Enter Document Type Name'
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
                  Save Document Type
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
            Add New Document Type
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pb: 12, mx: 'auto' }}>
          <Box component='form' sx={{ mt: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <Select
              fullWidth
              value={category}
              id='select-category'
              label='Select Category'
              labelId='category-select'
              onChange={e => setCategory(e.target.value)}
              inputProps={{ placeholder: 'Select Category' }}
            >
              <MenuItem value='Third Party Contracts'>Third Party Contracts</MenuItem>
              <MenuItem value='Entity Documents'>Entity Documents</MenuItem>
              <MenuItem value='Ownership Documents'>Ownership Documents</MenuItem>
              <MenuItem value='Vendors'>Vendors</MenuItem>
            </Select>

            <TextField
              fullWidth
              value={title}
              name='title'
              label='Document Type Title'

              onChange={e => {
                setTitle(e.target.value)
              }}
              sx={{ mb: 1, mt: 1, maxWidth: 360 }}
              placeholder='Enter Document Type Name'
            />
         
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
                  Create Document
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
            // handleClose()s
          }
        }}
      >
        <DialogTitle id='alert-dialog-title text'>Warning</DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>
            Are you sure , you want to delete document{' '}
            <span className='bold'>{deleteValue && deleteValue.title}</span>
          </DialogContentText>
        </DialogContent>
        <DialogActions className='dialog-actions-dense'>
          <Button onClick={()=>deleteDocumentType(0)}>Yes</Button>
          <Button onClick={handleDialogDeleteToggle}>No</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default DocumentsTable
