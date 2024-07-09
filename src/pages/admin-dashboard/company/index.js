// ** React Imports
import { useState, useEffect, useCallback, forwardRef, useRef } from 'react'

// ** Next Imports
import Link from 'next/link'

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
import { fetchData } from 'src/store/apps/company'

// ** Third Party Components
import axios from 'axios'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Controller } from 'react-hook-form'

import { useSession } from 'next-auth/react'
import { companiesTypes } from 'src/local-db'
import { useRouter } from 'next/router'
import NoPermission from 'src/views/noPermission'
import { t } from 'i18next'

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

const CompaniesList = () => {
  // ** State
  const [type, setType] = useState('')
  const [plan, setPlan] = useState('')
  const [companyStatus, setCompanyStatus] = useState('')
  const [value, setValue] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [addUserOpen, setAddUserOpen] = useState(false)
  const [open, setOpen] = useState(false)
  const [openVisit , setOpenVisit] =useState(false)
  const [loading, setLoading] = useState(true)
  const [searchValue , setSearchValue]= useState('');
  const [selectedCompany, setSelectedCompany] = useState()

  const [editUserOpen, setEditUserOpen] = useState(false)
  const { data: session, status } = useSession()
  const [show, setShow] = useState(false)

  // ** Hooks

  const dispatch = useDispatch()

  const store = useSelector(state => state.company)
  console.log(store);
  const router = useRouter()

  const handleExcelExport = () => {
    const wb = XLSX.utils.book_new()
    let ex = [...store.data]

    ex = ex.map(val => {
      let c = { 
        'Name': val.name,
        'Type': val.type ,
        'Manager name': val?.user_info?.[0]?.name ,  
        'Manager email': val?.user_info?.[0]?.email ,
        'End subscription': val.end_at ,
        'Status': val.status , 
        'Deleted' : val.deleted_at ? true : false
      };

      // delete c['user_id']
      // delete c['subscriptions_info']
      // delete c['created_at']
      // delete c['country_id']
      // delete c['updated_at']
      // delete c['_id']
      // delete c['logo']
      // delete c['country_info']

      // c['manager name'] = c.cuser_info.map(v => {
      //   return v.name
      // })
      // c['manager name'] = c['manager name'].toString()

      // delete c['user_info']
      

      return c
    })

    const ws = XLSX.utils.json_to_sheet(ex)
    XLSX.utils.book_append_sheet(wb, ws, 'Comments')
    XLSX.writeFile(wb, 'companies.xlsx')
  }

  useEffect(() => {
   
    setLoading(true);
    dispatch(
       fetchData({
        type,
        companyStatus,
        q: searchValue
      })
    ).then(()=>setLoading(false) )

  }, [dispatch, type, companyStatus, searchValue])

  // ----------------------- Handle ------------------------------

  const handleClose = () => {
    setOpen(false)
    setOpenVisit(false)
  }

  const handleFilter = useCallback(val => {
    setValue(val)
  }, [])

  const handleTypeChange = useCallback(e => {
    setType(e.target.value)
  }, [])

  const handleStatusChange = useCallback(e => {
    setCompanyStatus(e.target.value)
  }, [])

  const addCompany = () => {
    router.push('/admin-dashboard/company/add-company')
  }

  // -------------------------- Delete --------------------------------

  const deleteCompany = () => {
    setLoading(true);
    axios
      .post('/api/company/delete-company', {
        selectedCompany
      })
      .then(function (response) {
        dispatch(fetchData({})).then(() => {
          toast.success('User (' + selectedCompany.name + ') Deleted Successfully.', {
            delay: 1000,
            position: 'bottom-right'
          })
          setOpen(false);
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


    // -------------------------- Visit --------------------------------

    const visitCompany = () => {
      setLoading(true) ;
      axios
        .post('/api/user/change-company', {
          selectedCompany,
          visit: true
        })
        .then(function (response) {
          dispatch(fetchData({})).then(() => {
            toast.success('User (' + selectedCompany.name + ') Changed Successfully.', {
              delay: 3000,
              position: 'bottom-right'
            })
            setLoading(false) ;
            setOpenVisit(false)
            location.reload();
          })
        })
        .catch(function (error) {
          setOpenVisit(false)
          toast.error('Error : ' + error.response.data.message + ' !', {
            delay: 1000,
            position: 'bottom-right'
          })
          setLoading(false)
        })
    }

  // -------------------------------------------------------------------------

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

    const handleRestoreRowOptions = async ()=> {
      setLoading(true) ;

      try{
        let res = await axios.post('/api/company/restore-company' , {
          id: row._id
        });
        
        if(res.status == 200 ) {         
          toast.success('Company restored successfully' , {position:'bottom-right' , duration:5000 });
        }
        else{
          throw new Error(res.message) ;
        }
        dispatch(fetchData({})).then(()=> setLoading(false));

      }
      catch(err){
        toast.error(err.toString() , {duration:5000 , position:'bottom-right'} );
      }

      setLoading(false) ;
    }

    const handleEditRowOptions = () => {
      router.push('/admin-dashboard/company/' + row._id + '/edit-company')
      handleRowOptionsClose()
    }

    const handleRowView = () => {
      router.push('/admin-dashboard/company/' + row._id + '/view/subscriptions')
      handleRowOptionsClose()
    }

    const handleDelete = () => {
      setSelectedCompany(row)
      setOpen(true)
    }

    const handleVisit = () => {
      setSelectedCompany(row)
      setOpenVisit(true)
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
          {session && session.user && session.user.permissions.includes('AdminViewCompany') && (
            <MenuItem onClick={handleRowView} sx={{ '& svg': { mr: 2 } }}>
              <Icon icon='mdi:eye-outline' fontSize={20} />
              View
            </MenuItem>
          )}
            {session && session.user && session.user.permissions.includes('AdminVisitCompany') && (
            <MenuItem onClick={handleVisit} sx={{ '& svg': { mr: 2 } }}>
              <Icon icon='material-symbols:beach-access-outline' fontSize={20} />
              Visit
            </MenuItem>
          )}
          
            
            {
              row.deleted_at && session && session.user && session.user.permissions.includes('AdminEditCompany') && (
              <MenuItem onClick={handleRestoreRowOptions} sx={{ '& svg': { mr: 2 } }}>
                <Icon icon='mdi:replay' fontSize={20} />
                Restore
              </MenuItem>
            )}
            
            {!row.deleted_at && session && session.user && session.user.permissions.includes('AdminEditCompany') && (
              <MenuItem onClick={handleEditRowOptions} sx={{ '& svg': { mr: 2 } }}>
                <Icon icon='mdi:pencil-outline' fontSize={20} />
                Edit
              </MenuItem>
            
            )}
          
          
          {!row.deleted_at && session && session.user && session.user.permissions.includes('AdminDeleteCompany') && (
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
      flex: 0.05,
      minWidth: 100,
      field: 'index',
      headerName: '#',
      renderCell: ({ row }) => {
        return (
          <Typography   variant='subtitle1' noWrap sx={{ textTransform: 'capitalize' }} className={row?.deleted_at  ? 'line-through' : ''}>
            {row.index}
          </Typography>
        )
      }
    },
    {
      flex: 0.12,
      minWidth: 100,
      field: 'name',
      headerName: 'Company',
      renderCell: ({ row }) => {
        return (
          <Typography  noWrap sx={{ textTransform: 'capitalize' }} className={row?.deleted_at  ? 'line-through' : ''} >
            {row.name}
          </Typography>
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
          <Box sx={{ display: 'flex', alignItems: 'center' }} className={row?.deleted_at  ? 'line-through' : ''} >
            <Icon fontSize={20} />
              {row.type == 'healthCenter' ? 'Health Center' : 'Clinic'}
          </Box>
        )
      }
    },
    {
      flex: 0.11,
      minWidth: 120,
      field: 'manager',
      headerName: 'Manager',
      renderCell: ({ row }) => {
        const { user_info } = row

        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }} className={row?.deleted_at  ? 'line-through' : ''}>
            {row.user_info[0] && (
              <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
                <Typography noWrap sx={{ color: 'text.primary', textTransform: 'capitalize' }}>
                  {row.user_info[0] && row.user_info[0].name}
                </Typography>
                <Typography noWrap variant='caption'>
                  {row.user_info[0] && row.user_info[0].email}
                </Typography>
              </Box>
            )}
          </Box>
        )
      }
    },
    {
      flex: 0.11,
      minWidth: 200,
      field: 'end_at',
      headerName: 'End Subscription',
      renderCell: ({ row }) => {
        return (
          <div className={row?.deleted_at  ? 'line-through' : ''}>
            {row.end_at}
            <CustomChip
              skin='light'
              size='small'
              label={
                Math.floor((new Date(row.end_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24), 1) + ' Day'
              }
              color={dayColor(
                Math.floor((new Date(row.end_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24), 1)
              )}
              sx={{ textTransform: 'capitalize', '& .MuiChip-label': { lineHeight: '18px' }, ml: 3 }}
            />
          </div>
        )
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
            color={StatusObj[row.status]}
            className={row?.deleted_at  ? 'line-through' : ''}
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
      renderCell: ({ row }) => {
        return <RowOptions row={row}/>

      }
    }
  ]

  // ------------------------------ View ---------------------------------

  if (loading) return <Loading header='Please Wait' description='Companies are loading'></Loading>

  if (session && session.user && !session.user.permissions.includes('AdminViewCompany'))
    return <NoPermission header='No Permission' description='No permission to view companies'></NoPermission>

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Companies List' sx={{ pb: 1, '& .MuiCardHeader-title': { letterSpacing: '.1px' } }} />
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
                    {companiesTypes.map((type, index) => {
                      return (
                        <MenuItem key={index} value={type.value}>
                          {type.title}
                        </MenuItem>
                      )
                    })}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item sm={4} xs={12}>
                <FormControl fullWidth size='small'>
                  <InputLabel id='status-select'>Select Status</InputLabel>
                  <Select
                    fullWidth
                    value={companyStatus}
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
          {/* ------------------------- Table Header --------------------------------  */}
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
                placeholder='Search Company'
                onChange={e => handleFilter(e.target.value)}
                
              />
              <Button sx={{ mb:3 }} style={{marginRight:'10px'}} type='button' onClick={()=> setSearchValue(value)} >
                Search
              </Button>

              {session && session.user && session.user.permissions.includes('AdminAddCompany') && (
                <Button type='button' variant='contained' sx={{ mb: 3 }} onClick={() => addCompany()}>
                  Add Company
                </Button>
              )}
            </Box>
          </Box>
          {/* -------------------------- Table -------------------------------------- */}

          {!loading && store.data && <DataGrid
            rowHeight={40}
            autoHeight
            rows={store.data}
            columns={columns}
            pageSize={pageSize}
            disableSelectionOnClick
            rowsPerPageOptions={[10, 25, 50]}
            sx={{ '& .MuiDataGrid-columnHeaders': { borderRadius: 0 } }}
            onPageSizeChange={newPageSize => setPageSize(newPageSize)}
          />}

          {loading && <span style={{paddingLeft: '10px' , fontStyle:'italic'}}> Please Wait .... </span>}

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
            Are you sure , you want to delete company{' '}
            <span className='bold'>{selectedCompany && selectedCompany.name}</span>
          </DialogContentText>
        </DialogContent>
        <DialogActions className='dialog-actions-dense'>
          <Button onClick={deleteCompany}>Yes</Button>
          <Button onClick={handleClose}>No</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openVisit}
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
            Are you sure , you want to visit company{' '}
            <span className='bold'>{selectedCompany && selectedCompany.name}</span>
          </DialogContentText>
        </DialogContent>
        <DialogActions className='dialog-actions-dense'>
          <Button onClick={visitCompany}>Yes</Button>
          <Button onClick={handleClose}>No</Button>
        </DialogActions>
      </Dialog>

    </Grid>
  )
}

export default CompaniesList