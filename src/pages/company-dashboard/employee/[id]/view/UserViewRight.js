// ** React Imports
import { useState, useEffect } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** MUI Imports
import Box from '@mui/material/Box'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import MuiTab from '@mui/material/Tab'
import CircularProgress from '@mui/material/CircularProgress'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Components Imports
import UserViewDocuments from './UserViewDocuments'
import UserViewActivity from './UserViewActivity'
import EmployeeViewPosition from './EmployeeViewPosition'
import EmployeeViewSalary from './EmployeeViewSalary'
import EmployeeViewSalaryFormula from './EmployeeViewSalaryFormula'
import EmployeeViewLeaves from './EmployeeViewLeaves'
import EmployeeViewDeductions from './EmployeeViewDeductions'
import EmployeeViewReawards from './EmployeeViewReawards'
import EmployeeViewAttendance from './EmployeeViewAttendance'

// ** Styled Tab component
const Tab = styled(MuiTab)(({ theme }) => ({
  minHeight: 10,
  flexDirection: 'row',
  '& svg': {
    marginBottom: '0 !important',
    marginRight: theme.spacing(0)
  }
}))

const UserViewRight = ({ tab, id, employee, permissions }) => {
  // ** State
  const [activeTab, setActiveTab] = useState(tab)
  const [isLoading, setIsLoading] = useState(false)

  // ** Hooks
  const router = useRouter()

  const handleChange = (event, value) => {
    setIsLoading(true)
    setActiveTab(value)
    router
      .push({
        pathname: `/company-dashboard/employee/${id}/view/${value.toLowerCase()}`
      })
      .then(() => setIsLoading(false))
  }
  useEffect(() => {
    if (tab && tab !== activeTab) {
      setActiveTab(tab)
    }
  }, [tab])

  return (
    <TabContext value={activeTab}>
      <TabList
        variant='scrollable'
        scrollButtons='auto'
        onChange={handleChange}
        aria-label='forced scroll tabs example'
        sx={{ borderBottom: theme => `1px solid ${theme.palette.divider}` }}
      >
        <Tab value='documents' label='Documents' icon={<Icon icon='mdi:bookmark-outline' />} />
        <Tab value='positions' label='Positions' icon={<Icon icon='mdi:link-variant' />} />
        <Tab value='attendance' label='Attendance' icon={<Icon icon='mdi:clock-outline' />} />
        <Tab value='formula' label='Salary Formula' icon={<Icon icon='ph:money' />} />
        <Tab value='salaries' label='Salaries' icon={<Icon icon='fluent:person-money-24-regular' />} />
        <Tab value='leaves' label='Leaves' icon={<Icon icon='material-symbols:view-timeline-outline' />} />
        <Tab value='deductions' label='Deductions' icon={<Icon icon='mdi:tag-minus-outline' />} />
        <Tab value='reawards' label='Reawards' icon={<Icon icon='mdi:tag-plus-outline' />} />
        
      </TabList>
      <Box sx={{ mt: 6 }}>
        {isLoading ? (
          <Box sx={{ mt: 6, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
            <CircularProgress sx={{ mb: 4 }} />
            <Typography>Loading...</Typography>
          </Box>
        ) : (
          <>
            <TabPanel sx={{ p: 0 }} value='documents'>
              <UserViewDocuments employee={employee} />
            </TabPanel>
            <TabPanel sx={{ p: 0 }} value='activity'>
              <UserViewActivity />
            </TabPanel>
            <TabPanel sx={{ p: 0 }} value='positions'>
              <EmployeeViewPosition employee={employee} />
            </TabPanel>
            <TabPanel sx={{ p: 0 }} value='salaries'>
              <EmployeeViewSalary employee={employee} />
            </TabPanel>
            <TabPanel sx={{ p: 0 }} value='formula'>
              <EmployeeViewSalaryFormula employee={employee} />
            </TabPanel>
            <TabPanel sx={{ p: 0 }} value='leaves'>
              <EmployeeViewLeaves employee={employee} />
            </TabPanel>
            <TabPanel sx={{ p: 0 }} value='deductions'>
              <EmployeeViewDeductions employee={employee} />
            </TabPanel>
            <TabPanel sx={{ p: 0 }} value='reawards'>
              <EmployeeViewReawards employee={employee} />
            </TabPanel>
            <TabPanel sx={{ p: 0 }} value='attendance'>
              <EmployeeViewAttendance employee={employee} />
            </TabPanel>
          </>
        )}
      </Box>
    </TabContext>
  )
}

UserViewRight.getInitialProps = async ({ query: { id } }) => {
  return { id: id }
}

export default UserViewRight
