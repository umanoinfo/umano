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
import { useEffect, useState } from 'react'
import axios from 'axios'
import { Box, FormControlLabel, Grid, LinearProgress, Tooltip } from '@mui/material'
import Link from 'src/@core/theme/overrides/link'
import { useRouter } from 'next/router'

import UsersProjectListTable from 'src/views/apps/user/view/UsersProjectListTable'
import { DataGrid } from '@mui/x-data-grid'
import IconButton from '@mui/material/IconButton'
import Icon from 'src/@core/components/icon'

const CompanyViewSubscriptions = ({ id }) => {
  const router = useRouter()

  const [permissionsGroup, setPermissionsGroup] = useState([])
  const [selectedPermissions, setSelectedPermissions] = useState([])
  const [loading, setLoading] = useState(true)

  const columns = [
    {
      flex: 0.3,
      minWidth: 230,
      field: 'projectTitle',
      headerName: 'Created',
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography sx={{ fontWeight: 500, fontSize: '0.875rem' }}>{row.projectTitle}</Typography>
            <Typography variant='caption' sx={{ color: 'text.disabled' }}>
              12/5/25 11:20
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      flex: 0.15,
      minWidth: 100,
      field: 'Start at',
      headerName: 'Start at',
      renderCell: ({ row }) => <Typography variant='body2'>{row.totalTask}</Typography>
    },
    {
      flex: 0.15,
      minWidth: 100,
      field: 'End at',
      headerName: 'End at',
      renderCell: ({ row }) => <Typography variant='body2'>{row.totalTask}</Typography>
    },
    {
      flex: 0.15,
      minWidth: 200,
      headerName: 'Progress',
      field: 'progressValue',
      renderCell: ({ row }) => (
        <Box sx={{ width: '100%' }}>
          <Typography variant='body2'>{row.progressValue}%</Typography>
          <LinearProgress
            variant='determinate'
            value={row.progressValue}
            color={row.progressColor}
            sx={{ height: 6, mt: 1, borderRadius: '5px' }}
          />
        </Box>
      )
    },
    {
      flex: 0.15,
      minWidth: 100,
      field: 'hours',
      headerName: 'Users',
      renderCell: ({ row }) => <Typography variant='body2'>{row.hours}</Typography>
    },
    {
      flex: 0.15,
      minWidth: 100,
      field: 'action',
      headerName: '',
      renderCell: ({ row }) => (
        <>
          <IconButton size='small'>
            <Icon icon='mdi:pencil-outline' fontSize={18} />
          </IconButton>
          <IconButton size='small'>
            <Icon icon='mdi:delete-outline' fontSize={18} />
          </IconButton>
        </>
      )
    }
  ]

  const [value, setValue] = useState('')
  const [pageSize, setPageSize] = useState(7)
  const [data, setData] = useState([])
  useEffect(() => {
    axios
      .get('/apps/users/project-list', {
        params: {
          q: value
        }
      })
      .then(res => setData(res.data))
  }, [value])

  // useEffect(() => {
  //   getPermissionGroup()
  //   getUser()
  // }, [])

  const addSubscription = () => {
    router.push('/admin-dashboard/company/' + id + '/add-subscription')
  }

  const routeToEditUser = () => {
    router.push('/admin-dashboard/user/' + id + '/edit-user')
  }

  return (
    <Card>
      <CardHeader title="User's Projects List" />
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <Typography variant='body2' sx={{ mr: 2 }}>
            <Button type='button' variant='contained' sx={{ mb: 3 }} onClick={() => addSubscription()}>
              Add Subscription
            </Button>
          </Typography>
        </Box>
      </CardContent>
      <DataGrid
        autoHeight
        rows={data}
        columns={columns}
        pageSize={pageSize}
        disableSelectionOnClick
        rowsPerPageOptions={[7, 10, 25, 50]}
        onPageSizeChange={newPageSize => setPageSize(newPageSize)}
      />
    </Card>
  )
}

export default CompanyViewSubscriptions
