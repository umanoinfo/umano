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
import { FormControlLabel, Icon } from '@mui/material'
import Link from 'src/@core/theme/overrides/link'
import { useRouter } from 'next/router'
import { useDispatch, useSelector } from 'react-redux'

import { fetchData } from 'src/store/apps/employeePosition'
import { DataGrid } from '@mui/x-data-grid'

const EmployeeViewPosition = ({ id, employee }) => {
  if (employee) {
    employee.employeePositions_info.map((e, index) => {
      e.id = index + 1
    })
  }

  const router = useRouter()

  const [permissionsGroup, setPermissionsGroup] = useState([])
  const [selectedPermissions, setSelectedPermissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [employeeId, setEmployeeId] = useState('')
  const [plan, setPlan] = useState('')
  const [userStatus, setUserStatus] = useState('')
  const [value, setValue] = useState('')
  const dispatch = useDispatch()
  const [pageSize, setPageSize] = useState(7)
  const store = useSelector(state => state.employeePosition)

  const columns = [
    {
      flex: 0.05,
      minWidth: 25,
      field: '#',
      headerName: '#',
      renderCell: ({ row }) => (
        <>
          <Typography variant='body2'>{row.id}</Typography>
        </>
      )
    },
    {
      flex: 0.3,
      minWidth: 100,
      field: 'title',
      headerName: 'Title',
      renderCell: ({ row }) => <Typography variant='body2'>{row.positionTitle}</Typography>
    },
    {
      flex: 0.15,
      minWidth: 100,
      field: 'startAt',
      headerName: 'Start at',
      renderCell: ({ row }) => <Typography variant='body2'>{row.startChangeDate}</Typography>
    },
    {
      flex: 0.15,
      minWidth: 100,
      field: 'endAt',
      headerName: 'End at',
      renderCell: ({ row }) => <Typography variant='body2'>{row.endChangeDate}</Typography>
    }
  ]

  return (
    <Card>
      <CardHeader title='Positions' />
      <Divider sx={{ m: '0 !important' }} />

      {employee && employee.employeePositions_info && (
        <DataGrid
          autoHeight
          rows={employee.employeePositions_info}
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

export default EmployeeViewPosition
