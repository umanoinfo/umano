// ** MUI Imports
import { Typography } from '@mui/material'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import { useSession } from 'next-auth/react'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Components
import UserDropdown from 'src/@core/layouts/components/shared-components/UserDropdown'



const AppBarContent = props => {
  // ** Props
  const { hidden, settings, saveSettings, toggleNavVisibility } = props

  const { data: session, status } = useSession()


  return (
    <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box className='actions-left' sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
        {hidden && !settings.navHidden ? (
          <IconButton color='inherit' sx={{ ml: -2.75 }} onClick={toggleNavVisibility}>
            <Icon icon='mdi:menu' />
          </IconButton>
        ) : null}

        {session.user.company_info && session.user.type == 'admin' && <Typography variant="h7"  sx={{color:'#c3c3c3' , fontStyle:'italic'}}>
          Your Company is : <span style={{color:'blue' , fontWeight:'600'}}>{session.user.company_info[0]?.name}</span>
        </Typography>}
       
      </Box>
      <Box className='actions-right' sx={{ display: 'flex', alignItems: 'center' }}>
     
        {/* <LanguageDropdown settings={settings} saveSettings={saveSettings} /> */}
        {/* <ModeToggler settings={settings} saveSettings={saveSettings} /> */}
        {/* <ShortcutsDropdown settings={settings} shortcuts={shortcuts} /> */}
        {/* <NotificationDropdown settings={settings} notifications={notifications} /> */}
      
        <UserDropdown settings={settings} />
      </Box>
    </Box>
  )
}

export default AppBarContent
