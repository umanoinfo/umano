// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { useRef } from 'react'

import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { useEffect } from 'react'
import axios from 'axios'
import { useState } from 'react'
import Loading from 'src/views/loading'

const Slip = ({ id }) => {
  // ** Hooks

  const printRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [payroll, setPayroll] = useState()

  const getPayroll = () => {
    setLoading(true);
    axios.get('/api/payroll/' + id, {}).then(res => {
      setPayroll(res.data.data[0])
      setLoading(false)
    }).catch((err)=>{})
  };

  useEffect(() => {
    getPayroll()
  }, [ ])



  async function saveCapture() {
    setLoading(true);
    const elemente = printRef.current
    const canvas = await html2canvas(elemente)
    const data = canvas.toDataURL('image/png')

    const pdf = new jsPDF()
    const imgProperties = pdf.getImageProperties(data)
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width

    pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save('print.pdf')
    setLoading(false);
    
return data
  }

  //   --------------------------- View ----------------------------------------------

  if (loading) return <Loading header='Please Wait'></Loading>

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card style={{ padding: '30px' }} ref={printRef}>
          <h2 style={{ margin: '30px', textAlign: 'center' }}>Salary Slip</h2>
          {/* <Box style={{ border: '1px solid black', margin: '5px', textAlign: 'center' }}> address</Box> */}

          <div item xs={12} style={{ margin: '20px', display: 'flex' }}>
            <div style={{ width: '50%', padding: '5px' }} xs={12} md={6}>
              <div item xs={12}>
                <span style={{ fontWeight: 'bold' }}>Name : </span> {payroll.name}
              </div>
              <div item xs={12}>
                <span style={{ fontWeight: 'bold' }}>Designation : </span>
                {payroll.employeePositions_info.map(val => {
                  return val.positionTitle + ' , '
                })}
              </div>
              <div item xs={12}>
                <span style={{ fontWeight: 'bold' }}>Date : </span>
                {payroll.fromDate.substring(0, 10) + ' - ' + payroll.toDate.substring(0, 10)}
              </div>
              <div item xs={12}>
                <span style={{ fontWeight: 'bold' }}>Joining Date : </span>
                {payroll.joiningDate.substring(0, 10)}
              </div>
            </div>
            <div style={{ width: '50%', padding: '5px' }} xs={12} md={6}>
              <div item xs={12}>
                <span style={{ fontWeight: 'bold' }}>Basic Salary : </span>
                {payroll.lumpySalary} AED
              </div>
              <div item xs={12}>
                <span style={{ fontWeight: 'bold' }}>Email : </span>
                {payroll.email}
              </div>
              <div item xs={12}>
                <span style={{ fontWeight: 'bold' }}>ID Number : </span>
                {payroll.idNo}
              </div>
              <div item xs={12}>
                <span style={{ fontWeight: 'bold' }}>Phone :</span>
                {payroll.mobilePhone}
              </div>
            </div>
          </div>
          <div item xs={12} style={{ margin: '20px', display: 'flex' }}>
            <div style={{ margin: '5px', width: '50%', border: '1px solid black' }} xs={12} md={6}>
              <h4 style={{ margin: '5px', textAlign: 'center' }}>Deduction</h4>

              <div style={{ width: '100%', display: 'flex' }}>
                <div
                  style={{
                    borderRight: '1px solid black',
                    borderTop: '1px solid black',
                    borderBottom: '1px solid black',
                    width: '50%',
                    textAlign: 'center'
                  }}
                >
                  Salary head
                </div>
                <div
                  style={{
                    borderLeft: '1px solid black',
                    borderTop: '1px solid black',
                    borderBottom: '1px solid black',
                    width: '50%',
                    textAlign: 'center'
                  }}
                >
                  Amount
                </div>
              </div>
              <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap' }}>
                {
                  !payroll.flexible &&
                  <>
                    <div style={{ width: '50%', textAlign: 'center', padding: '5px', borderRight: '1px solid black' }}>
                    Early and late Hours
                    </div>
                    <div style={{ width: '50%', textAlign: 'center', padding: '5px', borderLeft: '1px solid black' }}>
                      {payroll.totalEarlyValue} AED
                    </div>
                  </>
                }
                {/*  */}
                <div style={{ width: '50%', textAlign: 'center', padding: '5px', borderRight: '1px solid black' }}>
                  Monthly Deductions
                </div>
                <div style={{ width: '50%', textAlign: 'center', padding: '5px', borderLeft: '1px solid black' }}>
                -{payroll.totalDeductions} AED
                </div>
                {/*  */}
                <div style={{ width: '50%', textAlign: 'center', padding: '5px', borderRight: '1px solid black' }}>
                  Employee Deductions
                </div>
                <div style={{ width: '50%', textAlign: 'center', padding: '5px', borderLeft: '1px solid black' }}>
                -{payroll.totalEmployeeDeductions} AED
                </div>
                {/*  */}
                {
                  !payroll.flexible &&
                  <>
                    <div style={{ width: '50%', textAlign: 'center', padding: '5px', borderRight: '1px solid black' }}>
                      Leaves
                    </div>
                    <div style={{ width: '50%', textAlign: 'center', padding: '5px', borderLeft: '1px solid black' }}>
                      -{payroll.totalLeave.toFixed(2)} AED
                    </div>
                  </>
                }
                {/*  */}
                <div style={{ width: '50%', textAlign: 'center', padding: '5px', borderRight: '1px solid black' }}>
          
                </div>
                <div style={{ width: '50%', textAlign: 'center', padding: '5px', borderLeft: '1px solid black' }}>
            
                </div>
                {/*  */}
                <div style={{ width: '100%', display: 'flex' }}>
                  <div
                    style={{
                      border: '1px solid black',
                      borderLeft: '0px',
                      width: '50%',
                      textAlign: 'center',
                      padding: '5px'
                    }}
                  >
                
                  </div>
                  <div
                    style={{
                      border: '1px solid black',
                      borderRight: '0px',
                      width: '50%',
                      textAlign: 'center',
                      padding: '5px'
                    }}
                  >
                  
                  </div>
                </div>
              </div>
            </div>
            <div style={{ margin: '5px', width: '50%', border: '1px solid black' }} xs={12} md={6}>
              <h4 style={{ margin: '5px', textAlign: 'center' }}>Earnings</h4>

              <div style={{ width: '100%', display: 'flex' }}>
                <div
                  style={{
                    borderRight: '1px solid black',
                    borderTop: '1px solid black',
                    borderBottom: '1px solid black',
                    width: '50%',
                    textAlign: 'center'
                  }}
                >
                  salary head
                </div>
                <div
                  style={{
                    borderLeft: '1px solid black',
                    borderTop: '1px solid black',
                    borderBottom: '1px solid black',
                    width: '50%',
                    textAlign: 'center'
                  }}
                >
                  Amount
                </div>
              </div>
              <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap' }}>
              {
                !payroll.flexible &&
                <>
                  <div style={{ width: '50%', textAlign: 'center', padding: '5px', borderRight: '1px solid black' }}>
                    Holiday Hours
                  </div>
                  <div style={{ width: '50%', textAlign: 'center', padding: '5px', borderLeft: '1px solid black' }}>
                    {payroll.totalholidayValue} <small>AED</small>
                  </div>
                  <div style={{ width: '50%', textAlign: 'center', padding: '5px', borderRight: '1px solid black' }}>
                    Overtime
                  </div>
                  <div style={{ width: '50%', textAlign: 'center', padding: '5px', borderLeft: '1px solid black' }}>
                    {(payroll.totalEarlyOverTimeValue +  payroll.totalLateOverTimeValue).toFixed(2)} <small>AED</small>
                  </div>
                  <div style={{ width: '50%', textAlign: 'center', padding: '5px', borderRight: '1px solid black' }}>
                    Off Day Hours	
                  </div>
                  <div style={{ width: '50%', textAlign: 'center', padding: '5px', borderLeft: '1px solid black' }}>
                    {payroll.totalOffDayValue} <small>AED</small>
                  </div>
                </>
                
                }
                <div style={{ width: '50%', textAlign: 'center', padding: '5px', borderRight: '1px solid black' }}>
                  Monthly Compensations
                </div>
                <div style={{ width: '50%', textAlign: 'center', padding: '5px', borderLeft: '1px solid black' }}>
                  {payroll.totalCompensations} <small>AED</small>
                </div>
                {/*  */}
                <div style={{ width: '50%', textAlign: 'center', padding: '5px', borderRight: '1px solid black' }}>
                  Employee Rewards
                </div>
                <div style={{ width: '50%', textAlign: 'center', padding: '5px', borderLeft: '1px solid black' }}>
                  {payroll.totalEmployeeRewards} <small>AED</small>
                </div>
                {/*  */}
                <div style={{ width: '50%', textAlign: 'center', padding: '5px', borderRight: '1px solid black' }}>
                
                </div>
                <div style={{ width: '50%', textAlign: 'center', padding: '5px', borderLeft: '1px solid black' }}>
                </div>
                {/*  */}
                <div style={{ width: '100%', display: 'flex' }}>
                  <div
                    style={{
                      border: '1px solid black',
                      borderLeft: '0px',
                      width: '50%',
                      textAlign: 'center',
                      padding: '5px'
                    }}
                  >
                  </div>
                  <div
                    style={{
                      border: '1px solid black',
                      borderRight: '0px',
                      width: '50%',
                      textAlign: 'center',
                      padding: '5px'
                    }}
                  >
                  </div>
                </div>
              </div>
            </div>
          </div>
        { !payroll.flexible &&
          <>
           <div item xs={12} style={{ margin: '20px', display: 'flex' }}>
            <div style={{ width: '50%', padding: '5px' }} xs={12} md={6}>
              <div style={{ width: '100%', display: 'flex' }}>
                <div style={{ border: '1px solid black', padding: '5px', width: '50%', textAlign: 'center' }}>
                  Off Day Hours
                </div>
                <div style={{ border: '1px solid black', padding: '5px', width: '50%', textAlign: 'center' }}>
                {Number(payroll.totalOffDayHours)} <small>Hours</small>
                </div>
              </div>
            </div>
            <div style={{ width: '50%', padding: '5px' }} xs={12} md={6}>
              <div style={{ width: '100%', display: 'flex' }}>
                <div style={{ border: '1px solid black', padding: '5px', width: '50%', textAlign: 'center' }}>
                Early and late Hours
                </div>
                <div style={{ border: '1px solid black', padding: '5px', width: '50%', textAlign: 'center' }}>
                  {Number(payroll.totalEarlyHours) + Number(payroll.totalLateHours)} <small>Hours</small>
                </div>
              </div>
              </div>
            </div>
        
            </>
          }
          <div item xs={12} style={{ margin: '20px', display: 'flex' }}>
          { !payroll.flexible &&
            <div style={{ width: '50%', padding: '5px' }} xs={12} md={6}>
              <div style={{ width: '100%', display: 'flex' }}>
                <div style={{ border: '1px solid black', padding: '5px', width: '50%', textAlign: 'center' }}>
                  Holiday Hours
                </div>
                <div style={{ border: '1px solid black', padding: '5px', width: '50%', textAlign: 'center' }}>
                  {payroll.totalholidayHours} <small>Hours</small>
                </div>
              </div>
            </div>
            }
            <div style={{ width: '50%', padding: '5px' }} xs={12} md={6}>
              <div style={{ width: '100%', display: 'flex' }}>
                <div style={{ border: '1px solid black', padding: '5px', width: '50%', textAlign: 'center' }}>
                  Working Days
                </div>
                <div style={{ border: '1px solid black', padding: '5px', width: '50%', textAlign: 'center' }}>
                  {payroll.totalWorkingDaysCount} <small>Days</small>
                </div>
              </div>
            </div>
          </div>
          <div item xs={12} style={{ margin: '20px', display: 'flex' }}>
            <div style={{ width: '100%', padding: '5px' }} xs={12} md={6}>
              <div style={{ width: '100%', display: 'flex', border: '1px solid black' }}>
                <div style={{ padding: '5px', width: '50%', textAlign: 'center' }}>Total</div>
                <div style={{ padding: '5px', width: '50%', textAlign: 'center' }}>{payroll.total} AED</div>
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <div style={{ padding: '30px' }}>
            <Button sx={{ mr: 4, mb: 2 }} color='primary' onClick={saveCapture} variant='outlined'>
              print
            </Button>
            <Button sx={{ mr: 4, mb: 2 }} color='warning' variant='outlined'>
              send to email
            </Button>
          </div>
        </Card>
      </Grid>
    </Grid>
  )
}

Slip.getInitialProps = async ({ query: { id } }) => {
  return { id: id }
}

export default Slip
