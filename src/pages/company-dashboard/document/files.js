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

// ** Actions Imports
import { fetchData } from 'src/store/apps/file'

// ** Third Party Components
import axios from 'axios'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import NoPermission from 'src/views/noPermission'
import { right } from '@popperjs/core'
import { Breadcrumbs } from '@mui/material'

// ** Status Obj

const StatusColor = deleted_at => {
  if(deleted_at){
    return 'error'
  }
  if(!deleted_at){
    return 'success'
  }
}

const StatusLabel = deleted_at => {
  if(deleted_at){
    return 'Canceled'
  }
  if(!deleted_at){
    return 'Active'
  }
}



const AllDocumentsList = () => {
  // ** State
  const [Types, setTypes] = useState([])
  const [fileStatus, setFileStatus] = useState('')
  const [fileTypes, setFileTypes] = useState('')
  const [value, setValue] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedDocument, setselectedDocument] = useState()
  const { data: session, status } = useSession()
  const [AllDocumentTypes , setAllDocumentTypes] = useState() ; 
  const [documentTypeCategory , setDocumentTypeCategory ] = useState();

  // ** Hooks

  const dispatch = useDispatch()
  const store = useSelector(state => state.file)
  const router = useRouter()

  const getDocumentTypes = async () =>{
    setLoading(true);
    try{
        const res = await axios.get('/api/document-types');
        if(res.status == 200 ){
            let map = new Map() ;

            let documents = res?.data?.data?.map((document)=>{
                map[document.name] = document.category ;
                
                return document.name ;
            })
            setDocumentTypeCategory(map);
            setAllDocumentTypes(documents.toString());
            setLoading(false);
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
        fileTypes,
        fileStatus,
        q: value
      })
    ).then( () => setLoading(false))
    getDocumentTypes();

  }, [ fileTypes , fileStatus, value])

  // ----------------------- Handle ------------------------------

  const handleClose = () => {
    setOpen(false)
  }

  const handleFilter = useCallback(val => {
    setValue(val)
  }, [])


    // -------------------------- open_file ---------------------------------

    const open_file = fileName => {
      window.open('https://umanu.blink-techno.com/' + fileName, '_blank')
    }


  // -------------------------- Delete Document --------------------------------

  const deleteDocument = () => {
    setLoading(true);
    axios
      .post('/api/document/delete-document', {
        selectedDocument
      })
      .then(function (response) {
        dispatch(fetchData({
          fileTypes,
          fileStatus,
          q: value
        })).then(() => {
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

   
  }

  const handleClick = (data) => {
    router.push(`/company-dashboard/document/category/${documentTypeCategory[data]}/${data}`);
  }


  // ------------------------------- Table columns --------------------------------------------

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
      flex: 0.17,
      minWidth: 100,
      field: 'title',
      headerName: 'Title',
      renderCell: ({ row }) => {
        return (
          <Typography variant='subtitle1' noWrap sx={{ textTransform: 'capitalize' }}>
              <a href='#' onClick={e => open_file(row.url)}>
                {row.name}
              </a>
          </Typography>
        )
      }
    },
    {
      flex: 0.15,
      field: 'document',
      minWidth: 100,
      headerName: 'Document',
      renderCell: ({ row }) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', height: 250 }}>
            <Icon fontSize={20} />
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              { row.document_info[0] && row.document_info[0].title}
            </div>
          </Box>
        )
      }
    },
    {
      flex: 0.15,
      field: 'exiryDate',
      minWidth: 100,
      headerName: 'Expiry Date',
      renderCell: ({ row }) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', height: 250 }}>
            <Icon fontSize={20} />
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              { row.document_info[0] && row?.document_info?.[0]?.expiryDate?.substring(0,10)}
            </div>
          </Box>
        )
      }
    },
    {
      flex: 0.35,
      field: 'type',
      minWidth: 100,
      headerName: 'Tags',
      sortable:false,
      renderCell: ({ row }) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', height: 250 }}>
            <Icon fontSize={20} />
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {row.document_info[0] && row.document_info[0].type.map((t, index) => {
                if(index > 0 ) 
                  return <></>;
                
                return (
                  <CustomChip
                    key={index}
                    color='primary'
                    skin='light'
                    size='small'
                    onClick={()=>handleClick(t)}
                    sx={{ mx: 0.5, mt: 0.5, mb: 0.5 }}
                    label={t}
                  />
                )
              })}
              {
                row.document_info[0] && row.document_info[0].type?.length -1 > 0 ?
                <CustomChip                    
                    key={1}
                    color='primary'
                    skin='light'
                    size='small'
                    sx={{ mx: 0.5, mt: 0.5, mb: 0.5 }}
                    label={`+${row.document_info[0].type?.length -1 } more categories`}
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
      minWidth: 120,
      field: 'expiryDate',
      headerName: 'Date',
      renderCell: ({ row }) => {
        return (
         <>
         { row.document_info[0] && new Date(row.document_info[0].created_at).toLocaleString()}
         </>
        )
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
            label={StatusLabel(row.deleted_at)}
            color={StatusColor(row.deleted_at)}
            sx={{ textTransform: 'capitalize', '& .MuiChip-label': { lineHeight: '18px' } }}
          />
        )
      }
    }
  ]

  // ------------------------------------ View ---------------------------------------------

  // if (loading) return <Loading header='Please Wait' description='Documents is loading'></Loading>

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
              All Files List
            </Typography>
          </Breadcrumbs>
          <Grid container spacing={6} sx={{ px: 5, pt: 3 }}>

            <Grid item sm={3} xs={12}>
              <FormControl fullWidth size='small'>
                <TextField
                  size='small'
                  label='Search'
                  value={value}
                  sx={{ mr: 6, mb: 2 }}
                  placeholder='Search File'
                  onChange={e => handleFilter(e.target.value)}
                />
              </FormControl>
            </Grid>
            <Grid item sm={2} xs={6}></Grid>
            <Grid item sm={5} xs={12} textAlign={right}>
            </Grid>
          </Grid>

          <Divider />

          {/* -------------------------- Table -------------------------------------- */}
{          
          loading ?
            <Loading header='Please Wait' description='Documents is loading'></Loading>:

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
