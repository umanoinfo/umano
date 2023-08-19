// ** React Imports
import { useEffect, useState } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** Spinner Import
import Spinner from 'src/@core/components/spinner'


// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Component Import
import CardStatisticsVertical from 'src/@core/components/card-statistics/card-stats-vertical'

// ** Hook Imports
import { useAuth } from 'src/hooks/useAuth'
import CrmAward from 'src/views/dashboards/company/CrmAward'
import CrmTable from 'src/views/dashboards/company/CrmTable'
import CrmTotalGrowth from 'src/views/dashboards/company/CrmTotalGrowth'
import CrmTotalProfit from 'src/views/dashboards/company/CrmTotalProfit'
import CrmMonthlyBudget from 'src/views/dashboards/company/CrmMonthlyBudget'
import CrmExternalLinks from 'src/views/dashboards/company/CrmExternalLinks'
import CrmWeeklyOverview from 'src/views/dashboards/company/CrmWeeklyOverview'
import CrmPaymentHistory from 'src/views/dashboards/company/CrmPaymentHistory'
import CrmOrganicSessions from 'src/views/dashboards/company/CrmOrganicSessions'
import CrmProjectTimeline from 'src/views/dashboards/company/CrmProjectTimeline'
import CrmMeetingSchedule from 'src/views/dashboards/company/CrmMeetingSchedule'
import CrmSocialNetworkVisits from 'src/views/dashboards/company/CrmSocialNetworkVisits'
import CrmMostSalesInCountries from 'src/views/dashboards/company/CrmMostSalesInCountries'
import { Grid } from '@mui/material'
import ApexChartWrapper from 'src/@core/styles/libs/react-apexcharts'

// ** Axios Imports
import axios from 'axios'


/**
 *  Set Home URL based on User Roles
 */
export const getHomeRoute = role => {
  if (role === 'client') return '/acl'
  else return '/dashboards/crm'
}

const Home = () => {
  // ** Hooks
  const auth = useAuth()
  const router = useRouter()
  const [loading , setLoading]=useState(true)
  const [data , setData]=useState()

  useEffect(() => {
    getDashboard()
    if (auth.user && auth.user.role) {
      const homeRoute = getHomeRoute(auth.user.role)

      // Redirect user to Home URL
      router.replace(homeRoute)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getDashboard = ()=>{
    setLoading(true)
    axios
    .post('/api/dashboard', {
    }).then((data)=>{
      setLoading(false)
      setData(data.data.data)
    })
  }

  if(loading){
    return <Spinner sx={{ height: '100%' }} />
  }
  
  return (
    <>
        <ApexChartWrapper>
          <Grid container spacing={6} className='match-height'>
            <Grid item xs={12} md={4}>
              <CrmAward />
            </Grid>
            {/* <Grid item xs={6} sm={3} md={2}>
              { data && <CardStatisticsVertical
                stats={data.employees_count}
                color='primary'
                title='Employees'
                chipText='Last 4 Month'
                icon={<Icon icon='mdi-account-box-outline' />}
              />}
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              {data && <CardStatisticsVertical
                stats={data.users_count}
                color='warning'
                title='Users'
                chipText='Last Six Month'
                icon={<Icon icon='mdi-account' />}
              />}
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              {data && <CardStatisticsVertical
                stats={data.documents_count}
                color='success'
                title='Documents'
                icon={<Icon icon='mdi-file-outline' />}
              />}
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              { data && <CrmTotalGrowth 
                expiaryDocuments_count = {data.expiaryDocuments_count}   
                documents_count ={data.documents_count}
              />}
            </Grid> */}

            {/* <Grid item xs={12} md={12}>
              <CrmProjectTimeline />
            </Grid> */}
            
            <Grid item xs={12} md={8}>
              <CrmTable data={data.documentsExpired} />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <CrmMeetingSchedule birthdays={data.birthdays}/>
            </Grid>
        
          </Grid>
        </ApexChartWrapper>
    </>
  )

  
}

export default Home
