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
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
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
import { fetchData } from 'src/store/apps/compensation'
import { CompensationsType } from 'src/local-db'

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

const CompensationsList = () => {
  // ** State
  const [compensationType, setCompensationType] = useState()
  const [compensationStatus, setcompensationStatus] = useState('')
  const [value, setValue] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedCompensation, setselectedCompensation] = useState()
  const { data: session, status } = useSession()

  // ** Hooks

  const dispatch = useDispatch()
  const store = useSelector(state => state.compensation)
  const router = useRouter()

  useEffect(() => {
    setLoading(true);
    dispatch(
      fetchData({
        compensationType,
        compensationStatus,
        q: value
      })
    ).then(() => setLoading(false))
  }, [dispatch, compensationType, compensationStatus, value])

  // ----------------------- Handle ------------------------------

  const handleClose = () => {
    setOpen(false)
  }

  const handleExcelExport = () => {
    const wb = XLSX.utils.book_new()
    let ex = [...store.data]

    ex = ex.map(val => {
      let c = { ...val }
      delete c['company_id']
      delete c['country_info']
      delete c['firstName']
      delete c['lastName']
      delete c['updated_at']
      delete c['sourceOfHire']
      delete c['logo']
      delete c['_id']

      delete c['positions_info']

      return c
    })
    console.log(ex)
    const ws = XLSX.utils.json_to_sheet(ex)
    XLSX.utils.book_append_sheet(wb, ws, 'Comments')
    XLSX.writeFile(wb, 'allowances.xlsx')
  }

  const handleFilter = useCallback(val => {
    setValue(val)
  }, [])

  const handleStatusChange = useCallback(e => {
    setcompensationStatus(e.target.value)
  }, [])

  const handleTypeChange = useCallback(e => {
    setCompensationType(e.target.value)
  }, [])

  // -------------------------- Delete Form --------------------------------

  const deleteCompensation = () => {
    setLoading(true);
    axios
      .post('/api/compensation/delete-compensation', {
        selectedCompensation
      })
      .then(function (response) {
        dispatch(fetchData({})).then(() => {
          toast.success('salary Allowance (' + selectedCompensation.title + ') Deleted Successfully.', {
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

  const addCompensation = () => {
    router.push('/company-dashboard/payroll/compensation/add-compensation')
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
      router.push('/company-dashboard/payroll/compensation/' + row._id)
      handleRowOptionsClose()
    }

    // const handleRowView = () => {
    //   router.push('/company-dashboard/payroll/formula' + row._id)
    //   handleRowOptionsClose()
    // }

    const handleDelete = () => {
      setselectedCompensation(row)
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

          {session && session.user && session.user.permissions.includes('EditPayrollAllowance') && (
            <MenuItem onClick={handleEditRowOptions} sx={{ '& svg': { mr: 2 } }}>
              <Icon icon='mdi:pencil-outline' fontSize={20} />
              Edit
            </MenuItem>
          )}
          {session && session.user && session.user.permissions.includes('DeletePayrollAllowance') && (
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
      field: 'title',
      headerName: 'Title',
      renderCell: ({ row }) => {
        return (
          <Typography variant='subtitle1' noWrap sx={{ textTransform: 'capitalize' }}>
            {row.title}
          </Typography>
        )
      }
    },
    {
      flex: 0.17,
      minWidth: 100,
      field: 'fixedValue',
      headerName: 'Fixed Value',
      renderCell: ({ row }) => {
        return (
          <Typography variant='subtitle1' noWrap sx={{ textTransform: 'capitalize' }}>
            {row.fixedValue > 0 ? Number(row.fixedValue).toLocaleString("en-US") : '-'}
          </Typography>
        )
      }
    },
    
    // {
    //   flex: 0.17,
    //   minWidth: 100,
    //   field: 'percentageValue',
    //   headerName: 'Percentage Value',
    //   renderCell: ({ row }) => {
    //     return (
    //       <Typography variant='subtitle1' noWrap sx={{ textTransform: 'capitalize' }}>
    //         {row.percentageValue > 0 ? row.percentageValue + '%' : '-'}
    //       </Typography>
    //     )
    //   }
    // },
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
                sx={{ mx: 0.5, mt: 0.5, mb: 0.5 }}
                label={row.type}
              />
            </div>
          </Box>
        )
      }
    },
    {
      flex: 0.11,
      minWidth: 120,
      field: 'created_at',
      headerName: 'Created at',
      renderCell: ({ row }) => {
        return <>{new Date(row.created_at)?.toLocaleDateString('en-GB')}</>

        // return <>{new Date(row.created_at)}</>
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

  // if (loading) return <Loading header='Please Wait' description='Allowances are loading'></Loading>

  if (session && session.user && !session.user.permissions.includes('ViewPayrollAllowance'))
    return <NoPermission header='No Permission' description='No permission to view payroll Allowance'></NoPermission>

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <Breadcrumbs aria-label='breadcrumb' sx={{ pb: 0, p: 3 }}>
            <Link underline='hover' color='inherit' href='/'>
              Home
            </Link>
            <Typography color='text.primary' sx={{ fontSize: 18, fontWeight: '500' }}>
              Allowances List
            </Typography>
          </Breadcrumbs>
          <Grid container spacing={6} sx={{ px: 5, pt: 3 }}>
            <Grid item sm={2} xs={6}>
              <FormControl fullWidth size='small'>
                <InputLabel id='status-select'>Select Status</InputLabel>
                <Select
                  fullWidth
                  value={compensationStatus}
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
            <Grid item sm={2} xs={6}>
              <FormControl fullWidth size='small'>
                <InputLabel id='status-select'>Select Type</InputLabel>
                <Select
                  fullWidth
                  value={compensationType}
                  id='select-type'
                  label='Select Type'
                  labelId='type-select'
                  onChange={handleTypeChange}
                  inputProps={{ placeholder: 'Select Type' }}
                >
                  <MenuItem value=''>All Type</MenuItem>
                  {CompensationsType &&
                    CompensationsType.map((type, index) => {
                      return (
                        <MenuItem key={index} value={type.value}>
                          {type.label}
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
                onClick={handleExcelExport}
              >
                Export
              </Button>
              {session && session.user && session.user.permissions.includes('AddPayrollAllowance') && (
                <Button type='button' variant='contained' sx={{ mb: 3 }} onClick={() => addCompensation()}>
                  Add Allowance
                </Button>
              )}
            </Grid>
          </Grid>

          <Divider />

          {/* -------------------------- Table -------------------------------------- */}

{         
          loading  ?
            <Loading header='Please Wait' description='Allowances are loading'></Loading>:
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
            Are you sure , you want to delete Allowance{' '}
            <b>
            This will delete this Allowances for all Employees
            </b>
            <span className='bold'>{selectedCompensation && selectedCompensation.title}</span>
          </DialogContentText>
        </DialogContent>
        <DialogActions className='dialog-actions-dense'>
          <Button onClick={deleteCompensation}>Yes</Button>
          <Button onClick={handleClose}>No</Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default CompensationsList
