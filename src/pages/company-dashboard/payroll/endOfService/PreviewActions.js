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

const PreviewActions = ({ employee, attendances, fromDate, toDate }) => {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  
  const save = () => {
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
    data.name = employee.firstName + '' + employee.firstName
    data.mobilePhone = employee.mobilePhone
    data.company_id = employee.company_id
    data.joiningDate = employee.joiningDate

    data.lessThanFiveDays = employee.lessThanFiveDays
    data.lessThanFiveValue = employee.lessThanFiveValue
    data.moreThanFiveDays = employee.moreThanFiveDays
    data.moreThanFiveValue = employee.moreThanFiveValue
    data.lumpySalary = employee.salaries_info[0].lumpySalary
    data.allDays = employee.allDays
    data.actualDays = employee.actualDays
    data.actualYears = employee.actualYears
    data.endOfServeceTotalValue = employee.endOfServeceTotalValue

    axios.post('/api/end-of-service/add-end-of-service', data).then(res => {
      router.push('/company-dashboard/payroll/endOfService/slip/' + res.data.data._id)
      toast.success('End of service gratuity (' + res.data.data.name + ') Inserted Successfully.', {
        delay: 3000,
        position: 'bottom-right'
      })
      setLoading(false)
    }).catch((err)=>{})
  }

  const handleClose = ()=>{
    router.push('../');
  }
  if (loading) return <Loading header='Please Wait' description='End of service gratuity Inserting'></Loading>

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
        <Button fullWidth sx={{ mb: 3.5 }} color='secondary' variant='outlined' onClick={handleClose}>
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
