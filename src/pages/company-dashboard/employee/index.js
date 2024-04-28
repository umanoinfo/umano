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
import CustomBadge from 'src/@core/components/mui/badge'
import Select from '@mui/material/Select'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContentText from '@mui/material/DialogContentText'
import toast from 'react-hot-toast'
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
import { fetchData } from 'src/store/apps/companyEmployee'

// ** Third Party Components
import axios from 'axios'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Controller } from 'react-hook-form'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import NoPermission from 'src/views/noPermission'
import Loading from 'src/views/loading'
import { Badge, Breadcrumbs } from '@mui/material'

// ** Vars
const userTypeObj = {
  employee: { icon: 'mdi:account-outline', color: 'warning.main' },
  manager: { icon: 'mdi:account-outline', color: 'success.main' }
}

const employeeTypeObj = {
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

const EmployeeList = classNamec => {
  // ** State
  const [type, setType] = useState('')
  const [plan, setPlan] = useState('')
  const [employeeType, setEmployeeType] = useState('')
  const [value, setValue] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [departmentFind, setDepartmentFind] = useState([])
  const [selectedEmployee, setSelectedEmployee] = useState()
  const [departments, setDepartments] = useState()
  const [notAuthorized , setNotAuthorized] = useState([]) ; 
  const { data: session, status } = useSession()

  // ** Hooks

  const dispatch = useDispatch()
  const store = useSelector(state => state.companyEmployee)

  const router = useRouter()

  useEffect(() => {
    setLoading(true);
    dispatch(
      fetchData({
        type,
        employeeType,
        q: value
      })
    ).then( ()=>  getDepartments()  )
  }, [dispatch, type, employeeType, value ])


  
  const getDepartments = async () => {
    setLoading(true);
    try{
      const res = await fetch('/api/company-department/all-company-departments')
      console.log(res);
      const {data , success , message } = await res.json() ;
      if(res.status == 401 ){
          setNotAuthorized([...notAuthorized , 'departments'])
      }
      if(!success){
        throw new Error( 'Error Failed to Fetch Departments ( ' + message + ' )' );
      }
      setDepartments(data)
      setLoading(false);
    }
    catch(err){
      toast.error(err.toString() , {duration: 5000 , position: 'bottom-right'});
      setLoading(false);
    }
   
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

  const handleEmployeeTypeChange = useCallback(e => {
    setEmployeeType(e.target.value)
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
      router.push('/company-dashboard/employee/' + row._id + '/edit-employee')
      handleRowOptionsClose()
    }

    const handleRowView = () => {
      router.push('/company-dashboard/employee/' + row._id + '/view/positions')
      handleRowOptionsClose()
    }




    const handleRowTimeLine = () => {
      router.push('/company-dashboard/employee/' + row._id + '/employeeTimeLine')
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
          {session && session.user.permissions.includes('ViewEmployee') && (
            <MenuItem onClick={handleRowTimeLine} sx={{ '& svg': { mr: 2 } }}>
              <Icon icon='mdi:clock-outline' fontSize={20} />
              TimeLine
            </MenuItem>
          )}
          {session && session.user.permissions.includes('EditEmployee') && (
            <MenuItem onClick={handleEditRowOptions} sx={{ '& svg': { mr: 2 } }}>
              <Icon icon='mdi:pencil-outline' fontSize={20} />
              Edit
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

  const goToView = (_id) => {
    router.push('/company-dashboard/employee/' + _id + '/view/positions')
  }
  
  const columns = [
    {
      flex: 0.02,
      minWidth: 50,
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
      flex: 0.02,
      minWidth: 150,
      field: 'idNo',
      headerName: 'Id No.',
      renderCell: ({ row }) => {
        return (
          <Typography variant='subtitle1' noWrap sx={{ textTransform: 'capitalize' }}>
            {row.idNo}
          </Typography>
        )
      }
    },
    {
      flex: 0.1,
      minWidth: 280,
      field: 'employeeName',
      headerName: 'Employee',
      renderCell: ({ row }) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {renderClient(row)}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
              <Typography noWrap sx={{ color: 'text.primary', textTransform: 'capitalize' }}>
                <a href="#" onClick={(e)=>goToView(row._id)}>{row.firstName} {row.lastName}</a>
              </Typography>

            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.02,
      minWidth: 200,
      field: 'email',
      headerName: 'Email',
      renderCell: ({ row }) => {
        return (
          <Typography noWrap variant='caption'>
          {row.email}
        </Typography>
        )
      }
    },
    {
      flex: 0.12,
      field: 'departments',
      minWidth: 140,
      headerName: 'Department',
      sortable: false,
      renderCell: ({ row }) => {
        if(notAuthorized.includes('departments')){
          return <div style={{color:'red' , fontSize:'0.5rem'}}>
            No view Department Permission
          </div>
        }
        
      return (
          <Box sx={{ display: 'flex', alignItems: 'center', '& svg': { mr: 3 } }}>
            { row.departments.length > 1 && <CustomBadge onClick={(e)=>{console.log(row)}}  badgeContent={row.departments.length - 1 +'+'} skin='light' color='primary' size='small' sx={{ marginTop:'11px'}}>
              {row.departments[0]}
            </CustomBadge>}
            { row.departments.length <= 1 && 
              <span>{row.departments[0]}</span> 
            }
        </Box>
        )
      }
    },
    {
      flex: 0.12,
      field: 'managers',
      minWidth: 240,
      headerName: 'Manager',
      sortable: false,
      renderCell: ({ row }) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', '& svg': { mr: 3 } }}>
            { row.managers.length > 1 && <CustomBadge onClick={(e)=>{console.log(row)}}  badgeContent={row.managers.length - 1 +'+'} skin='light' color='primary' size='small' sx={{ marginTop:'11px'}}>
              {row.managers[0]}
            </CustomBadge>}
            { row.managers.length <= 1 && 
              <span>{row.managers[0]}</span> 
            }
        </Box>
        )
      }
    },
    {
      flex: 0.12,
      field: 'positions',
      minWidth: 120,
      headerName: 'Positions',
      sortable: false,
      renderCell: ({ row }) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', '& svg': { mr: 3 } }}>
            <div style={{overflow: 'hidden' , whiteSpace:'nowrap' , textOverflow:'ellipsis' , width:'140px' , display:'inline-block'}}>
              { row.positions_info.length > 1 && <CustomBadge onClick={(e)=>{console.log(row)}}  badgeContent={row.positions_info.length - 1 +'+'} skin='light' color='primary' size='small' sx={{ marginTop:'11px'}}>
                <CustomChip
                      skin='light'
                      size='small'
                      label={row.positions_info[0]?.positionTitle}
                      color={employeeTypeObj[row.positionTitle]}
                      sx={{ mr: 1, textTransform: 'capitalize', '& .MuiChip-label': { lineHeight: '18px' } }}
                    />
              </CustomBadge>}
              { row.positions_info.length <= 1 && 
                <CustomChip
                      skin='light'
                      size='small'
                      label={row.positions_info[0]?.positionTitle}
                      color={employeeTypeObj[row.positionTitle]}
                      sx={{ mr: 1, textTransform: 'capitalize', '& .MuiChip-label': { lineHeight: '18px' } }}
                    />
              }
            </div>
          </Box>
        )
      }
    },
    {
      flex: 0.09,
      minWidth: 120,
      field: 'joiningDate',
      headerName: 'joining Date',
      renderCell: ({ row }) => {
        return (
          <>
            {row.joiningDate && 
                <span>{new Date(row.joiningDate).toISOString().substring(0, 10)}</span>
            }
          </>
        )
      }
    },
    {
      flex: 0.08,
      minWidth: 120,
      field: 'employeeType',
      headerName: 'Employee Type',
      renderCell: ({ row }) => {
        return (
          <>
            {' '}
            {row.employeeType && (
              <CustomChip
                skin='light'
                size='small'
                label={row.employeeType}
                color={employeeTypeObj['active']}
                sx={{ textTransform: 'capitalize', '& .MuiChip-label': { lineHeight: '18px' } }}
              />
            )}
          </>
        )
      }
    },
    {
      flex: 0.08,
      minWidth: 50,
      sortable: false,
      field: 'actions',
      headerName: '',
      renderCell: ({ row }) => <RowOptions row={row} />
    }
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
    XLSX.writeFile(wb, 'survey-data.xlsx')
  }

  const addEmployee = () => {
    router.push('/company-dashboard/employee/add-employee')
  }

  const deleteEmployee = () => {
    setLoading(true)
    axios
      .post('/api/company-employee/delete-employee', {
        selectedEmployee
      })
      .then(function (response) {
        dispatch(fetchData({})).then(() => {
          toast.success(
            'Employee (' + selectedEmployee.firstName + ' ' + selectedEmployee.lastName + ') Deleted Successfully.',
            {
              delay: 1000,
              position: 'bottom-right'
            }
          )
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

  if (loading) return <Loading header='Please Wait' description='Employees are loading'></Loading>

  if (session && session.user && !session.user.permissions.includes('ViewEmployee')) {
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
              Employees List
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
              <FormControl size='small'>
                <InputLabel id='status-select'>Select Type</InputLabel>
                <Select
                  fullWidth
                  value={employeeType}
                  id='select-status'
                  label='Select Status'
                  labelId='status-select'
                  onChange={handleEmployeeTypeChange}
                  inputProps={{ placeholder: 'Select Status' }}
                >
                  <MenuItem value=''>All Type</MenuItem>
                  {EmployeesTypes.map((e, index) => {
                    return (
                      <MenuItem key={index} value={e.value}>
                        {e.title}
                      </MenuItem>
                    )
                  })}
                </Select>
              </FormControl>
              <FormControl size='small'>
                <TextField
                  size='small'
                  label='Search Employee'
                  labelId='search-employee'
                  value={value}
                  sx={{ mr: 6, mx: 3, width: 300 }}
                  placeholder='Search Employee'
                  onChange={e => handleFilter(e.target.value)}
                />
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
              <Button
                onClick={handleExcelExport}
                sx={{ mr: 4, mb: 2 }}
                color='secondary'
                variant='outlined'
                startIcon={<Icon icon='mdi:export-variant' fontSize={20} />}
              >
                Export
              </Button>

              {session && session.user.permissions.includes('AddEmployee') && (
                <Button type='button' variant='contained' sx={{ mb: 2 }} onClick={() => addEmployee()}>
                  Add Employee
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
            sx={{ '& .MuiDataGrid-columnHeaders': { borderRadius: 0  } }}
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
            Are you sure , you want to delete employee{' '}
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

export default EmployeeList
