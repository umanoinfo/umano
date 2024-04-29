// ** MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Table from '@mui/material/Table'
import Divider from '@mui/material/Divider'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CardContent from '@mui/material/CardContent'
import { styled, useTheme } from '@mui/material/styles'
import TableContainer from '@mui/material/TableContainer'
import TableCell from '@mui/material/TableCell'

// ** Custom Components Imports
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'

// ** Configs
import themeConfig from 'src/configs/themeConfig'

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials'

const MUITableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: 0,
  padding: `${theme.spacing(1, 0)} !important`
}))

const CalcWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  '&:not(:last-of-type)': {
    marginBottom: theme.spacing(2)
  }
}))

// ** renders client column
const renderClient = employee => {
  if (employee.logo) {
    return <CustomAvatar src={employee.logo} sx={{ mr: 3, width: 45, height: 45 }} />
  } else {
    return (
      <CustomAvatar
        skin='light'
        color={employee.avatarColor || 'primary'}
        sx={{ mr: 3, width: 45, height: 45, fontSize: '1rem' }}
      >
        {getInitials(employee.firstName ? employee.firstName + ' ' + employee.lastName : '@')}
      </CustomAvatar>
    )
  }
}

const PreviewCard = ({ data, fromDate, toDate , lumpySalary }) => {
  let totalSalary = 0 ;
  if(data.flexible ){
     totalSalary =(( 
      Number(data.salaries_info[0].lumpySalary * (data.totalWorkingDaysCount / 30 )) -
      Number(data.totalDeductions) +
      Number(data.totalCompensations) -
      Number(data.totalEmployeeDeductions) +
      Number(data.totalEmployeeRewards)).toFixed(3)).toLocaleString('en-US');
  }else{
    totalSalary =  (+(
      Number(data.totalOffDayValue) +
      Number(data.totalholidayValue) +
      Number(data.salaries_info[0].lumpySalary * (data.totalWorkingDaysCount / 30 )) +
      Number(data.totalEarlyValue) -
      Number(data.totalDeductions) +
      Number(data.totalCompensations) -
      Number(data.totalEmployeeDeductions) +
      Number(data.totalEmployeeRewards)-
      Number(data.totalLeave)+
      Number(data.totalLateOverTimeValue)+
      Number(data.totalEarlyOverTimeValue)
    ).toFixed(3)).toLocaleString("en-US") ;
  }

  // ** Hook
  const theme = useTheme()
  if (data) {
    return (
      <Card>
        <CardContent>
          <Grid container>
            <Grid item sm={6} xs={12} sx={{ mb: { sm: 0, xs: 4 } }}>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {renderClient(data)}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
                    <Typography noWrap sx={{ color: 'text.primary', textTransform: 'capitalize', fontWeight: 'bold' }}>
                      {data.firstName} {data.lastName}
                    </Typography>
                    <Typography noWrap variant='caption'>
                      {data.email}
                    </Typography>
                  </Box>
                </Box>
                <Box mt={4}>
                  {data.employeePositions_info && (
                    <Typography variant='body2' sx={{ mb: 1 }}>
                      {data.employeePositions_info.map((e, index) => {
                        return (
                          <>
                            {' '}
                            {!e.endChangeDate && (
                              <CustomChip
                                key={index}
                                skin='light'
                                size='small'
                                label={e.positionTitle}
                                color='primary'
                                sx={{ mr: 1, textTransform: 'capitalize', '& .MuiChip-label': { lineHeight: '18px' } }}
                              />
                            )}
                          </>
                        )
                      })}
                    </Typography>
                  )}
                  <Typography variant='body2'>
                    <MUITableCell>
                      <Typography variant='body2'>
                        No. : {data.idNo} , Type : {data.employeeType}
                      </Typography>
                    </MUITableCell>
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item sm={6} xs={12}>
              <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                <Table sx={{ maxWidth: '300px' }}>
                  <TableHead>
                    <Typography variant='h6'> Payroll</Typography>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <MUITableCell>
                        <Typography variant='body2'>Form :</Typography>
                      </MUITableCell>
                      {fromDate && (
                        <MUITableCell>
                          <Typography variant='body2'>
                            From {new Date(fromDate).toLocaleDateString()} to {new Date(toDate).toLocaleDateString()}
                          </Typography>
                        </MUITableCell>
                      )}
                    </TableRow>
                    <TableRow>
                      <MUITableCell>
                        <Typography variant='body2'>Formula:</Typography>
                      </MUITableCell>
                      <MUITableCell>
                        <Typography variant='body2'>
                          {data.salaryFormulas_info[0].type} - {data.salaryFormulas_info[0].title}
                        </Typography>
                      </MUITableCell>
                    </TableRow>
                    {
                      !data.flexible &&
                        <TableRow>
                          <MUITableCell>
                            <Typography variant='body2'>Shift:</Typography>
                          </MUITableCell>
                          <MUITableCell>
                            <Typography variant='body2'>
                              {data.shift_info[0].times[0].timeIn} - {data.shift_info[0].times[0].timeOut}
                            </Typography>
                          </MUITableCell>
                        </TableRow>
                    }
                    <TableRow>
                      <MUITableCell>
                        <Typography variant='body2'>Working Days: </Typography>
                      </MUITableCell>
                      <MUITableCell>
                        <Typography variant='body2'> {data.totalWorkingDaysCount.toFixed(2)}</Typography>
                      </MUITableCell>
                    </TableRow>
                       <TableRow>
                      <MUITableCell>
                        <Typography variant='body2'>Absense Days: </Typography>
                      </MUITableCell>
                      <MUITableCell>
                        <Typography variant='body2'> {data.absenseDays.toFixed(2)}</Typography>
                      </MUITableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Box>
            </Grid>
          </Grid>
        </CardContent>

        <Divider />
      {
        !data.flexible ?
            <CardContent>
            <Grid container>
              <Grid item xs={12} sm={4} sx={{ display: 'flex' }}>
                <div>
                  <Typography variant='subtitle2' sx={{ mb: 3, color: 'text.primary', letterSpacing: '.1px' }}>
                    Salary (AED):
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <MUITableCell>
                            <Typography variant='body2'>Basic Salary:</Typography>
                          </MUITableCell>
                          <MUITableCell>
                            <Typography variant='body2' px={5}>
                              <strong>{(+data.salaries_info[0].lumpySalary).toLocaleString("en-US")}</strong>
                              <small style={{paddingLeft:5}}> AED</small>
                            </Typography>
                          </MUITableCell>
                        </TableRow>
                        <TableRow>
                          <MUITableCell>
                            <Typography variant='body2'>Daily Salary:</Typography>
                          </MUITableCell>
                          <MUITableCell>
                            <Typography variant='body2' px={5}>
                              <strong>{(+data.dailySalary).toLocaleString("en-US")}</strong>
                              <small style={{paddingLeft:5}}> AED</small>
                            </Typography>
                          </MUITableCell>
                        </TableRow>
                        {}
                        <TableRow>
                          <MUITableCell>
                            <Typography variant='body2'>Hourly Salary:</Typography>
                          </MUITableCell>
                          <MUITableCell>
                            <Typography variant='body2' px={5}>
                              <strong>{(+data.hourlySalary).toLocaleString("en-US")}</strong>
                              <small style={{paddingLeft:5}}> AED</small>
                            </Typography>
                          </MUITableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </div>
              </Grid>
              <Grid item xs={12} sm={4} px={4} sx={{ display: 'flex' }}>
                <div>
                  {/* <Typography variant='subtitle2' sx={{ mb: 3, color: 'text.primary', letterSpacing: '.1px' }}>
                    Salary (Hourly/AED):
                  </Typography> */}
                  <TableContainer>
                    <Table>
                      <TableBody>
                        <TableRow>
                        <Typography variant='body2' sx={{pt:10}}></Typography>
                        </TableRow>
                        <TableRow>
                          <MUITableCell>
                            <Typography variant='body2'>Over Time:</Typography>
                          </MUITableCell>
                          <MUITableCell>
                            <Typography variant='body2' px={5}>
                              <strong>{(data.hourlySalary * data.salaryFormulas_info[0].firstOverTime).toFixed(2)}</strong>
                              <small style={{paddingLeft:5}}> AED</small>
                            </Typography>
                          </MUITableCell>
                        </TableRow>
                        <TableRow>
                          <MUITableCell>
                            <Typography variant='body2'>Holiday:</Typography>
                          </MUITableCell>
                          <MUITableCell>
                            <Typography variant='body2' px={5}>
                              <strong>{(data.hourlySalary * data.salaryFormulas_info[0].holidayOverTime).toFixed(3)}</strong>
                              <small style={{paddingLeft:5}}> AED</small>
                            </Typography>
                          </MUITableCell>
                        </TableRow>
                        <TableRow>
                          <MUITableCell>
                            <Typography variant='body2'>Weekend:</Typography>
                          </MUITableCell>
                          <MUITableCell>
                            <Typography variant='body2' px={5}>
                              <strong>{(data.hourlySalary * data.salaryFormulas_info[0].weekendOverTime).toFixed(3)}</strong>
                              <small style={{paddingLeft:5}}> AED</small>
                            </Typography>
                          </MUITableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </div>
              </Grid>
              <Grid item xs={12} sm={4} sx={{ display: 'flex' }}>
                <div>
                  <Typography variant='subtitle2' sx={{ mb: 3, color: 'text.primary', letterSpacing: '.1px' }}>
                  Yearly Leaves ({new Date().getFullYear()}):
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <MUITableCell>
                            <Typography variant='body2'>Paid Leaves:</Typography>
                          </MUITableCell>
                          <MUITableCell>
                            <Typography variant='body2' px={5}>
                              <strong>
                                {data.yearlyTakenPaidLeaves.toFixed(1)}/{data.availablePaidLeave}
                              </strong>
                              <small style={{paddingLeft:5}}> Day</small>
                            </Typography>
                          </MUITableCell>
                        </TableRow>
                        <TableRow>
                          <MUITableCell>
                            <Typography variant='body2'>Unpaid Leaves:</Typography>
                          </MUITableCell>
                          <MUITableCell>
                            <Typography variant='body2' px={5}>
                              <strong>
                                {data.yearlyTakenUnpaidLeaves.toFixed(1)}/{data.availableUnpaidLeave}
                              </strong>
                              <small style={{paddingLeft:5}}> Day</small>
                            </Typography>
                          </MUITableCell>
                        </TableRow>
                        <TableRow>
                          <MUITableCell>
                            <Typography variant='body2'>Sick Leave:</Typography>
                          </MUITableCell>
                          <MUITableCell>
                            <Typography variant='body2' px={5}>
                              <strong>
                                {data.yearlyTakenSickLeaves.toFixed(1)}/{data.availableSickLeave}
                              </strong>
                              <small style={{paddingLeft:5}}> Day</small>
                            </Typography>
                          </MUITableCell>
                        </TableRow>
                        { data.gender == 'female' && <TableRow>
                          <MUITableCell>
                            <Typography variant='body2'>Parental Leave:</Typography>
                          </MUITableCell>
                          <MUITableCell>
                            <Typography variant='body2' px={5}>
                              <strong>
                                {data.yearlyTakenParentalLeaves.toFixed(1)}/{data.availableParentalLeave}
                              </strong>
                              <small style={{paddingLeft:5}}> Day</small>
                            </Typography>
                          </MUITableCell>
                        </TableRow>
                        }

                        {/* { data.gender == 'female' && <TableRow>
                          <MUITableCell>
                            <Typography variant='body2'>Maternity Leave:</Typography>
                          </MUITableCell>
                          <MUITableCell>
                            <Typography variant='body2' px={5}>
                              <strong>
                                {data.takenMaternityLeaves}/{data.availableMaternityLeave}
                              </strong>
                              <small style={{paddingLeft:5}}> Day</small>
                            </Typography>
                          </MUITableCell>
                        </TableRow>} */}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </div>
              </Grid>
            </Grid>
          </CardContent>
      :
      <></>
      }
        

        <Divider sx={{ mt: theme => `${theme.spacing(6.5)} !important`, mb: '0 !important' }} />

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Item</TableCell>
                <TableCell>QTY</TableCell>
                <TableCell>Value</TableCell>
                <TableCell>Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Monthly Lumpy Salary</TableCell>
                <TableCell> {(Number(data.totalWorkingDaysCount )/ 30).toFixed(2)} </TableCell>
                <TableCell>
                  {(+data.salaries_info[0].lumpySalary).toLocaleString("en-US")} <small>AED</small>
                </TableCell>
                <TableCell>
                  <strong>{((+data.salaries_info[0].lumpySalary) * (data.totalWorkingDaysCount / 30)).toFixed(2)}</strong>
                  <small> AED</small>
                </TableCell>
              </TableRow>
              {
                !data.flexible ?
                <>
                      <TableRow>
                      <TableCell>Early and late Hours</TableCell>
                      <TableCell>{data.totalEarlyHours + data.totalLateHours}</TableCell>
                      <TableCell>
                        {(+data.salaryFormulas_info[0].notJustifiedAbsenceHoure * data.hourlySalary * -1).toFixed(2).toLocaleString("en-US")}
                        <small> AED</small>
                      </TableCell>
                      <TableCell>
                        <strong>{(+data.totalEarlyValue).toLocaleString("en-US")}</strong>
                        <small> AED</small>
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell>Early and late OverTime Hours</TableCell>
                      <TableCell>{(data.totalEarlyOverTimeHours + data.totalLateOverTimeHours).toFixed(2)}</TableCell>
                      <TableCell>
                        {((+data.salaryFormulas_info[0].firstOverTime * data.hourlySalary).toFixed(3) ).toLocaleString("en-US")}
                        <small> AED</small>
                      </TableCell>
                      <TableCell>
                        <strong>{(+(Number(data.totalLateOverTimeValue) + Number(data.totalEarlyOverTimeValue)).toFixed(3)).toLocaleString("en-US")}</strong>
                        <small> AED</small>
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell>Holiday Hours</TableCell>
                      <TableCell>{data.totalholidayHours}</TableCell>
                      <TableCell>
                        {(+data.hourlySalary * data.salaryFormulas_info[0].holidayOverTime).toFixed(3).toLocaleString("en-US")}
                        <small> AED</small>
                      </TableCell>
                      <TableCell>
                        <strong>{(+data.totalholidayValue).toLocaleString("en-US")}</strong>
                        <small> AED</small>
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell>Off Day Hours</TableCell>
                      <TableCell>{data.totalOffDayHours}</TableCell>
                      <TableCell>
                        {(+data.hourlySalary * data.salaryFormulas_info[0].weekendOverTime).toFixed(3).toLocaleString("en-US")}
                        <small> AED</small>
                      </TableCell>
                      <TableCell>
                        <strong>{(+data.totalOffDayValue).toLocaleString("en-US")}</strong>
                        <small> AED</small>
                      </TableCell>
                    </TableRow>
                  </>
              :
              <></>

              }
             

              {data.compensations_array.map((comp, index) => {
                return (
                  <TableRow key={index}>
                    <TableCell>
                      {comp.title} <small> ( {comp.type} )</small>
                    </TableCell>
                    <TableCell>
                      {(+comp.fixedValue).toLocaleString("en-US")}
                      <small> AED</small> + {comp.percentageValue}
                      <small> %</small>
                    </TableCell>
                    <TableCell>
                      {(+comp.totalValue).toLocaleString("en-US")}
                      <small> AED</small>
                    </TableCell>
                    <TableCell>
                      <strong> {(+comp.totalValue).toLocaleString("en-US")}</strong>
                      <small> AED</small>
                    </TableCell>
                  </TableRow>
                )
              })}

              {data.deductions_array.map((deduction, index) => {
                return (
                  <TableRow key={index}>
                    <TableCell>
                      {deduction.title} <small> ( {deduction.type} )</small>
                    </TableCell>
                    <TableCell>
                      {(+deduction.fixedValue).toLocaleString("en-US")}
                      <small> AED</small> + {deduction.percentageValue}
                      <small> %</small>
                    </TableCell>
                    <TableCell>
                      {(+deduction.totalValue * -1).toFixed(3).toLocaleString("en-US")}
                      <small> AED</small>
                    </TableCell>
                    <TableCell>
                      <strong> {(+deduction.totalValue * -1).toFixed(3).toLocaleString("en-US")}</strong>
                      <small> AED</small>
                    </TableCell>
                  </TableRow>
                )
              })}

              {data.employee_deductions_info.map((deduction, index) => {
                return (
                  <TableRow key={index}>
                    <TableCell>
                      {deduction.reason} <small> ( {deduction.type} )</small>
                    </TableCell>
                    <TableCell>1</TableCell>
                    <TableCell>
                      {(+deduction.value).toLocaleString("en-US")}
                      <small> AED</small>
                    </TableCell>
                    <TableCell>
                      <strong> {(+deduction.value * -1).toFixed(3).toLocaleString("en-US")}</strong>
                      <small> AED</small>
                    </TableCell>
                  </TableRow>
                )
              })}

              {data.employee_rewards_info.map((reward, index) => {
                return (
                  <TableRow key={index}>
                    <TableCell>
                      {reward.reason} <small> ( {reward.type} )</small>
                    </TableCell>
                    <TableCell>1</TableCell>
                    <TableCell>
                      {reward.value}
                      <small> AED</small>
                    </TableCell>
                    <TableCell>
                      <strong> {reward.value}</strong>
                      <small> AED</small>
                    </TableCell>
                  </TableRow>
                )
              })}
              
              {!data.flexible && data.leaves_info.map((leave, index) => {
                return (
                  <TableRow key={index}>
                    <TableCell>
                      Leave <small> ({leave.type})</small> 
                    </TableCell>
                    <TableCell>{leave.time} hour</TableCell>
                    <TableCell>
                      -{ 100 - leave.paidValue}
                      <small> %</small>
                    </TableCell>
                    <TableCell>
                      { leave.type == 'hourly' && <strong> - {Number(((Number(leave.time) * data.hourlySalary) * (100 - Number(leave.paidValue)))/100).toFixed(3)}</strong>}
                      { leave.type == 'daily' && <strong> - {( Number((Number(leave.days)* data.dailySalary * (100 - Number(leave.paidValue)))/100).toFixed(3)) }</strong>}
                      <small> AED</small>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <CardContent sx={{ pt: 8 }}>
          <Grid container>
            <Grid item xs={12} sm={7} lg={9} sx={{ order: { sm: 1, xs: 2 } }}>
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <Typography variant='body2'></Typography>
              </Box>

            </Grid>
            <Grid item xs={12} sm={5} lg={3} sx={{ mb: { sm: 0, xs: 4 }, order: { sm: 2, xs: 1 } }}>
              <CalcWrapper>
                <Typography variant='body2'>Subtotal:</Typography>
                <Typography variant='body2' sx={{ color: 'text.primary', letterSpacing: '.25px', fontWeight: 600 }}>
                  {totalSalary}
                </Typography>
              </CalcWrapper>
              <CalcWrapper>
                <Typography variant='body2'>Tax:</Typography>
                <Typography variant='body2' sx={{ color: 'text.primary', letterSpacing: '.25px', fontWeight: 600 }}>
                  0%
                </Typography>
              </CalcWrapper>
              <Divider
                sx={{ mt: theme => `${theme.spacing(5)} !important`, mb: theme => `${theme.spacing(3)} !important` }}
              />
              <CalcWrapper>
                <Typography variant='body2'>Total:</Typography>
                <Typography variant='body2' sx={{ color: 'text.primary', letterSpacing: '.25px', fontWeight: 600 }}>
                  {totalSalary}
                </Typography>
              </CalcWrapper>
            </Grid>
          </Grid>
        </CardContent>

        
      </Card>
    )
  } else {
    return null
  }
}

export default PreviewCard
