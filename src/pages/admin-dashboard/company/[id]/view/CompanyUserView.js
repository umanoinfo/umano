// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import CustomAvatar from 'src/@core/components/mui/avatar'
import CustomChip from 'src/@core/components/mui/chip'
import Loading from 'src/views/loading'

// ** Demo Component Imports
import { DataGrid } from '@mui/x-data-grid'
import { useCallback, useEffect, useState } from 'react'
import LinearProgress from '@mui/material/LinearProgress'

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials'

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

const UserViewOverview = ({ id }) => {
  const [usersDataSource, setUsersDataSource] = useState([])
  const [pageSize, setPageSize] = useState(10)
  const [isLoading, setIsLoading] = useState(false)

  // ------------------------------ Get Users ------------------------------------

  const getUsers = useCallback( 
      async () => {
        setIsLoading(true)
        const res = await fetch('/api/user/' + id + '/byCompany')
        const { data } = await res.json()
        
        let x = 1
        data.map(e => {
          e.id = x;
          
          x++
          if (!e.roles_info) {
            e.roles_info = []
          }
        })
        setUsersDataSource(data)
        setIsLoading(false)
      } 
  , [id]) ;

  useEffect(() => {
    getUsers()
  }, [getUsers])


  const columns = [
    {
      flex: 0.05,
      minWidth: 50,
      field: 'id',
      headerName: 'ID',
      renderCell: ({ row }) => <Typography sx={{ fontWeight: 500, fontSize: '0.875rem' }}>{row.id}</Typography>
    },
    {
      flex: 0.2,
      minWidth: 230,
      field: 'user',
      headerName: 'User',
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {renderClient(row)}
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography sx={{ fontWeight: 500, fontSize: '0.875rem' }}>{row.name}</Typography>
            <Typography variant='caption' sx={{ color: 'text.disabled' }}>
              {row.email}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      flex: 0.13,
      minWidth: 60,
      field: 'roles',
      headerName: 'Roles',
      renderCell: ({ row }) => {
        return row.roles_info.map((e, index) => {
          return (
            <CustomChip
              key={index}
              skin='light'
              size='small'
              label={e.title}
              color='success'
              sx={{ textTransform: 'capitalize', '& .MuiChip-label': { lineHeight: '18px' } }}
            />
          )
        })
      }
    }
  ]
  
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant='body2' sx={{ mr: 2 }}>
            Users List
          </Typography>
          <Typography variant='body2' sx={{ mr: 2 }}></Typography>
        </Box>
      </CardContent>
      {
        isLoading ? 
        <Loading header='Please Wait' description='Users are loading'/>
        :
        <DataGrid
          autoHeight
          rows={usersDataSource}
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

export default UserViewOverview
