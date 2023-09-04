// ** MUI Imports
import Card from '@mui/material/Card'
import Divider from '@mui/material/Divider'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { TabContext, TabList, TabPanel } from '@mui/lab'
import { Tab } from '@mui/material'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import CustomChip from 'src/@core/components/mui/chip'
import { useRouter } from 'next/router'
import IconifyIcon from 'src/@core/components/icon'

const EmployeeViewAttendance = ({ employee }) => {
  const [tabValue, setTabValue] = useState('Over Time')

  const router = useRouter()
  
  const handleEditRowOptions = () => {
    router.push('/company-dashboard/employee/' + employee._id + '/edit-employee/?tab=3')
  }

  return (
    <Card>

      <Typography variant='h6' style={{padding:'10px'}} >Attendance <small><a href="#" onClick={handleEditRowOptions} ><IconifyIcon style={{fontSize: '15px' , marginLeft : '7px'}} icon='fa-regular:edit' /></a></small></Typography>

      <Divider sx={{ m: '0 !important' }} />

      {employee && employee.shift_info[0] && (
        <Grid item size='sm' sm={12} md={12} sx={{ mt: 2 }}>
          <Grid item sm={12} md={12}>
            <Typography sx={{ mt: 2, mb: 3, px: 2, fontWeight: 600 }}>Times</Typography>
            {employee.shift_info[0].times[0].timeIn && (
              <Box sx={{ p: 2, mb: 1, display: 'flex', alignItems: 'center' }}>
                <Grid container spacing={1}>
                  <Grid item sm={12} md={3}>
                    <small>Time in</small>
                    <Typography sx={{ mb: 3, fontWeight: 500 }}>{employee.shift_info[0].times[0].timeIn}</Typography>
                  </Grid>
                  <Grid item sm={12} md={3}>
                    <small>Time out</small>
                    <Typography sx={{ mb: 3, fontWeight: 500 }}>{employee.shift_info[0].times[0].timeOut}</Typography>
                  </Grid>

                  <Grid item sm={12} md={3}>
                    <small>Available late</small>
                    <Typography sx={{ mb: 3, fontWeight: 500 }}>
                      {employee.shift_info[0].times[0].availableLate}
                    </Typography>
                  </Grid>
                  <Grid item sm={12} md={3}>
                    <small>Available early</small>
                    <Typography sx={{ mb: 3, fontWeight: 500 }}>
                      {employee.shift_info[0].times[0].availableEarly}
                    </Typography>
                  </Grid>

                  {/* <Grid item sm={12} md={1.7}>
                    <small>1st overtime</small>
                    <Typography sx={{ mb: 3, fontWeight: 500 }}>{employee.shift_info[0].times[0]['1st']}</Typography>
                  </Grid>
                  <Grid item sm={12} md={1.7}>
                    <small>2nd overtime</small>
                    <Typography sx={{ mb: 3, fontWeight: 500 }}>{employee.shift_info[0].times[0]['2nd']}</Typography>
                  </Grid>
                  <Grid item sm={12} md={1.7}>
                    <small>3rd overtime</small>
                    <Typography sx={{ mb: 3, fontWeight: 500 }}>{employee.shift_info[0].times[0]['3rd']}</Typography>
                  </Grid> */}
                </Grid>
              </Box>
            )}
          </Grid>
        </Grid>
      )}
      <Divider></Divider>
      <Typography sx={{ p: 2 }}>Available Leaves</Typography>
      {employee && employee.compensations_array && (
        <>
          <Grid container spacing={1} sx={{ px: 3, mt: 3, mb: 3 }}>
            <Grid item sm={12} md={4}>
              <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                  Justified : {employee.availableJustifiedLeaves} day
                </Typography>
              </Box>
            </Grid>
            <Grid item sm={12} md={4}>
              <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                  Not Justified : {employee.availableNotJustifiedLeaves} day
                </Typography>
              </Box>
            </Grid>
            <Grid item sm={12} md={4}>
              <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                  Sick Leave: {employee.availableSickLeaves} day
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </>
      )}
    </Card>
  )
}

export default EmployeeViewAttendance
