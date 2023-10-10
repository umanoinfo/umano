import useMediaQuery from '@mui/material/useMediaQuery'

// ** Layout Imports
// !Do not remove this Layout import
import Layout from 'src/@core/layouts/Layout'

// ** Styled Components
import ReactHotToast from 'src/@core/styles/libs/react-hot-toast'


// ** Third Party Import
import { Toaster } from 'react-hot-toast'

import VerticalAppBarContent from './components/vertical/AppBarContent'

// ** Hook Import
import { useSettings } from 'src/@core/hooks/useSettings'
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { useState } from 'react'
import { navigation } from 'src/navigation/horizontal'
import axios from 'axios'

const ff = []

const UserLayout = ({ children, contentHeightFixed }) => {
  // ** Hooks
  const { settings, saveSettings } = useSettings()
  const [menuOptions, setMenuOptions] = useState([])
  const { data: session, status } = useSession()

  const hidden = useMediaQuery(theme => theme.breakpoints.down('lg'))
  if (hidden && settings.layout === 'horizontal') {
    settings.layout = 'vertical'
  }

  useEffect(() => {
    getOptions()
  }, [])

  const getOptions = () => {
    try{
        axios.get('/api/menuOptions', {}).then(res => {
          setMenuOptions(res.data.data)
        })
    }
    catch(ex){}
  }

  return (
    <Layout
      hidden={hidden}
      settings={settings}
      saveSettings={saveSettings}
      contentHeightFixed={contentHeightFixed}
      verticalLayoutProps={{
        navMenu: {
          navItems: menuOptions
        },
        appBar: {
          content: props => (
            <VerticalAppBarContent
              hidden={hidden}
              settings={settings}
              saveSettings={saveSettings}
              toggleNavVisibility={props.toggleNavVisibility}
            />
          )
        }
      }}
      {...(settings.layout === 'horizontal' && {
        horizontalLayoutProps: {
          navMenu: {
            // Uncomment the below line when using server-side menu in horizontal layout and comment the above line
            // navItems: horizontalMenuItems
          },
          appBar: {
            content: () => <></>

            // <HorizontalAppBarContent hidden={hidden} settings={settings} saveSettings={saveSettings} />
          }
        }
      })}
    >
      {children}
      <ReactHotToast>
        <Toaster position={settings.toastPosition} toastOptions={{ className: 'react-hot-toast' }} />
      </ReactHotToast>
    </Layout>
  )
}

export default UserLayout
