// ** React Imports
import { useState, useEffect, useCallback, forwardRef } from 'react'
import OrganizationChart from '../../components/ChartContainer'


import React from 'react'

// ** Next Imports
import Link from 'next/link'
import Fade from '@mui/material/Fade'

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
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContentText from '@mui/material/DialogContentText'
import toast from 'react-hot-toast'
import CardActions from '@mui/material/CardActions'

import TreeView from '@mui/lab/TreeView'
import TreeItem from '@mui/lab/TreeItem'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Custom Components Imports
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'
import CardStatisticsHorizontal from 'src/@core/components/card-statistics/card-stats-horizontal'

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials'

// ** Actions Imports
import { fetchDepartmentData } from 'src/store/apps/company-department'

// ** Third Party Components
import axios from 'axios'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Controller } from 'react-hook-form'

import { useSession } from 'next-auth/react'
import TableHeader from 'src/views/apps/permissions/TableHeader'
import { useRouter } from 'next/router'
import { useRef } from 'react'
import NoPermission from 'src/views/noPermission'
import Loading from 'src/views/loading'
import { Breadcrumbs } from '@mui/material'

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

// Styled TreeItem component
const StyledTreeItemRoot = styled(TreeItem)(({ theme }) => ({
  '&:hover > .MuiTreeItem-content:not(.Mui-selected)': {
    backgroundColor: theme.palette.action.hover
  },
  '& .MuiTreeItem-content': {
    paddingRight: theme.spacing(3),
    borderTopRightRadius: theme.spacing(4),
    borderBottomRightRadius: theme.spacing(4),
    fontWeight: theme.typography.fontWeightMedium
  },
  '& .MuiTreeItem-label': {
    fontWeight: 'inherit',
    paddingRight: theme.spacing(3)
  },
  '& .MuiTreeItem-group': {
    marginLeft: 0,
    '& .MuiTreeItem-content': {
      paddingLeft: theme.spacing(4),
      fontWeight: theme.typography.fontWeightRegular
    }
  }
}))

