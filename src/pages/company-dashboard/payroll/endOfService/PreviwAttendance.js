// ** React Imports
import { useState, useEffect, createRef } from 'react'

// ** Next Imports

import * as XLSX from 'xlsx'

// ** MUI Imports
import Box from '@mui/material/Box'
import Menu from '@mui/material/Menu'
import Grid from '@mui/material/Grid'
import { DataGrid } from '@mui/x-data-grid'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import toast from 'react-hot-toast'
import Loading from 'src/views/loading'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Custom Components Imports
import CustomChip from 'src/@core/components/mui/chip'

import { fetchData } from 'src/store/apps/attendance'

// ** Third Party Components
import axios from 'axios'

import { useSession } from 'next-auth/react'
import NoPermission from 'src/views/noPermission'

const AttendanceList = ({ attendances }) => {

  const [pageSize, setPageSize] = useState(31)

  const [loading, setLoading] = useState(false)

  const { data: session, status } = useSession()

  // ------------------------------- Table columns --------------------------------------------

  const columns = [
    {
      flex: 0.12,
      minWidth: 200,
      field: 'date',
      headerName: 'Date',
      renderCell: ({ row }) => {
        return (
          <>
            {new Date(row.date).toLocaleDateString()} {row.day}
          </>
        )
      }
    },
    {
      flex: 0.07,
      minWidth: 60,
      field: 'timeIn',
      headerName: 'In',
      renderCell: ({ row }) => {
        return <>{row._in}</>
      }
    },
    {
      flex: 0.07,
      minWidth: 60,
      field: 'timeOut',
      headerName: 'Out',
      renderCell: ({ row }) => {
        return <>{row._out}</>
      }
    },
    {
      flex: 0.07,
      minWidth: 80,
      field: 'lateHours',
      headerName: 'Late (R)',
      renderCell: ({ row }) => {
        return <>{row.lateHours != 0 && <Typography sx={{ fontSize: 14, color: 'red' }}>{row.lateHours}</Typography>}</>
      }
    },
    {
      flex: 0.07,
      minWidth: 80,
      field: 'earlyHours',
      headerName: 'Early (R)',
      renderCell: ({ row }) => {
        return (
          <>{row.earlyHours != 0 && <Typography sx={{ fontSize: 14, color: 'red' }}>{row.earlyHours}</Typography>}</>
        )
      }
    },
    {
      flex: 0.07,
      minWidth: 150,
      field: 'earlyOverTime',
      headerName: 'Early OverTime',
      renderCell: ({ row }) => {
        return (
          <>
            {row.earlyOverTimeHours != 0 && (
              <Typography sx={{ fontSize: 14, color: 'green' }}>{row.earlyOverTimeHours}</Typography>
            )}
          </>
        )
      }
    },
    {
      flex: 0.07,
      minWidth: 150,
      field: 'lateOverTime',
      headerName: 'Late overTime',
      renderCell: ({ row }) => {
        return (
          <>
            {row.lateOverTimeHours != 0 && (
              <Typography sx={{ fontSize: 14, color: 'green' }}>{row.lateOverTimeHours}</Typography>
            )}
          </>
        )
      }
    },
    {
      flex: 0.07,
      minWidth: 80,
      field: 'holiday',
      headerName: 'Holiday',
      renderCell: ({ row }) => {
        return <>{row.holidayDay && <Typography sx={{ fontSize: 14, color: 'green' }}>{row.totalHours}</Typography>}</>
      }
    },
    {
      flex: 0.07,
      minWidth: 80,
      field: 'offDay',
      headerName: 'Off Day',
      renderCell: ({ row }) => {
        return (
          <>
            {!row.workingDay && !row.holidayDay && row.totalHours != 0 && (
              <Typography sx={{ fontSize: 14, color: 'green' }}>{row.totalHours}</Typography>
            )}
          </>
        )
      }
    },
    {
      flex: 0.07,
      minWidth: 200,
      field: 'leavePayment',
      headerName: 'leave Time',
      renderCell: ({ row }) => {
        return (
          <>          
          <>
            {row.workingDay && row.leaveHourly && (
              <>
              {
              row.leaves.map((leave)=>{
                return (<>
                <div>{new Date(leave.date_from).getUTCHours()}:{new Date(leave.date_from).getUTCMinutes()}-{new Date(leave.date_to).getUTCHours()}:{new Date(leave.date_to).getUTCMinutes()} {"   ,   "}</div> <br/>
                </>)
              })
              }
              </>
            )}
          </>
          <>
          {row.workingDay && row.leaveDay && (
            <>
              All Day
            </>
          )}
        </>
          </>

        )
      }
    },
    {
      flex: 0.2,
      minWidth: 200,
      field: 'status',
      headerName: 'Status',
      renderCell: ({ row }) => {
        return (
          <>
            {!row.workingDay && (
              <CustomChip
                skin='light'
                size='small'
                label='Off day'
                color='warning'
                sx={{ textTransform: 'capitalize', '& .MuiChip-label': { lineHeight: '18px' } }}
              />
            )}
            {row.holidayDay && (
              <CustomChip
                skin='light'
                size='small'
                label='Holiday'
                color='error'
                sx={{ textTransform: 'capitalize', '& .MuiChip-label': { lineHeight: '18px' } }}
              />
            )}
            {!row.holidayDay && row.workingDay && (
              <CustomChip
                skin='light'
                size='small'
                label='Working'
                color='success'
                sx={{ textTransform: 'capitalize', '& .MuiChip-label': { lineHeight: '18px' } }}
              />
            )}
            {row.leaveDay && row.workingDay && (
              <CustomChip
                skin='light'
                size='small'
                label='leave Day'
                color='info'
                sx={{ mx: 1, textTransform: 'capitalize', '& .MuiChip-label': { lineHeight: '18px' } }}
              />
            )}
            {row.leaveHourly && row.workingDay && (
              <CustomChip
                skin='light'
                size='small'
                label='leave Hourly'
                color='primary'
                sx={{ mx: 1, textTransform: 'capitalize', '& .MuiChip-label': { lineHeight: '18px' } }}
              />
            )}
          </>
        )
      }
    }
  ]

  // ------------------------------------ View ---------------------------------------------

  if (loading) return <Loading header='Please Wait' description='Attendances is loading'></Loading>

  if (session && session.user && !session.user.permissions.includes('ViewAttendance'))
    return <NoPermission header='No Permission' description='No permission to view attendance'></NoPermission>

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <DataGrid
          autoHeight
          rows={attendances}
          columns={columns}
          pageSize={pageSize}
          disableSelectionOnClick
          rowsPerPageOptions={[10, 25, 50]}
          sx={{ '& .MuiDataGrid-columnHeaders': { borderRadius: 0 } }}
          onPageSizeChange={newPageSize => setPageSize(newPageSize)}
          getRowHeight={() => 'auto'}
        />
      </Grid>
    </Grid>
  )
}

export default AttendanceList
