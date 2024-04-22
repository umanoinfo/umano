// ** MUI Imports
import Card from '@mui/material/Card'
import Table from '@mui/material/Table'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import TableRow from '@mui/material/TableRow'
import Checkbox from '@mui/material/Checkbox'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import TableContainer from '@mui/material/TableContainer'
import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { Box, FormControlLabel, Grid, LinearProgress, Tooltip } from '@mui/material'
import Link from 'src/@core/theme/overrides/link'
import { useRouter } from 'next/router'

import UsersProjectListTable from 'src/views/apps/user/view/UsersProjectListTable'
import { DataGrid } from '@mui/x-data-grid'
import IconButton from '@mui/material/IconButton'
import Icon from 'src/@core/components/icon'
import Loading from 'src/views/loading'

const CompanyViewSubscriptions = ({ id }) => {
  const router = useRouter()

  const [permissionsGroup, setPermissionsGroup] = useState([])
  const [selectedPermissions, setSelectedPermissions] = useState([])
  const [subscriptionsDataSource, setSubscriptionsDataSource] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState(true)

  const handleEditRowOptions = (row) => {

  }

  const columns = [
    {
      flex: 0.15,
      minWidth: 100,
      field: 'start_at',
      headerName: 'Start at',
      renderCell: ({ row }) => <Typography variant='body2'>{row.start_at}</Typography>
    },
    {
      flex: 0.15,
      minWidth: 100,
      field: 'end_at',
      headerName: 'End at',
      renderCell: ({ row }) => <Typography variant='body2'>{row.end_at}</Typography>
    },
    {
      flex: 0.15,
      minWidth: 150,
      headerName: 'Progress',
      field: 'progressValue',
      renderCell: ({ row }) => (
        <Box sx={{ width: '100%' }}>
          <Typography variant='body2'>{((row.daysToNow / row.subscriptionDays) * 100).toFixed(2)}%</Typography>
          <LinearProgress
            variant='determinate'
            value={((row.daysToNow / row.subscriptionDays) * 100).toFixed(2)}
            color={row.progressColor}
            sx={{ height: 6, mt: 1, borderRadius: '5px' }}
          />
        </Box>
      )
    },
    {
      flex: 0.15,
      minWidth: 100,
      field: 'availableUsers',
      headerName: 'Users',
      renderCell: ({ row }) => (
        <Typography variant='body2' align='center'>
          {row.availableUsers}
        </Typography>
      )
    },
    {
      flex: 0.15,
      minWidth: 100,
      field: 'cost',
      headerName: 'Cost',
      renderCell: ({ row }) => (
        <Typography variant='body2' align='center'>
          {row.cost}
        </Typography>
      )
    },
    {
      flex: 0.15,
      minWidth: 100,
      field: 'action',
      headerName: '',
      renderCell: ({ row }) => (
        <>
          {/* <IconButton size='small'  >
            <Icon icon='mdi:pencil-outline'  fontSize={18} />
          </IconButton> */}
          {/* <IconButton size='small'>
            <Icon icon='mdi:delete-outline' fontSize={18} />
          </IconButton> */}
        </>
      )
    }
  ]

  const [value, setValue] = useState('')
  const [pageSize, setPageSize] = useState(7)
  const [data, setData] = useState([])
 
   // ------------------------------ Get Users ------------------------------------

   const getSubscriptions =   async () => {
    setIsLoading(true)
    const res = await fetch('/api/subscription/' + id + '/byCompany')
    const { data } = await res.json()
    data.map(e => {
      e.id = e._id
      e.subscriptionDays =
        (new Date(e.end_at) - new Date(e.start_at)) / 1000 / 24 / 3600 != 0
          ? (new Date(e.end_at) - new Date(e.start_at)) / 1000 / 24 / 3600
          : 1
      e.daysToNow =
        Math.floor((new Date() - new Date(e.start_at)) / 1000 / 24 / 3600) != 0
          ? Math.floor((new Date() - new Date(e.start_at)) / 1000 / 24 / 3600)
          : 1;
      e.progressValue = (e.daysToNow / e.subscriptionDays) * 100 ; 
    })
    setSubscriptionsDataSource(data)
    setIsLoading(false)
  }
   


  useEffect(() => {
    getSubscriptions()
  }, [ ])
  
 
  const addSubscription = () => {
    router.push('/admin-dashboard/company/' + id + '/add-subscription')
  }

  const routeToEditSubscription = () => {
    router.push('/admin-dashboard/company/' + id + '/edit-subscription')
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant='body2' sx={{ mr: 2 }}>
            Subscription List
          </Typography>
          <Typography variant='body2' sx={{ mr: 2 }}>
            <Button type='button' variant='contained' onClick={() => addSubscription()}>
              Add Subscription
            </Button>
          </Typography>
        </Box>
      </CardContent>
      {
        isLoading ?
        <Loading header='Please Wait' description='Subscriptions are loading'/> :
        <DataGrid
        autoHeight
        rows={subscriptionsDataSource}
        columns={columns}
        pageSize={pageSize}
        disableSelectionOnClick
        rowsPerPageOptions={[7, 10, 25, 50]}
        onPageSizeChange={newPageSize => setPageSize(newPageSize)}
      />
      }
     
    </Card>
  )
}

export default CompanyViewSubscriptions
