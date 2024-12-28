// ** React Imports
import { useState, useEffect, useCallback, forwardRef } from 'react'

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

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Custom Components Imports
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials'

// ** Data
import { EmployeesTypes } from 'src/local-db'

// ** Actions Imports
import { fetchData } from 'src/store/apps/payroll'

// ** Third Party Components
import axios from 'axios'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Controller } from 'react-hook-form'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import NoPermission from 'src/views/noPermission'
import Loading from 'src/views/loading'
import { Breadcrumbs } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import en from 'date-fns/locale/en-GB';

// ** Vars
const userTypeObj = {
  employee: { icon: 'mdi:account-outline', color: 'warning.main' },
  manager: { icon: 'mdi:account-outline', color: 'success.main' }
}

const monthObj = {
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
  if (row.logo) {
    return <CustomAvatar src={row.logo} sx={{ mr: 3, width: 34, height: 34 }} />
  } else {
    return (
      <CustomAvatar
        skin='light'
        color={row.avatarColor || 'primary'}
        sx={{ mr: 3, width: 34, height: 34, fontSize: '1rem' }}
      >
        {getInitials(row.firstName ? row.firstName + ' ' + row.lastName : '@')}
      </CustomAvatar>
    )
  }
}

const PayrollList = classNamec => {
  // ** State
  const [no, setNo] = useState('')
  const [month, setMonth] = useState(new Date().getMonth())
  const [value, setValue] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const [selectedEmployee, setSelectedEmployee] = useState()
  const [payrolls, setPayrolls] = useState([]);
  const { data: session, status } = useSession()

  // ** Hooks

  const dispatch = useDispatch()
  const store = useSelector(state => state.payroll)
  const router = useRouter()

  const { year, employeeId } = router.query;

  useEffect(() => {
    setLoading(true);
    console.log(employeeId, year);
    axios
      .get('/api/payroll/difference/user/' + employeeId + '?year=' + year, {
      })
      .then(function (response) {
        console.log(response.data.data)
        setPayrolls(response.data.data);
        setLoading(false);
      })
  }, [dispatch, year])

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

  const handleNoChange = useCallback(val => {
    setNo(val)
  }, [])

  const handleyearChange = useCallback(e => {
    // setYear(e.target.value)
  }, [])

  const handleMonthChange = useCallback(e => {
    setMonth(e.target.value)
  }, [])

  const goToView = (row) => {
    router.push('/company-dashboard/payroll/slip/' + row._id)
  }

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

    const handleRowView = () => {
      // router.push('/company-dashboard/payroll/slip/' + row._id)

      handleRowOptionsClose()
    }

    const handleDelete = () => {
      setSelectedEmployee(row)
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
          {session && session.user.permissions.includes('ViewEmployee') && (
            <MenuItem onClick={handleRowView} sx={{ '& svg': { mr: 2 } }}>
              <Icon icon='mdi:eye-outline' fontSize={20} />
              View
            </MenuItem>
          )}
          {session && session.user.permissions.includes('DeleteEmployee') && (
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
      flex: 0.02,
      minWidth: 50,
      field: 'index',
      headerName: '#',
      renderCell: ({ row }) => {
        return (
          <Typography variant='subtitle1' noWrap sx={{ textTransform: 'capitalize' }}>
            {row.index + 1}
          </Typography>
        )
      }
    },
    {
      flex: 0.02,
      minWidth: 100,
      field: 'idNo',
      headerName: 'ID NO  .',
      renderCell: ({ row }) => {
        return (
          <Typography variant='subtitle1' noWrap sx={{ textTransform: 'capitalize' }}>
            <a href="#" >{row.employee_no}</a>
          </Typography>
        )
      }
    },
    {
      flex: 0.02,
      minWidth: 250,
      field: 'name',
      headerName: 'Employee name',
      renderCell: ({ row }) => {
        return (
          <Typography variant='subtitle1' noWrap sx={{ textTransform: 'capitalize' }}>
            {row?.employee_info?.[0]?.firstName + ' ' + row?.employee_info?.[0]?.lastName}
          </Typography>
        )
      }
    },
    {
      flex: 0.02,
      minWidth: 250,
      field: 'fromDate',
      headerName: 'Month',
      renderCell: ({ row }) => {

        return (
          <Typography variant='subtitle1' noWrap sx={{ textTransform: 'capitalize' }}>
            {new Date(row?.fromDate).getMonth()}
          </Typography>
        )
      }
    },
    {
      flex: 0.2,
      minWidth: 250,
      field: 'total',
      headerName: 'Total Hours',
      renderCell: ({ row }) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
            <Typography noWrap sx={{ color: 'text.primary', textTransform: 'capitalize' }}>
              {row.total.toFixed(2)}
            </Typography>
          </Box>
        )
      }
    },

    // {
    //   flex: 0.08,
    //   minWidth: 10,
    //   sortable: false,
    //   field: 'actions',
    //   headerName: '',
    //   renderCell: ({ row }) => <RowOptions row={row} />
    // }
  ]

  // ----------------------------- Add User --------------------------------------------

  const handleExcelExport = () => {
    const wb = XLSX.utils.book_new()
    let ex = [...store.data]

    ex = ex.map(val => {
      let c = { ...val }
      delete c['company_id']
      delete c['country_info']
      c.name = c.firstName + ' ' + c.lastName
      delete c['firstName']
      delete c['lastName']
      delete c['updated_at']
      delete c['sourceOfHire']
      delete c['_id']
      c.positions = c.positions_info.map(v => {
        return v.positionTitle
      })
      c.positions = c.positions.toString()
      delete c['positions_info']

      return c
    })
    const ws = XLSX.utils.json_to_sheet(ex)
    XLSX.utils.book_append_sheet(wb, ws, 'Comments')
    XLSX.writeFile(wb, 'payroll.xlsx')
  }

  const addPayroll = () => {
    router.push('/company-dashboard/payroll/calculate')
  }

  const deleteEmployee = () => {
    setLoading(true)
    axios
      .post('/api/payroll/delete-payroll', {
        selectedPayroll: { ...selectedEmployee }
      })
      .then(function (response) {
        dispatch(fetchData({})).then(() => {
          toast.success('payroll Deleted Successfully.', {
            delay: 1000,
            position: 'bottom-right'
          })
          setLoading(false)
          setOpen(false)
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

  //   --------------------------- View ----------------------------------------------

  // if (loading) return <Loading header='Please Wait' description='Employee are loading'></Loading>

  if (session && session.user && !session.user.permissions.includes('ViewPayroll')) {
    return <NoPermission header='No Permission' description='No permission to View Employees'></NoPermission>
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <Breadcrumbs aria-label='breadcrumb' sx={{ pb: 0, p: 3 }}>
            <Link underline='hover' color='inherit' href='/'>
              Home
            </Link>
            <Typography color='text.primary' sx={{ fontSize: 18, fontWeight: '500' }}>
              Payroll List
            </Typography>
          </Breadcrumbs>
          <Divider />
          {/* ------------------------- Table Header -------------------------------- */}
          <Box
            sx={{
              p: 2,
              pb: 3,
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {/* <FormControl size='small'>
                <TextField
                  size='small'
                  label='No.'
                  labelId='search-no'
                  value={no}
                  sx={{ mr: 3, mx: 1, width: 100 }}
                  placeholder='Search Employee'
                  onChange={e => handleNoChange(e.target.value)}
                />
              </FormControl>
              <FormControl size='small'>
                <TextField
                  size='small'
                  label='Search Employee'
                  labelId='search-employee'
                  value={value}
                  sx={{ mr: 3, mx: 1, width: 300 }}
                  placeholder='Search Employee'
                  onChange={e => handleFilter(e.target.value)}
                />
              </FormControl> */}

            </Box>

            {/* <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
              <Button
                onClick={handleExcelExport}
                sx={{ mr: 4, mb: 2 }}
                color='secondary'
                variant='outlined'
                startIcon={<Icon icon='mdi:export-variant' fontSize={20} />}
              >
                Export
              </Button>

              {session && session.user.permissions.includes('AddPayroll') && (
                <Button type='button' variant='contained' sx={{ mb: 2 }} onClick={() => addPayroll()}>
                  Calculate
                </Button>
              )}
            </Box> */}
          </Box>
          {/* ------------------------------- Table --------------------------------- */}
          {
            loading && <Loading header='Please Wait' description='Employee are loading'></Loading>
          }
          {
            !loading &&
            <DataGrid
              autoHeight
              rows={payrolls}
              columns={columns}
              getRowId={(row) => (row.index + 1)}
              pageSize={pageSize}
              disableSelectionOnClick
              rowsPerPageOptions={[10, 25, 50]}
              sx={{ '& .MuiDataGrid-columnHeaders': { borderRadius: 0 } }}
              onPageSizeChange={newPageSize => setPageSize(newPageSize)}
            />
          }
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
            Are you sure , you want to delete payroll
            <span className='font-weight-bold'>
              {selectedEmployee && selectedEmployee.firstName} {selectedEmployee && selectedEmployee.lastName}
            </span>
          </DialogContentText>
        </DialogContent>
        <DialogActions className='dialog-actions-dense'>
          <Button onClick={deleteEmployee}>Yes</Button>
          <Button onClick={handleClose}>No</Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default PayrollList
