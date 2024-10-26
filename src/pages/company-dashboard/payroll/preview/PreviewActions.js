// ** Next Import
import Link from 'next/link'

// ** MUI Imports
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import CardContent from '@mui/material/CardContent'

// ** Icon Imports
import Icon from 'src/@core/components/icon'
import axios from 'axios'
import { useState } from 'react'
import Loading from 'src/views/loading'
import { useRouter } from 'next/router'
import { toast } from 'react-hot-toast'

const PreviewActions = ({ employee , attendances , fromDate , toDate }) => {

  const [loading , setLoading] = useState(false)
  const router = useRouter()

  const save = ()=>{

    setLoading(true)

    let data = {}
    data.employee_id = employee._id
    data.fromDate = fromDate
    data.toDate = toDate
    data.dailySalary = employee.dailySalary
    data.employeeType = employee.employeeType
    data.email = employee.email
    data.idNo = employee.idNo
    data.employeePositions_info = employee.employeePositions_info
    data.name = employee.firstName + " " + employee.lastName
    data.mobilePhone = employee.mobilePhone
    data.company_id = employee.company_id
    data.joiningDate = employee.joiningDate
    data.totalCompensations = employee.totalCompensations
    data.totalDeductions = employee.totalDeductions
    data.lumpySalary = employee.salaries_info[0].lumpySalary
    data.totalEmployeeDeductions = employee.totalEmployeeDeductions
    data.totalEmployeeRewards = employee.totalEmployeeRewards
    data.totalWorkingDaysCount = employee.totalWorkingDaysCount
    data.flexible = employee.flexible;
    data.totalWorkingHours = employee.totalWorkingHours
    data.totalRequiredHours = employee.totalRequiredHours 
    data.workingHoursDifference = employee.workingHoursDifference 
    data.shiftType = employee.shift_info[0].shiftType ; 
    data.salaryFormulaType = (employee?.salaryFormulas_info?.[0]?.type);
    
    if(!data.flexible){
      data.totalEarlyHours = employee.totalEarlyHours
      data.totalLateHours = employee.totalLateHours
      data.totalEarlyValue = employee.totalEarlyValue
      data.totalLeave = employee.totalLeave
      data.totalOffDayHours = employee.totalOffDayHours
      data.totalOffDayValue = employee.totalOffDayValue
      data.totalholidayHours = employee.totalholidayHours
      data.totalholidayValue = employee.totalholidayValue
      data.totalLateOverTimeValue = employee.totalLateOverTimeValue
      data.totalEarlyOverTimeValue = employee.totalEarlyOverTimeValue
      data.totalEarlyOverTimeHours = employee.totalEarlyOverTimeHours
      data.totalLateOverTimeHours = employee.totalLateOverTimeHours
    }
    if(employee.flexible){
      data.total = ((

        // Number(data.lumpySalary * (data.totalWorkingDaysCount / 30 )) - old payroll technique
        Number(data.lumpySalary * (1)) -
        Number(data.totalDeductions) +
        Number(data.totalCompensations) -
        Number(data.totalEmployeeDeductions) +
        Number(data.totalEmployeeRewards)).toFixed(3)).toLocaleString('en-US');
    }
    else{
      data.total  = 
      Number(employee.totalOffDayValue) +
        Number(employee.totalholidayValue) +

          // Number(employee.salaries_info[0].lumpySalary * (data.totalWorkingDaysCount / 30 )) + old payroll technique
          Number(employee.salaries_info[0].lumpySalary * (1)) +
            Number(employee.totalEarlyValue) -
              Number(employee.totalDeductions) +
                Number(employee.totalCompensations) -
                  Number(employee.totalEmployeeDeductions) +
                    Number(employee.totalEmployeeRewards) -
                      Number(employee.totalLeave)+
                        Number(employee.totalLateOverTimeValue)+
                          Number(employee.totalEarlyOverTimeValue)
      

    }
    axios.post('/api/payroll/add-payroll', data).then((res)=>{
      router.push('/company-dashboard/payroll/slip/'+res.data.data._id)
      toast.success('Payroll (' + res.data.data.name + ') Inserted Successfully.', {
        delay: 3000,
        position: 'bottom-right'
      })
      setLoading(false)
    }).catch((err)=>{})
  }

  if (loading) return <Loading header='Please Wait' description="Payroll Inserting"></Loading>

  return (
    <Card>
      <CardContent>
        {/* <Button
          fullWidth
          sx={{ mb: 3.5 }}
          color='success'
          variant='contained'
          onClick={togglesaveSendInvoiceDrawer}
          startIcon={<Icon icon='mdi:send-outline' />}
        >
          Save 
        </Button> */}
        <Button fullWidth sx={{ mb: 3.5 }} color='success' onClick={save} variant='contained'>
          Save
        </Button>
        <Button fullWidth sx={{ mb: 3.5 }} color='secondary' variant='outlined'>
          Close
        </Button>
        {/* <Button
          fullWidth
          target='_blank'
          sx={{ mb: 3.5 }}
          component={Link}
          color='secondary'
          variant='outlined'
          href={`/apps/invoice/print/${id}`}
        >
          Print
        </Button>
        <Button
          fullWidth
          sx={{ mb: 3.5 }}
          component={Link}
          color='secondary'
          variant='outlined'
          href={`/apps/invoice/edit/${id}`}
        >
          Edit Invoice
        </Button>
        <Button
          fullWidth
          color='success'
          variant='contained'
          onClick={toggleAddPaymentDrawer}
          startIcon={<Icon icon='mdi:currency-usd' />}
        >
          Add Payment
        </Button> */}
      </CardContent>
    </Card>
  )
}

export default PreviewActions
