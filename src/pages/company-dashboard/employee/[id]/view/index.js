// ** React Imports
import { useCallback, useEffect, useRef, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import Select from '@mui/material/Select'
import Switch from '@mui/material/Switch'
import Divider from '@mui/material/Divider'
import Icon from 'src/@core/components/icon'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import axios from 'axios'
import { useParams } from 'next/navigation'

import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

// ** Data
import { GetHealthInsuranceTypes, GetSourceOfHire, GetEmployeesType, GetMaritalStatus } from 'src/local-db'

// ** Custom Components
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials'
import Link from 'next/link'
import { useRouter } from 'next/router'

const roleColors = {
  admin: 'error',
  editor: 'info',
  author: 'warning',
  maintainer: 'success',
  subscriber: 'primary'
}

const statusColors = {
  active: 'success',
  pending: 'warning',
  inactive: 'secondary'
}

// ** Styled <sup> component
const Sup = styled('sup')(({ theme }) => ({
  top: '0.2rem',
  left: '-0.6rem',
  position: 'absolute',
  color: theme.palette.primary.main
}))

// ** Styled <sub> component
const Sub = styled('sub')({
  fontWeight: 300,
  fontSize: '1rem',
  alignSelf: 'flex-end'
})

const EmployeeViewLeft = ({  }) => {
 const router = useRouter();
  const { id } = router.query;
  console.log(id);
  const [grossSalary , setGrossSalary]=useState(0)
  const [employee , setEmployee ] = useState() ;
 
  const joiningDate = employee ? new Date(employee.joiningDate).toLocaleDateString().toString() : new Date().toLocaleDateString().toString();

  const newArray = employee?.employeePositions_info.filter((pos)=>{
    return(pos.endChangeType == "onPosition")
  })
  const printRef = useRef();
  async function saveCapture() {
    const elemente = printRef.current
    const canvas = await html2canvas(elemente)
    const data = canvas.toDataURL('image/png')

    const pdf = new jsPDF()
    const imgProperties = pdf.getImageProperties(data)
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width

    pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save('print.pdf')

    return data
  }

  const getEmployee =   () => {
    let data = { id: id }

    // setIsLoading(true)

    axios
      .post('/api/company-employee/full-employee/', { data })
      .then(function (response) {
        // setIsLoading(false)
        let employee = response.data.data[0] ;
        setEmployee(employee)
      })
      .catch(function (error) {
        // setIsLoading(false)
      })
    }  ;
  useEffect(()=>{
    getEmployee();
  },[id])
  
  const assumegrossSalary =  ()=>{
    
    const lumpySalary = employee?.salaries_info[0]?.lumpySalary | 0
    let deductions = 0
    let compensations = 0
    employee?.deductions_array?.map((ded)=>{
      deductions +=  Number(ded.fixedValue)
      deductions += ((Number(ded.percentageValue) *lumpySalary)/100)
    })
    employee?.compensations_array?.map((con)=>{
      compensations +=  Number(con.fixedValue)
      compensations += ((Number(con.percentageValue) *lumpySalary)/100)
    })
    setGrossSalary  (lumpySalary - deductions + compensations)
  }  ;

  useEffect(()=>{
    assumegrossSalary()
  },[ ])

  const handleEditRowOptions = () => {
    router.push('/company-dashboard/employee/' + employee._id + '/edit-employee')
  }

  if (employee) {
    return (
      <Grid container spacing={6} >
        <Grid item xs={12}>
          <Card ref={printRef} style={{padding:'10rem;'}}>
            <CardContent>
            <CardContent sx={{ pt: 15, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
              
              {employee.logo && employee.logo.length ? (
                <CustomAvatar
                  src={employee.logo}
                  variant='rounded'
                  alt={employee.name}
                  sx={{ width: 120, height: 120, fontWeight: 600, mb: 4, fontSize: '3rem' }}
                />
              ) : (
                <CustomAvatar
                  skin='light'
                  variant='rounded'
                  color={employee.avatarColor}
                  sx={{ width: 120, height: 120, fontWeight: 600, mb: 4, fontSize: '3rem' }}
                >
                  {getInitials(employee.firstName + ' ' + employee.lastName)}
                </CustomAvatar>
              )}
              <Typography variant='h6' sx={{ mb: 2 }}>
                {employee.firstName + ' ' + employee.lastName} 
              </Typography>
              
              

              {newArray.map((pos , index)=>{
                if(pos.endChangeType == "onPosition"){
                    return (<span key={index} style={{margin:'5px'}}><CustomChip skin='light' label={pos.positionTitle} /></span>)
                }
              })}
              
            </CardContent>

            <CardContent>
              <Typography variant='h6'>Summary <small><a href="#" onClick={handleEditRowOptions} ><Icon style={{fontSize: '15px' , marginLeft : '7px'}} icon='fa-regular:edit' /></a></small></Typography>
              <Divider sx={{ mt: theme => `${theme.spacing(4)} !important` }} />
              <Grid container spacing={2}>
              <Grid Item xs={6}>
              <Box sx={{ pt: 2, pb: 1 }}>
                {employee.firstName && (
                  <Box sx={{ display: 'flex', mb: 2.7 }}>
                    <Typography variant='subtitle2' sx={{ mr: 2, color: 'text.primary' }}>
                      Employee name:
                    </Typography>
                    <Typography variant='body2'>{employee.firstName + ' ' + employee.lastName} </Typography>
                  </Box>
                )}
                {employee.email && (
                  <Box sx={{ display: 'flex', mb: 2.7 }}>
                    <Typography variant='subtitle2' sx={{ mr: 2, color: 'text.primary' }}>
                      Email:
                    </Typography>
                    <Typography variant='body2'>{employee.email}</Typography>
                  </Box>
                )}
                {employee.idNo && (
                  <Box sx={{ display: 'flex', mb: 2.7 }}>
                    <Typography variant='subtitle2' sx={{ mr: 2, color: 'text.primary' }}>
                      ID No.:
                    </Typography>
                    <Typography variant='body2'>{employee.idNo}</Typography>
                  </Box>
                )}
                {employee.dateOfBirth && (
                  <Box sx={{ display: 'flex', mb: 2.7 }}>
                    <Typography variant='subtitle2' sx={{ mr: 2, color: 'text.primary' }}>
                    Date Of Birth:
                    </Typography>
                    <Typography variant='body2'>{new Date(employee.dateOfBirth).toDateString()}</Typography>
                  </Box>
                )}
                {employee.gender && (
                  <Box sx={{ display: 'flex', mb: 2.7 }}>
                    <Typography variant='subtitle2' sx={{ mr: 2, color: 'text.primary' }}>
                    Gender:
                    </Typography>
                    <Typography variant='body2'>{employee.gender}</Typography>
                  </Box>
                )}
                {employee.maritalStatus && (
                  <Box sx={{ display: 'flex', mb: 2.7 }}>
                    <Typography variant='subtitle2' sx={{ mr: 2, color: 'text.primary' }}>
                    Martial Status :
                    </Typography>
                    <Typography variant='body2'>{employee.martialStatus}</Typography>
                  </Box>
                )}
                    {employee.type && (
                    <Box sx={{ display: 'flex', mb: 2.7 }}>
                        <Typography variant='subtitle2' sx={{ mr: 2, color: 'text.primary' }}>
                        CME Type :
                        </Typography>
                        <Typography variant='body2'>{employee.type}</Typography>
                    </Box>
                    )}
                    
                    {grossSalary > 0 && (
                    <Box sx={{ display: 'flex', mb: 2.7 }}>
                        <Typography variant='subtitle2' sx={{ mr: 2, color: 'text.primary' }}>
                        Basic salary:
                        </Typography>
                        <Typography variant='body2'>{employee?.salaries_info[0]?.lumpySalary} AED</Typography>
                    </Box>
                    )}  
                </Box>
              </Grid>
              <Grid item xs={6}>
                    <Box>
 
                    {grossSalary > 0 && (
                    <Box sx={{ display: 'flex', mb: 2.7 }}>
                        <Typography variant='subtitle2' sx={{ mr: 2, color: 'text.primary' }}>
                        Gross salary:
                        </Typography>
                        <Typography variant='body2'>{grossSalary} AED</Typography>
                    </Box>
                    )}              
                    {employee.country_info[0] && (
                    <Box sx={{ display: 'flex', mb: 2.7 }}>
                        <Typography variant='subtitle2' sx={{ mr: 2, color: 'text.primary' }}>
                        Nationality:
                        </Typography>
                        <Typography variant='body2'>{employee.country_info[0].name}</Typography>
                    </Box>
                    )}
                    {employee.healthType && (
                    <Box sx={{ display: 'flex', mb: 2.7 }}>
                        <Typography variant='subtitle2' sx={{ mr: 2, color: 'text.primary' }}>
                        Health insurance type:
                        </Typography>
                        <Typography variant='body2'>{GetHealthInsuranceTypes(employee.healthType)}</Typography>
                    </Box>
                    )}
                    {employee.sourceOfHire && (
                    <Box sx={{ display: 'flex', mb: 2.7 }}>
                        <Typography variant='subtitle2' sx={{ mr: 2, color: 'text.primary' }}>
                        Source of Hire:
                        </Typography>
                        <Typography variant='body2'>{GetSourceOfHire(employee.sourceOfHire)}</Typography>
                    </Box>
                    )}
                    {employee.employeeType && (
                    <Box sx={{ display: 'flex', mb: 2.7 }}>
                        <Typography variant='subtitle2' sx={{ mr: 2, color: 'text.primary' }}>
                        Employee Type:
                        </Typography>
                        <Typography variant='body2'>{GetEmployeesType(employee.employeeType)}</Typography>
                    </Box>
                    )}
                    {employee.maritalStatus && (
                    <Box sx={{ display: 'flex', mb: 2.7 }}>
                        <Typography variant='subtitle2' sx={{ mr: 2, color: 'text.primary' }}>
                        Marital status:
                        </Typography>
                        <Typography variant='body2'>{GetMaritalStatus(employee.maritalStatus)}</Typography>
                    </Box>
                    )}
                    {employee.otherEmail && (
                    <Box sx={{ display: 'flex', mb: 2.7 }}>
                        <Typography variant='subtitle2' sx={{ mr: 2, color: 'text.primary' }}>
                        Other email:
                        </Typography>
                        <Typography variant='body2'>{employee.otherEmail}</Typography>
                    </Box>
                    )}
                    {employee.mobilePhone && (
                    <Box sx={{ display: 'flex', mb: 2.7 }}>
                        <Typography variant='subtitle2' sx={{ mr: 2, color: 'text.primary' }}>
                        Mobile phone:
                        </Typography>
                        <Typography variant='body2'>{employee.mobilePhone}</Typography>
                    </Box>
                    )}
                    {employee.workPhone && (
                    <Box sx={{ display: 'flex', mb: 2.7 }}>
                        <Typography variant='subtitle2' sx={{ mr: 2, color: 'text.primary' }}>
                            Work Phone:
                        </Typography>
                        <Typography variant='body2'>{employee.workPhone}</Typography>
                    </Box>
                    )}
                    {employee.workPhone && employee.extension && (
                    <Box sx={{ display: 'flex', mb: 2.7 }}>
                        <Typography variant='subtitle2' sx={{ mr: 2, color: 'text.primary' }}>
                        Work phone:
                        </Typography>
                        <Typography variant='body2'>
                        {employee.workPhone} - {employee.extension}
                        </Typography>
                    </Box>
                    )}

                    {employee.emergencyContact && (
                    <Box sx={{ display: 'flex', mb: 2.7 }}>
                        <Typography variant='subtitle2' sx={{ mr: 2, color: 'text.primary' }}>
                        Emergency contact information:
                        </Typography>
                        <Typography variant='body2'>{employee.emergencyContact}</Typography>
                    </Box>
                    )}
                    {employee.address && (
                    <Box sx={{ display: 'flex', mb: 2.7 }}>
                        <Typography variant='subtitle2' sx={{ mr: 2, color: 'text.primary' }}>
                        Address:
                        </Typography>
                        <Typography variant='body2'>{employee.address}</Typography>
                    </Box>
                    )}
                    {employee.joiningDate && (
                    <Box sx={{ display: 'flex', mb: 2.7 }}>
                        <Typography variant='subtitle2' sx={{ mr: 2, color: 'text.primary' }}>
                        Joining Date:
                        </Typography>
                        <Typography variant='body2'>{joiningDate}</Typography>
                    </Box>
                    )}
                </Box>
              </Grid>
              </Grid>
            </CardContent>
            <CardContent>
                <Typography  variant='h6'>
                    Positions
                </Typography>
                <ul>
                {
                    employee.employeePositions_info.map((position)=>{

                        return (<>
                            <li>
                                <Box sx={{ display: 'flex', mb: 2.7 }}>
                                    <Typography variant='subtitle2' sx={{ mr: 2, color: 'text.primary' }}>
                                        Position:
                                    </Typography>
                                    <Typography variant='body2'>{position.positionTitle } - {position.startChangeDate} - {position.endChangeDate}</Typography>
                                </Box>
                            </li>
                            </>
                        );
                        
                    })
                }
                </ul>
                <Divider></Divider>
            </CardContent>
            <CardContent>
                <Typography  variant='h6'> 
                    Attendance
                </Typography>
                {employee.shift_info?.[0] && (
                    <Box sx={{ display: 'flex', mb: 2.7 }}>
                        <Typography variant='subtitle2' sx={{ mr: 2, color: 'text.primary' }}>
                            Shift
                        </Typography>
                        <Typography variant='body2'>{employee.shift_info[0].title   }</Typography>
                    </Box>
                )}
                <Divider></Divider>
            </CardContent>
                    
            <CardContent>
                <Typography  variant='h6'>
                    Salary Formula
                </Typography>
                
                {
                    employee?.salary_formula_info?.[0] && (
                    <Box sx={{ display: 'flex', mb: 2.7 }}>
                        <Typography variant='subtitle2' sx={{ mr: 2, color: 'text.primary' }}>
                            {employee.salary_formula_info[0].title }
                        </Typography>
                        <Typography variant='body2'>{employee.salary_formula_info[0].type   }</Typography>
                    </Box>
                    )
                }
                <Typography > Allowances </Typography>
                <ul>
                {
                        employee?.compensations_array && ( 
                            employee?.compensations_array?.map((comp)=>{
                            return <>
                              <li>
                                {comp.title} - {comp.type}
                              </li>
                            </>
                        })
                        )
                  }
                </ul>
                <Typography > Deductions </Typography>
                <ul>
                {
                        employee?.deductions_array && ( 
                            employee?.deductions_array?.map((comp)=>{
                            return <>
                              <li>
                                {comp.title} - {comp.type}
                              </li>
                            </>
                        })
                        )
                  }
                </ul>
                <Divider></Divider>
            </CardContent>
            <CardContent>
                <Typography  variant='h6'>
                    Salary
                </Typography>
                <ul>
                  {
                    employee?.salaries_info?.[0] && 
                    employee?.salaries_info?.map((salary)=>{
                      return <>
                        <li>
                          <Grid container>
                            <Grid item xs={2}>
                              {Number(salary.lumpySalary).toLocaleString()} 
                            </Grid>
                            <Grid item xs={1}>
                                AED 
                            </Grid>
                            <Grid item xs={2}>
                              {new Date(salary.startChangeDate).toLocaleDateString()}
                            </Grid>
                          </Grid>
                        </li>
                      </>
                    })
                    
                  }
                </ul>
                
                <Divider></Divider>
            </CardContent>

          </CardContent>
          </Card>
          <div style={{ padding: '30px' }}>
              <Button sx={{ mr: 4, mb: 2 }} color='primary' onClick={saveCapture} variant='outlined'>
                print
              </Button>
              {/* <Button sx={{ mr: 4, mb: 2 }} color='warning' variant='outlined'>
                send to email
              </Button> */}
            </div>
        </Grid>
      </Grid>
    )
  } else {
    <span>No data</span>
  }
}

export default EmployeeViewLeft
