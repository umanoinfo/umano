// ** MUI Imports
import Card from '@mui/material/Card'
import Divider from '@mui/material/Divider'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { DataGrid } from '@mui/x-data-grid'

const EmployeeViewSalary = ({ employee }) => {
  const [pageSize, setPageSize] = useState(10)
  if (employee) {
    employee.salaries_info.map((e, index) => {
      e.id = index + 1
    })
  }

  const columns = [
    {
      flex: 0.15,
      minWidth: 100,
      field: 'lumpySalary',
      headerName: 'Lumpy',
      renderCell: ({ row }) => (
        <Typography variant='body2'>{new Intl.NumberFormat().format(row.lumpySalary)} AED</Typography>
      )
    },
    {
      flex: 0.15,
      minWidth: 100,
      field: 'overtimeٍٍSalary',
      headerName: 'Overtime',
      renderCell: ({ row }) => (
        <Typography variant='body2'>{new Intl.NumberFormat().format(row.overtimeSalary)} AED</Typography>
      )
    },
    {
      flex: 0.15,
      minWidth: 100,
      field: 'date',
      headerName: 'Date',
      renderCell: ({ row }) => <Typography variant='body2'>{row.startChangeDate}</Typography>
    },
    {
      flex: 0.15,
      minWidth: 100,
      field: 'salaryChange',
      headerName: 'Change',
      renderCell: ({ row }) => <Typography variant='body2'>{row.salaryChange}</Typography>
    }
  ]

  return (
    <Card>
      <CardHeader title='Salaries' />
      <Divider sx={{ m: '0 !important' }} />

      {employee && (
        <DataGrid
          autoHeight
          rows={employee.salaries_info}
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

export default EmployeeViewSalary
