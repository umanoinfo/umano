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

const PreviewCard = ({ data, fromDate, toDate }) => {

  // ** Hook
  const theme = useTheme()
  if (data) {
    return (
      <Card sx={{ mb:3}}>
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
                  <Typography variant='body2'>
                    <MUITableCell>
                      <Typography variant='body2'>
                      Date Of Birth : {new Date (data.dateOfBirth).toLocaleDateString()} 
                      </Typography>
                    </MUITableCell>
                  </Typography>
                  <Typography variant='body2'>
                    <MUITableCell>
                      <Typography variant='body2'>
                        Monthly Basic Salary : {data.lumpySalary}  <small>AED</small>
                      </Typography>
                    </MUITableCell>
                  </Typography>
                  <Typography variant='body2'>
                    <MUITableCell>
                      <Typography variant='body2' sx={{fontWeight:'bold'}}>
                        Daily Basic Salary : {((data.lumpySalary)/30).toFixed(2)}  <small>AED</small>
                      </Typography>
                    </MUITableCell>
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item sm={6} xs={12}>
            
              <Box >
                <Typography sx={{textAlign : 'start' }} variant='h6'>End of service gratuity</Typography>
                <Table sx={{ maxWidth: '300px' }}>
                  <TableHead>
                   
                  </TableHead>
                  <TableBody>
                  <TableRow>
                      <MUITableCell>
                        <Typography variant='body2'>Joining Date :</Typography>
                      </MUITableCell>
                      {data.joiningDate && (
                        <MUITableCell>
                          <Typography variant='body2'>
                            <strong>{new Date(data.joiningDate).toLocaleDateString()}</strong> 
                          </Typography>
                        </MUITableCell>
                      )}
                    </TableRow>
                    <TableRow>
                      <MUITableCell>
                        <Typography variant='body2'>Duration :</Typography>
                      </MUITableCell>
                      {fromDate && (
                        <MUITableCell>
                          <Typography variant='body2'>
                             {new Date(fromDate).toLocaleDateString()} to {new Date(toDate).toLocaleDateString()}
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
                    <TableRow>
                      <MUITableCell>
                        <Typography variant='body2'>Service Days:</Typography>
                      </MUITableCell>
                      <MUITableCell>
                        <Typography variant='body2'>{data.allDays} Day</Typography>
                      </MUITableCell>
                    </TableRow>
                    <TableRow>
                      <MUITableCell>
                        <Typography variant='body2'>Unpaid Leave:</Typography>
                      </MUITableCell>
                      <MUITableCell>
                        <Typography variant='body2'>{data.unpaidLeaveTotal} Day</Typography>
                      </MUITableCell>
                    </TableRow>
                    <TableRow>
                      <MUITableCell>
                        <Typography variant='body2'>Service Years:</Typography>
                      </MUITableCell>
                      <MUITableCell>
                        <Typography variant='body2' sx={{fontWeight: 'bold'}}>{data.actualYears} Year</Typography>
                      </MUITableCell>
                    </TableRow>

                  </TableBody>
                </Table>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
        <Divider sx={{ mt: theme => `${theme.spacing(6.5)} !important`, mb: '0 !important' }} />
        { (Number(data.allDays) - Number(data.unpaidLeaveTotal)) >= 365 &&
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Item</TableCell>
                <TableCell>QTY (Days)</TableCell>
                <TableCell>Value</TableCell>
                <TableCell>Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
            {
              ((data.actualYears > 1) ) && <TableRow>
                <TableCell>For first 5 years</TableCell>
                <TableCell>{(((data.lessThanFiveDays)/365)*21).toFixed(2)}<small> Day</small></TableCell>
                
                <TableCell>
                  {((data.salaries_info[0].lumpySalary/30).toFixed(2))} <small>AED</small>
                </TableCell>
                <TableCell>
                  <strong>{data.lessThanFiveValue}</strong>
                  <small> AED</small>
                </TableCell>
              </TableRow>
            }
            {
              ((data.actualYears > 5) ) && <TableRow>
                <TableCell>For more 5 years</TableCell>
                <TableCell>{(((data.moreThanFiveDays)/365)*30).toFixed(2)}<small> Day</small></TableCell>
                
                <TableCell>
                  {((data.salaries_info[0].lumpySalary/30).toFixed(2))} <small>AED</small>
                </TableCell>
                <TableCell>
                  <strong>{data.moreThanFiveValue}</strong>
                  <small> AED</small>
                </TableCell>
              </TableRow>
            }

            </TableBody>
          </Table>
        </TableContainer>}

        { (Number(data.allDays) - Number(data.unpaidLeaveTotal)) < 365 &&
        <Typography sx={{textAlign:'center' }} p={4} width={'100%'} variant='body2'>
            <MUITableCell>
              <Typography variant='body2'>
                Days Less than 365  
              </Typography>
            </MUITableCell>
          </Typography>
       }
       <CardContent sx={{ pt: 8 }}>
          <Grid container>
            <Grid item xs={12} sm={7} lg={9} sx={{ order: { sm: 1, xs: 2 } }}>
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <Typography variant='body2'></Typography>
              </Box>

            </Grid>
            <Grid item xs={12} sm={5} lg={3} sx={{ mb: { sm: 0, xs: 4 }, order: { sm: 2, xs: 1 } }}>
              <CalcWrapper>
                <Typography variant='body2'>Total:</Typography>
                <Typography variant='body2' sx={{ color: 'text.primary', letterSpacing: '.25px', fontWeight: 600 }}>
                  {Number(data.endOfServeceTotalValue).toFixed(2)}
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
                {Number(data.endOfServeceTotalValue).toFixed(2)}
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
