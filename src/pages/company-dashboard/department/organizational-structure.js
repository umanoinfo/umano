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

  const getDepartmentInfo = (dep)=>{
    console.log(dep);
    const department1 = {}
    department1.id = dep._id
    department1.name = dep.name
    department1.title = dep.name
    department1.mng = dep?.user_info?.[0] ? dep.user_info[0]?.firstName +" "+ dep.user_info[0]?.lastName: '' ;
    department1.logo = dep.user_info[0]?.logo 
    department1.children_info = dep.children_info
    department1.employeesCount = dep.employeesCount
    department1.employees = dep.employees ;
    
    return department1 ;
  }

  const getChildren = (department)=>{
    if(department?.children_info ){
      department.children = [];
      for(let dep of department.children_info){
        let child_dep = getDepartmentInfo(dep);
        getChildren(child_dep);
        department.children.push(child_dep);
      }
      
      return department ;
    }
    else{
      return getDepartmentInfo(department);
    }
  }

  const drawChart = data => {
    const dr = []
    for (let x = 0; x < data.length; x++) {
      if (!data[x].parent) {
        const department = getDepartmentInfo(data[x]);
        getChildren(department);
        dr.push(department)
      }
    }
    console.log(dr);

    const ds = dr.map(department => {
      return {
        id: department.id,
        name: department.name,
        title: department.name,
        logo: department.logo,
        mng: department.mng,
        children: department.children,
        employees: department.employees
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
    }).catch(err=>{
        
        toast.error(err.toString() , {duration: 5000 , position: 'bottom-right'}) ;
        setLoading(false);
    })
    
    
  };
  

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
