// ** React Imports
import { useState, useEffect, useCallback } from 'react'

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
import { fetchData } from 'src/store/apps/document'

// ** Third Party Components
import axios from 'axios'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import NoPermission from 'src/views/noPermission'
import { right } from '@popperjs/core'
import { Breadcrumbs } from '@mui/material'

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
  const [type, setType] = useState([])
  const [documentStatus, setdocumentStatus] = useState('')
  const [value, setValue] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedDocument, setselectedDocument] = useState()
  const [AllDocumentTypes , setAllDocumentTypes ] = useState();
  const [documentTypesFetched , setDocumentTypesFetched ] = useState(false) ;
  const { data: session, status } = useSession()

  // ** Hooks

  const dispatch = useDispatch()
  const store = useSelector(state => state.document)
  const router = useRouter()

  const documentTypes = router.query.type ;
  const category = router.query.category  ;

  const getDocumentTypes = async () =>{
    setLoading(true);
    try{
        const res = await axios.get('/api/document-types');
        if(res.status == 200 ){
            const documents = new Map() ;
            res?.data?.data?.map((document)=>{
                documents[document.name] = document.category ; 
            })
            setAllDocumentTypes(documents);
            setLoading(false);
            setDocumentTypesFetched(true);
        }

    }catch(err){
        toast.error('Failed to fetch documents types' , {duration:5000 , position:'bottom-right' });

        setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    dispatch(
      fetchData({
        documentTypes: documentTypes,
        documentStatus,
        q: value
      })
    ).then( () =>  getDocumentTypes() )
   
  }, [dispatch, type, documentStatus, value , documentTypes])

  // ----------------------- Handle ------------------------------

  const handleClose = () => {
    setOpen(false)
  }

  const handleFilter = useCallback(val => {
    setValue(val)
  }, [])

  const handleStatusChange = useCallback(e => {
    setdocumentStatus(e.target.value)
  }, [])

  const handleClick = (data) => {
    
    if(documentTypesFetched)
      router.push(`/company-dashboard/document/category/${AllDocumentTypes[data]}/${data}`);
    
  }

  // -------------------------- Delete Document --------------------------------

  const deleteDocument = () => {
    setLoading(true);
    axios
      .post('/api/document/delete-document', {
        selectedDocument
      })
      .then(function (response) {
        dispatch(fetchData({})).then(() => {
          toast.success('Document (' + selectedDocument.name + ') Deleted Successfully.', {
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

  // -------------------------- Add Document -----------------------------------------------

  const addDocument = () => {
    router.push('/company-dashboard/document/add-document')
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
      router.push('/company-dashboard/document/' + row._id + '/edit-document')
      handleRowOptionsClose()
    }

    const handleRowView = () => {
      router.push('/company-dashboard/document/' + row._id)
      handleRowOptionsClose()
    }

    const handleDelete = () => {
      setselectedDocument(row)
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
          {session && session.user && session.user.permissions.includes('ViewDocument') && (
            <MenuItem onClick={handleRowView} sx={{ '& svg': { mr: 2 } }}>
              <Icon icon='mdi:eye-outline' fontSize={20} />
              View
            </MenuItem>
          )}
          {session && session.user && session.user.permissions.includes('EditDocument') && (
            <MenuItem onClick={handleEditRowOptions} sx={{ '& svg': { mr: 2 } }}>
              <Icon icon='mdi:pencil-outline' fontSize={20} />
              Edit
            </MenuItem>
          )}
          {session && session.user && session.user.permissions.includes('DeleteDocument') && (
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

  const columns = [
    {
      flex: 0.02,
      minWidth: 40,
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
      flex: 0.17,
      minWidth: 200,
      field: 'title',
      headerName: 'Title',
      renderCell: ({ row }) => {
        return (
          <Typography variant='subtitle1' noWrap sx={{ textTransform: 'capitalize' }}>
             <Link href={{ pathname: '/company-dashboard/document/'+row._id }}>{row.title}</Link>
          </Typography>
        )
      }
    },
    {
      flex: 0.07,
      field: 'version',
      minWidth: 100,
      headerName: 'Version',
      renderCell: ({ row }) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Icon fontSize={20} />
            {row.version}
          </Box>
        )
      }
    },
    {
      flex: 0.25,
      field: 'type',
      minWidth: 400,
      sortable:false,
      headerName: 'Tags',
      renderCell: ({ row }) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', height: 250 }}>
            <Icon fontSize={20} />
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {row.type.map((t, index) => {
                if(index > 0 )
                  return <></>;

                return (
                  <CustomChip
                    onClick={() =>handleClick(t) }
                    key={index}
                    color='primary'
                    skin='light'
                    size='small'
                    sx={{ mx: 0.5, mt: 0.5, mb: 0.5 }}
                    label={t}
                  />
                )
              })}
              {
                row.type?.length -1 > 0?
                <CustomChip                    
                      key={1}
                      color='primary'
                      skin='light'
                      size='small'
                      sx={{ mx: 0.5, mt: 0.5, mb: 0.5 }}
                      label={`+${row.type?.length -1 } more categories`}
                    />
                :
                <></>
              }
            </div>
          </Box>
        )
      }
    },
    {
      flex: 0.11,
      minWidth: 180,
      field: 'expiryDate',
      headerName: 'Expiry date',
      renderCell: ({ row }) => {
        return (
          <>
            {row.expiryDateFlag && <span>-</span>}
            {!row.expiryDateFlag && new Date(row.expiryDate).toLocaleDateString() }
            {!row.expiryDateFlag && (
              <CustomChip
                skin='light'
                size='small'
                label={
                  Math.floor((new Date(row.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24), 1) +
                  ' Day'
                }
                color={dayColor(
                  Math.floor((new Date(row.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24), 1)
                )}
                sx={{ textTransform: 'capitalize', '& .MuiChip-label': { lineHeight: '18px' }, ml: 3 }}
              />
            )}
          </>
        )
      }
    },
    {
      flex: 0.07,
      minWidth: 100,
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

  // if (loading) return <Loading header='Please Wait' description='Documents are loading'></Loading>

  if (session && session.user && !session.user.permissions.includes('ViewDocument'))
    return <NoPermission header='No Permission' description='No permission to view documents'></NoPermission>

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <Breadcrumbs aria-label='breadcrumb' sx={{ pb: 0, p: 3 }}>
            <Link underline='hover' color='inherit' href='/'>
              Home
            </Link>
            <Typography color='text.primary' sx={{ fontSize: 18, fontWeight: '500' }}>
              {category.updated_at}
            </Typography>
            <Typography color='text.primary' sx={{ fontSize: 18, fontWeight: '500' }}>
              {documentTypes} Documents List
            </Typography>
          </Breadcrumbs>
          <Divider />
          <Grid container spacing={6} sx={{ px: 5, pt: 3 }}>
            <Grid item sm={2} xs={6}>
              <FormControl fullWidth size='small'>
                <InputLabel id='status-select'>Select Status</InputLabel>
                <Select
                  fullWidth
                  value={documentStatus}
                  id='select-status'
                  label='Select Status'
                  labelId='status-select'
                  onChange={handleStatusChange}
                  inputProps={{ placeholder: 'Select Status' }}
                >
                  <MenuItem value=''>All Status</MenuItem>
                  <MenuItem value='active'>Active</MenuItem>
                  <MenuItem value='pending'>Pending</MenuItem>
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
                  placeholder='Search Document'
                  onChange={e => handleFilter(e.target.value)}
                />
              </FormControl>
            </Grid>
            <Grid item sm={2} xs={6}></Grid>
            <Grid item sm={5} xs={12} textAlign={right}>
              <Button
                sx={{ mr: 4, mb: 2 }}
                color='secondary'
                variant='outlined'
                startIcon={<Icon icon='mdi:export-variant' fontSize={20} />}
              >
                Export
              </Button>
              {session && session.user && session.user.permissions.includes('AddDocument') && (
                <Button type='button' variant='contained' sx={{ mb: 3 }} onClick={() => addDocument()}>
                  Add Document
                </Button>
              )}
            </Grid>
          </Grid>

          <Divider />

          {/* -------------------------- Table -------------------------------------- */}
{
          loading ?
          <Loading header='Please Wait' description='Documents are loading'></Loading>:
          <DataGrid
            autoHeight
            rowHeight={85}
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
            Are you sure , you want to delete document{' '}
            <span className='bold'>{selectedDocument && selectedDocument.title}</span>
          </DialogContentText>
        </DialogContent>
        <DialogActions className='dialog-actions-dense'>
          <Button onClick={deleteDocument}>Yes</Button>
          <Button onClick={handleClose}>No</Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default AllDocumentsList