const DepartmentList = ({ apiData }) => {
  // ** State
  const [type, setType] = useState('')
  const [plan, setPlan] = useState('')
  const [companyStatus, setCompanyStatus] = useState('')
  const [value, setValue] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [addUserOpen, setAddUserOpen] = useState(false)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [selectedDepartment, setSelectedDepartment] = useState()
  const [mainDepartments, setMainDepartments] = useState()

  const [editUserOpen, setEditUserOpen] = useState(false)
  const { data: session, status } = useSession()
  const [show, setShow] = useState(false)
  const [dataSource, setDataSource] = useState()

  // ** Hooks

  const dispatch = useDispatch()

  const store = useSelector(state => state.companyDepartment)
  const router = useRouter()

  const ExpandIcon = <Icon icon={'mdi:chevron-right'} />

  const StyledTreeItem = props => {
    // ** Props
    const { labelText, labelIcon, labelInfo, ...other } = props

    return (
      <StyledTreeItemRoot
        {...other}
        label={
          <Box sx={{ py: 1, display: 'flex', alignItems: 'center', '& svg': { mr: 1 } }}>
            <Icon icon={labelIcon} color='inherit' />
            <Typography variant='body2' sx={{ flexGrow: 1, fontWeight: 'inherit' }}>
              {labelText}
            </Typography>
            {labelInfo ? (
              <Typography variant='caption' color='inherit'>
                {labelInfo}
              </Typography>
            ) : null}
          </Box>
        }
      />
    )
  }

  const orgchart = useRef()



  const drawChart = data => {
    const dr = []
    for (let x = 0; x < data.length; x++) {
      if (!data[x].parent) {
        const department = {}
        department.id = data[x]._id
        department.name = data[x].name
        department.mng = data[x].user_info[0]?.firstName +" "+ data[x].user_info[0]?.lastName
        department.logo = data[x].user_info[0]?.logo 
        department.title = data[x].name
        department.employeesCount = data[x].employeesCount
        if (data && data[x] && data[x].children_info) {
          const chile = []
          for (let dep of data[x].children_info) {
            const department1 = {}
            department1.id = dep._id
            department1.name = dep.name
            department1.title = dep.name
            department1.mng = dep.user_info[0]?.firstName +" "+ dep.user_info[0]?.lastName
            department1.logo = dep.user_info[0]?.logo 
            department1.children_info = dep.children_info
            department1.employeesCount = dep.employeesCount
            chile.push(department1)
            if (department1.children_info) {
              const chile2 = []
              for (let dep of department1.children_info) {
                const department2 = {}
                department2.id = dep._id
                department2.name = dep.name
                department2.title = dep.name
                department2.mng = dep.user_info[0]?.firstName +" "+ dep.user_info[0]?.lastName
                department2.logo = dep.user_info[0]?.logo 
                department2.children_info = dep.children_info
                department2.employeesCount = dep.employeesCount
                chile2.push(department2)
                if (department2.children_info) {
                  const chile3 = []
                  for (let dep3 of department2.children_info) {
                    const department3 = {}
                    department3.id = dep3._id
                    department3.name = dep3.name
                    department3.title = dep3.name
                    department3.mng = dep3.user_info[0]?.firstName +" "+ dep3.user_info[0]?.lastName
                    department3.logo = dep3.user_info[0]?.logo 
                    department3.children_info = dep3.children_info
                    department3.employeesCount = dep3.employeesCount
                    chile3.push(department3)
                    const chile4 = []
                    if (department3.children_info) {
                      for (let dep4 of department3.children_info) {
                        const department4 = {}
                        department4.id = dep4._id
                        department4.name = dep4.name
                        department4.title = dep4.name
                        department4.mng = dep4.user_info[0]?.firstName +" "+ dep4.user_info[0]?.lastName
                        department4.logo = dep4.user_info[0]?.logo 
                        department4.children_info = dep4.children_info
                        department4.employeesCount = dep4.employeesCount
                        chile4.push(department4)
                        const chile5 = []
                        if (department4.children_info) {
                          for (let dep5 of department4.children_info) {
                            const department5 = {}
                            department5.id = dep5._id
                            department5.name = dep5.name
                            department5.title = dep5.name
                            department5.mng = dep5.user_info[0]?.firstName +" "+ dep5.user_info[0]?.lastName
                            department5.logo = dep5.user_info[0]?.logo 
                            department5.children_info = dep5.children_info
                            department5.employeesCount = dep5.employeesCount
                            chile5.push(department5)
                          }
                          department4.children = chile5
                        }
                      }
                      department3.children = chile4
                    }
                  }
                  department2.children = chile3
                }
              }
              department1.children = chile2
            }
          }
          department.children = chile
        }
        dr.push(department)
      }
    }

    const ds = dr.map(department => {
      return {
        id: department.id,
        name: department.name,
        title: department.name,
        logo: department.logo,
        mng: department.mng,
        children: department.children
      }
    })

    setDataSource(ds[0])
  }

  const exportTo = () => {
    orgchart.current.exportTo(filename, fileextension)
  }

  const [filename, setFilename] = useState('organization_chart')
  const [fileextension, setFileextension] = useState('png')

  const onNameChange = event => {
    setFilename(event.target.value)
  }

  const onExtensionChange = event => {
    setFileextension(event.target.value)
  }

  const getMainDepartment =  () => {
    setLoading(true);
    axios.get('/api/company-department/main-departments', {}).then(function (response) {
      setMainDepartments(response.data.data)
      response.data.data.map(department => {
        if (department.children_info) {
          const arr = []
          department.children_info.map(child => {
            const find = response.data.data.filter(e => {
              return e._id == child._id
            })
            arr.push(find[0])
          })
          department.children_info = arr
        }
      })
      drawChart(response.data.data)
      setLoading(false);
    })
  }  ;

  useEffect(() => {
    getMainDepartment()
  }, []);

 

  //   -------------------------------- View -----------------------------------------

  if (loading) return <Loading header='Please Wait' description='Departments are loading'></Loading>

  if (session && session.user && !session.user.permissions.includes('ViewDepartment'))
    return <NoPermission header='No Permission' description='No permission to view departments'></NoPermission>

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <Breadcrumbs aria-label='breadcrumb' sx={{ pb: 0, p: 3 }}>
            <Link underline='hover' color='inherit' href='/'>
              Home
            </Link>
            <Typography color='text.primary' sx={{ fontSize: 18, fontWeight: '500' }}>
              Organizational Structure
            </Typography>
          </Breadcrumbs>
          <CardContent>
            <>
              {dataSource && <OrganizationChart ref={orgchart} datasource={dataSource} />}
            </>
          </CardContent>
          <Divider />
        </Card>
      </Grid>
    </Grid>
  )
}

export default DepartmentList
