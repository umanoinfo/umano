// ** React Imports
import { useState, useEffect, useCallback } from 'react'

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
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import en from 'date-fns/locale/en-US'; 

import { DatePicker } from '@mui/x-date-pickers'
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
import { fetchData } from 'src/store/apps/cme'

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

const CMEList = () => {
  // ** State
  const [ShiftType, setShiftType] = useState()
  const [shiftStatus, setShiftStatus] = useState('')
  const [value, setValue] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedShift, setSelectedShift] = useState()
  const [requiredCME , setRequiredCME ] = useState([]) ;
  const [CMETypes , setCMETypes ] = useState() ;
  const { data: session, status } = useSession()
  const [startDate , setStartDate ] = useState() ; 
  const [endDate , setEndDate] = useState() ; 
  
  // ** Hooks

  const dispatch = useDispatch()
  const store = useSelector(state => state.cme)
  const router = useRouter()

  useEffect(() => {
    setLoading(true);
    dispatch(
      fetchData({
        q: value,
        from_date: startDate,
        to_date: endDate
      })
    ).then( () => setLoading(false))
  }, [dispatch, value , startDate , endDate])

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new()
    let ex = [...store.data]

    ex = ex.map(val => {
      let required = 0 ;
      CMETypes?.map((type)=> {
        if(type == val.type){
          required = requiredCME.get(type);
        }
      });

      
      let c = {
        'Employee Name': val.employee,
        'Amount': val.amount ,
        'Completed' :( val.amount >= required ? "YES" : "NO"),
        'Percentage': (val.amount / required) * 100
      };
      
      return c
    })

    const ws = XLSX.utils.json_to_sheet(ex)
    XLSX.utils.book_append_sheet(wb, ws, 'CME')
    XLSX.writeFile(wb, 'CME.xlsx')
  }


  const handleStartDateChange = useCallback( (e)=>{
    setStartDate(e) ; 
  },[])

  const handleEndDateChange = useCallback( (e)=>{
    setEndDate(e) ; 
  },[])

  const getRequiredCME =  async ()=>{
      setLoading(true);
      try{
        const res = await axios.get('/api/cme/required' ); 
        const data = res.data.data ;
        let required = new Map() ;
        let types = [ ] ; 
        data.map((val)=>{
          required.set(val.type , val.amount) ;
          types.push(val.type) ;
        })
        setCMETypes(types) ;
        setRequiredCME(required);
      }
      catch(err){
        toast.error(err.toString() , {duraiton: 5000 , position:'bottom-right'})  ;
      }
      setLoading(false);
  }

  useEffect(()=>{
    getRequiredCME()
  },[])

  // ----------------------- Handle ------------------------------

  const handleClose = () => {
    setOpen(false)
  }

  const handleFilter = useCallback(val => {
    setValue(val)
  }, [])

  const handleStatusChange = useCallback(e => {
    setShiftStatus(e.target.value)
  }, [])

  const handleTypeChange = useCallback(e => {
    setShiftType(e.target.value)
  }, [])

  
  
  // -------------------------- Add Document -----------------------------------------------

  const addShift = () => {
    router.push('/company-dashboard/attendance/shift/add-shift')
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

    const handleRowView = () => {
      router.push('/company-dashboard/cme/' + row._id )
      handleRowOptionsClose()
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
          {session && session.user && session.user.permissions.includes('ViewCME') && (
            <MenuItem onClick={()=>handleRowView()} sx={{ '& svg': { mr: 2 } }}>
              <Icon icon='mdi:eye-outline' fontSize={20} />
              View
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
      flex: 0.17,
      minWidth: 100,
      field: 'idNo',
      headerName: 'Id NO',
      renderCell: ({ row , index }) => {
        return (
          <Typography key = {index} variant='subtitle1' noWrap sx={{ textTransform: 'capitalize' }}>
            {row.idNo}
          </Typography>
        )
      }
    },
    {
      flex: 0.17,
      minWidth: 100,
      field: 'employee',
      headerName: 'Employee',
      renderCell: ({ row , index }) => {
        return (
          <Typography key = {index} variant='subtitle1' noWrap sx={{ textTransform: 'capitalize' }}>
            {row.employee}
          </Typography>
        )
      }
    },
    {
      flex: 0.17,
      minWidth: 100,
      field: 'amount',
      headerName: 'Amount',
      renderCell: ({ row , index }) => {
        return (
          <Typography key = {index} variant='subtitle1' noWrap sx={{ textTransform: 'capitalize' }}>
              {row.amount} / { CMETypes?.map((type)=> type == row.type ? <> {requiredCME.get(type)} </> : <></>)}
          </Typography>
        )
      }
    },
    ,
    {
      flex: 0.17,
      minWidth: 100,
      field: 'percentage',
      headerName: 'Percentage',
      renderCell: ({ row , index }) => {
        let required = 0 ; 
        CMETypes?.map((type)=> {
          if(type == row.type){
            required = requiredCME.get(type);
          }
        })
        
      return (
          <Typography key = {index} variant='subtitle1' noWrap sx={{ textTransform: 'capitalize' }}>
              {required != 0 ?(row.amount / required) * 100 : <></> } %
          </Typography>
        )
      }
    },
    {
      flex: 0.17,
      minWidth: 100,
      field: 'completed',
      headerName: 'Completed',
      renderCell: ({ row , index }) => {
        return (
          <Typography key = {index} variant='subtitle1' noWrap sx={{ textTransform: 'capitalize' }}>
              { CMETypes?.map((type)=> type == row.type ? <> {(row.amount >= requiredCME.get(type) ? "YES" : "NO") } </> : <></>)}
          </Typography>
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

  // if (loading) return <Loading header='Please Wait' description='CMEs are loading'></Loading>

  if (session && session.user && !session.user.permissions.includes('ViewCME'))
    return <NoPermission header='No Permission' description='No permission to view forms'></NoPermission>

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <Breadcrumbs aria-label='breadcrumb' sx={{ pb: 0, p: 3 }}>
            <Link underline='hover' color='inherit' href='/'>
              Home
            </Link>
            <Typography color='text.primary' sx={{ fontSize: 18, fontWeight: '500' }}>
              CME Records List
            </Typography>
          </Breadcrumbs>
          <Divider />
          <Grid container spacing={6} sx={{ px: 5, pt: 3 }}>
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
              <Grid item sm={3} xs={12}>
                               
                 <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={en} >
                    <DatePicker
                      label="Start Date"
                      value={startDate}
                      onChange={handleStartDateChange}
                      slotProps={{ textField: { size: 'small' } }} 

                      // defaultValue={}
                    />
                  </LocalizationProvider>
            </Grid>
               <Grid item sm={3} xs={12}>
                                 
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={en} >
                    <DatePicker
                      label="End Date"
                      value={endDate}
                      onChange={handleEndDateChange}
                      slotProps={{ textField: { size: 'small' } }} 
                    />
                  </LocalizationProvider>
                    
            </Grid>
    
            <Grid item sm={3} xs={12} textAlign={right}>

              <Button
                sx={{ mr: 4, mb: 2 }}
                color='secondary'
                variant='outlined'
                startIcon={<Icon icon='mdi:export-variant' fontSize={20} />}
                onClick={exportToExcel}
              >
                Export
              </Button>
              {session && session.user && session.user.permissions.includes('AddCME') && (
                <Button type='button' variant='contained' sx={{ mb: 3 }} onClick={()=> {router.push('/company-dashboard/cme/add-cme')}}>
                  Add Hour/s
                </Button>
              )}
            </Grid>
          </Grid>

          <Divider />

          {/* -------------------------- Table -------------------------------------- */}
{          
          loading ? 
          <Loading header='Please Wait' description='CMEs are loading'></Loading>
          :
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

}        </Card>
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
            Are you sure , you want to delete CME <span className='bold'>{selectedShift && selectedShift.title}</span>
          </DialogContentText>
        </DialogContent>
        <DialogActions className='dialog-actions-dense'>
           <Button onClick={handleClose}>No</Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default CMEList
