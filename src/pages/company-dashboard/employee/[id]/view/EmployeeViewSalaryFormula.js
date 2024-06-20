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
import Icon from 'src/@core/components/icon'
import { useRouter } from 'next/router'

const EmployeeViewSalary = ({ employee }) => {
  const [tabValue, setTabValue] = useState('Over Time')

  const handleChange = (event, newValue) => {
    setTabValue(newValue)
  }

  const router = useRouter()

  const handleEditRowOptions = () => {
    router.push('/company-dashboard/employee/' + employee._id + '/edit-employee/?tab=4')
  }

  return (
    <Card>
      <Typography variant='h6' style={{ padding: '10px' }} >Salary Formula <small><a href="#" onClick={handleEditRowOptions} ><Icon style={{ fontSize: '15px', marginLeft: '7px' }} icon='fa-regular:edit' /></a></small></Typography>

      <Divider sx={{ m: '0 !important' }} />

      {employee && employee.salary_formula_info[0] && (
        <Grid item size='sm' sm={12} md={12} sx={{ mt: 2 }}>
          <TabContext value={tabValue}>
            <TabList variant='fullWidth' onChange={handleChange} aria-label='full width tabs example'>
              <Tab value='Over Time' label='Over Time' />
              <Tab value='Absence' label='Absence' />
              <Tab value='Compensation' label='Allowance' />
            </TabList>
            <TabPanel value='Over Time'>
              <Typography sx={{ mb: 5 }}>Over Time</Typography>
              <Grid container>
                <Grid item sm={6} md={6}>
                  <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                    <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                      First over time :
                    </Typography>
                    {employee.salary_formula_info[0] && employee.salary_formula_info[0].firstOverTime && (
                      <Typography sx={{ fontWeight: 500 }}>{employee.salary_formula_info[0].firstOverTime}</Typography>
                    )}
                    <Typography variant='body2' sx={{ ml: 2, width: '100%' }}>
                      houre
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                    <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                      Second over time :
                    </Typography>
                    {employee.salary_formula_info[0] && employee.salary_formula_info[0].secondOverTime && (
                      <Typography sx={{ fontWeight: 500 }}>{employee.salary_formula_info[0].secondOverTime}</Typography>
                    )}
                    <Typography variant='body2' sx={{ ml: 2, width: '100%' }}>
                      houre
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                    <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                      Third over time :
                    </Typography>
                    {employee.salary_formula_info[0] && employee.salary_formula_info[0].thirdOverTime && (
                      <Typography sx={{ fontWeight: 500 }}>{employee.salary_formula_info[0].thirdOverTime}</Typography>
                    )}
                    <Typography variant='body2' sx={{ ml: 2, width: '100%' }}>
                      houre
                    </Typography>
                  </Box>
                </Grid>
                <Grid item sm={6} md={6}>
                  <Box sx={{ mb: 1, mt: 8, display: 'flex', alignItems: 'center' }}>
                    <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                      Holiday :
                    </Typography>
                    {employee.salary_formula_info[0] && employee.salary_formula_info[0].holidayOverTime && (
                      <Typography sx={{ fontWeight: 500 }}>
                        {employee.salary_formula_info[0].holidayOverTime}
                      </Typography>
                    )}
                    <Typography variant='body2' sx={{ ml: 2, width: '100%' }}>
                      houre
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                    <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                      Weekend :
                    </Typography>
                    {employee.salary_formula_info[0] && employee.salary_formula_info[0].weekendOverTime && (
                      <Typography sx={{ fontWeight: 500 }}>
                        {employee.salary_formula_info[0].weekendOverTime}
                      </Typography>
                    )}
                    <Typography variant='body2' sx={{ ml: 2, width: '100%' }}>
                      houre
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value='Absence'>
              <Grid container spacing={1} sx={{ px: 5 }}>
                <Grid item sm={12} md={6}>
                  <Typography sx={{ mt: 5, mb: 1 }}>Absence Days</Typography>
                  <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                    <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                      Justified :
                    </Typography>
                    {employee.salary_formula_info[0] && employee.salary_formula_info[0].justifiedAbsenceDay && (
                      <Typography sx={{ fontWeight: 500 }}>
                        {employee.salary_formula_info[0].justifiedAbsenceDay}
                      </Typography>
                    )}
                    <Typography variant='body2' sx={{ ml: 2, width: '100%' }}>
                      day
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                    <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                      Not Justified :
                    </Typography>
                    {employee.salary_formula_info[0] && employee.salary_formula_info[0].notJustifiedAbsenceDay && (
                      <Typography sx={{ fontWeight: 500 }}>
                        {employee.salary_formula_info[0].notJustifiedAbsenceDay}
                      </Typography>
                    )}
                    <Typography variant='body2' sx={{ ml: 2, width: '100%' }}>
                      day
                    </Typography>
                  </Box>

                </Grid>
                <Grid item sm={12} md={6}>
                  <Typography sx={{ mt: 5, mb: 1 }}>Absence Houre</Typography>
                  <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                    <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                      Justified :
                    </Typography>
                    {employee.salary_formula_info[0] && employee.salary_formula_info[0].justifiedAbsenceHoure && (
                      <Typography sx={{ fontWeight: 500 }}>
                        {employee.salary_formula_info[0].justifiedAbsenceHoure}
                      </Typography>
                    )}
                    <Typography variant='body2' sx={{ ml: 2, width: '100%' }}>
                      houre
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                    <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                      Not Justified :
                    </Typography>
                    {employee.salary_formula_info[0] && employee.salary_formula_info[0].notJustifiedAbsenceHoure && (
                      <Typography sx={{ fontWeight: 500 }}>
                        {employee.salary_formula_info[0].notJustifiedAbsenceHoure}
                      </Typography>
                    )}
                    <Typography variant='body2' sx={{ ml: 2, width: '100%' }}>
                      houre
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </TabPanel>
            <TabPanel value='Compensation'>
              <Grid container spacing={1} sx={{ px: 5 }}>
                <Grid item sm={12} md={12}>
                  <Typography sx={{ mt: 5, mb: 1 }}>End of service Allowance</Typography>
                  <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                    <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                      From 1 to 5 year :
                    </Typography>
                    {employee.salary_formula_info[0] && employee.salary_formula_info[0].compensationFrom1To5 && (
                      <Typography sx={{ fontWeight: 500 }}>
                        {employee.salary_formula_info[0].compensationFrom1To5}
                      </Typography>
                    )}
                    <Typography variant='body2' sx={{ ml: 2, width: '100%' }}>
                      day
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                    <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                      More than 5 year :
                    </Typography>
                    {employee.salary_formula_info[0] && employee.salary_formula_info[0].compensationMoreThan5 && (
                      <Typography sx={{ fontWeight: 500 }}>
                        {employee.salary_formula_info[0].compensationMoreThan5}
                      </Typography>
                    )}
                    <Typography variant='body2' sx={{ ml: 2, width: '100%' }}>
                      day
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                    <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                      Maximum end of service Allowance :
                    </Typography>
                    {employee.salary_formula_info[0] && employee.salary_formula_info[0].maxCompensation && (
                      <Typography sx={{ fontWeight: 500 }}>
                        {employee.salary_formula_info[0].maxCompensation}
                      </Typography>
                    )}
                    <Typography variant='body2' sx={{ ml: 2, width: '100%' }}>
                      year
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </TabPanel>
          </TabContext>
        </Grid>
      )}
      <Divider></Divider>
      <Typography sx={{ p: 2 }}>Allowances</Typography>
      {employee && employee.compensations_array && (
        <>
          <Box sx={{ px: 2 }}>
            {employee.compensations_array.map((comp, index) => {
              return (
                <CustomChip
                  key={index}
                  sx={{ m: 1 }}
                  rounded
                  label={
                    comp.type +
                    ' : ' +
                    comp.title +
                    ' - value :  ' +
                    comp.fixedValue +
                    'AED + ' +
                    comp.percentageValue +
                    '%'
                  }
                  skin='light'
                  color='success'
                />
              )
            })}
          </Box>
        </>
      )}

      <Divider></Divider>
      <Typography sx={{ px: 2 }}>Deductions</Typography>
      {employee && employee.deductions_array && (
        <>
          <Box sx={{ p: 2 }}>
            {employee.deductions_array.map((comp, index) => {
              return (
                <CustomChip
                  key={index}
                  sx={{ m: 1 }}
                  rounded
                  label={
                    comp.type +
                    ' : ' +
                    comp.title +
                    ' - value :  ' +
                    comp.fixedValue +
                    'AED + ' +
                    comp.percentageValue +
                    '%'
                  }
                  skin='light'
                  color='error'
                />
              )
            })}
          </Box>
        </>
      )}
    </Card>
  )
}

export default EmployeeViewSalary
