// ** MUI Imports
import Card from '@mui/material/Card'
import Divider from '@mui/material/Divider'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import { DataGrid } from '@mui/x-data-grid'
import { useState } from 'react'
import CustomChip from 'src/@core/components/mui/chip'
import { Box } from '@mui/material'

const EmployeeViewLeaves = ({ employee }) => {
  if (employee) {
    employee.leaves_info.map((e, index) => {
      e.id = index + 1
    })
  }

  const [pageSize, setPageSize] = useState(10)

  const typeObj = {
    daily: 'success',
    hourly: 'warning'
  }

  const statusObj = {
    justified: 'success',
    notJustified: 'error',
    sick: 'warning'
  }

  const columns = [
    {
      flex: 0.03,
      minWidth: 25,
      field: '#',
      headerName: '#',
      renderCell: ({ row }) => <Typography variant='body2'>{row.id}</Typography>
    },
    ,
    {
      flex: 0.03,
      field: 'type',
      minWidth: 90,
      headerName: 'Type',
      renderCell: ({ row }) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', '& svg': { mr: 3 } }}>
            <CustomChip
              skin='light'
              size='small'
              label={row.type}
              color={typeObj[row.type]}
              sx={{ textTransform: 'capitalize', '& .MuiChip-label': { lineHeight: '18px' } }}
            />
          </Box>
        )
      }
    },
    {
      flex: 0.1,
      minWidth: 100,
      field: 'dateFrom',
      headerName: 'Date From',
      renderCell: ({ row }) => <Typography variant='body2'>{new Date(row.date_from).toLocaleString()}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 100,
      field: 'dateTo',
      headerName: 'Date To',
      renderCell: ({ row }) => <Typography variant='body2'>{new Date(row.date_to).toLocaleString()}</Typography>
    },
    {
      flex: 0.05,
      field: 'status',
      minWidth: 100,
      headerName: 'Status',
      renderCell: ({ row }) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', '& svg': { mr: 3 } }}>
            <CustomChip
              skin='light'
              size='small'
              label={row.status_reason}
              color={statusObj[row.status_reason]}
              sx={{ textTransform: 'capitalize', '& .MuiChip-label': { lineHeight: '18px' } }}
            />
          </Box>
        )
      }
    },
    {
      flex: 0.2,
      minWidth: 25,
      field: 'reason',
      headerName: 'Reason',
      renderCell: ({ row }) => <Typography variant='body2'>{row.reason}</Typography>
    }
  ]

  return (
    <Card>
      <CardHeader title='Leaves' />
      <Divider sx={{ m: '0 !important' }} />

      {employee && (
        <DataGrid
          autoHeight
          rows={employee.leaves_info}
          columns={columns}
          pageSize={pageSize}
          disableSelectionOnClick
          rowsPerPageOptions={[7, 10, 25, 50]}
          onPageSizeChange={newPageSize => setPageSize(newPageSize)}
        />
      )}
    </Card>
  )
}

export default EmployeeViewLeaves
