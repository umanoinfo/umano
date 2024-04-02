// ** React Imports
import { useState, useEffect } from 'react'

// ** Next Import
import Link from 'next/link'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Alert from '@mui/material/Alert'

// ** Third Party Components
import axios from 'axios'

// ** Demo Components Imports
import PreviewCard from './PreviewCard'
import PreviewActions from './PreviewActions'
import AttendanceList from './PreviwAttendance'
import AddPaymentDrawer from 'src/views/apps/invoice/shared-drawer/AddPaymentDrawer'
import SendInvoiceDrawer from 'src/views/apps/invoice/shared-drawer/SendInvoiceDrawer'

const InvoicePreview = ({ employee, attendances, fromDate, toDate , lumpySalary }) => {
  // ** State
  const [error, setError] = useState(false)
  const [data, setData] = useState(null)
  const [addPaymentOpen, setAddPaymentOpen] = useState(false)
  const [sendInvoiceOpen, setSendInvoiceOpen] = useState(false)

  // useEffect(() => {
  //   axios
  //     .get('/apps/invoice/single-invoice', { params: { id } })
  //     .then(res => {
  //       setData(res.data)
  //       setError(false)
  //     })
  //     .catch(() => {
  //       setData(null)
  //       setError(true)
  //     })
  // }, [id])
  const toggleSendInvoiceDrawer = () => setSendInvoiceOpen(!sendInvoiceOpen)
  const toggleAddPaymentDrawer = () => setAddPaymentOpen(!addPaymentOpen)
  if (employee) {
    return (
      <>
        <Grid container px={5} spacing={6}>
          <Grid item xl={9} md={8} xs={12}>
            <PreviewCard data={employee} fromDate={fromDate} toDate={toDate} />
          </Grid>
          <Grid item xl={3} md={4} xs={12}>
            <PreviewActions
              employee={employee} attendances={attendances} fromDate={fromDate} toDate={toDate} lumpySalary={lumpySalary}
            />
          </Grid>
          {
            !employee.flexible ?
              <Grid item xl={12} md={12} xs={12}>
                <AttendanceList attendances={attendances} />
              </Grid>
            :
             <></>
          }
        </Grid>
        <SendInvoiceDrawer open={sendInvoiceOpen} toggle={toggleSendInvoiceDrawer} />
        <AddPaymentDrawer open={addPaymentOpen} toggle={toggleAddPaymentDrawer} />
      </>
    )
  } else if (error) {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Alert severity='error'>
            Invoice with the id: {id} does not exist. Please check the list of invoices:{' '}
            <Link href='/apps/invoice/list'>Invoice List</Link>
          </Alert>
        </Grid>
      </Grid>
    )
  } else {
    return null
  }
}

export default InvoicePreview
