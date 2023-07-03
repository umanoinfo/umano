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
import UserViewCard from './UserViewCard'
import UserViewActivity from './UserViewActivity'
import UserViewPermission from './UserViewPermission'

// ** Styled Tab component
const Tab = styled(MuiTab)(({ theme }) => ({
  minHeight: 48,
  flexDirection: 'row',
  '& svg': {
    marginBottom: '0 !important',
    marginRight: theme.spacing(1)
  }
}))

const UserViewRight = ({ tab, id, permissions }) => {
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
        pathname: `/admin-dashboard/user/${id}/view/${value.toLowerCase()}`
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
        {/* <Tab value='card' label='Cards' icon={<Icon icon='mdi:bookmark-outline' />} /> */}
        <Tab value='permission' label='Permissions' icon={<Icon icon='mdi:link-variant' />} />
        {/* <Tab value='activity' label='Activity' icon={<Icon icon='mdi:lock-outline' />} /> */}
      </TabList>
      <Box sx={{ mt: 6 }}>
        {isLoading ? (
          <Box sx={{ mt: 6, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
            <CircularProgress sx={{ mb: 4 }} />
            <Typography>Loading...</Typography>
          </Box>
        ) : (
          <>
            <TabPanel sx={{ p: 0 }} value='card'>
              <UserViewCard />
            </TabPanel>
            <TabPanel sx={{ p: 0 }} value='activity'>
              <UserViewActivity />
            </TabPanel>
            <TabPanel sx={{ p: 0 }} value='permission'>
              <UserViewPermission id={id} />
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
