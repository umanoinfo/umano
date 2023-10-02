// ** Next Imports
import { Router } from 'next/router'

// ** Store Imports
import { store } from 'src/store'
import { Provider } from 'react-redux'

// ** Loader Import
import NProgress from 'nprogress'

// ** Config Imports
//import 'src/configs/i18n' /// _app 1.32 First load
import { defaultACLObj } from 'src/configs/acl'

// ** Fake-DB Import /// _app 1.32 First load
// import 'src/@fake-db'


// ** Component Imports
import UserLayout from 'src/layouts/UserLayout'
import AclGuard from 'src/@core/components/auth/AclGuard'
import ThemeComponent from 'src/@core/theme/ThemeComponent'

// import WindowWrapper from 'src/@core/components/window-wrapper'

// ** Contexts
import { SettingsConsumer, SettingsProvider } from 'src/@core/context/settingsContext'



// ** Utils Imports
// import { createEmotionCache } from 'src/@core/utils/create-emotion-cache'

// // ** Prismjs Styles /// _app 1.32 First load
// import 'prismjs'
// import 'prismjs/themes/prism-tomorrow.css'
// import 'prismjs/components/prism-jsx'
// import 'prismjs/components/prism-tsx'

// ** React Perfect Scrollbar Style

import 'react-perfect-scrollbar/dist/css/styles.css'

// import 'src/iconify-bundle/icons-bundle-react'

import { SessionProvider } from 'next-auth/react'

// ** Global css styles
// import '../../styles/globals.css'
// import 'rsuite/dist/rsuite.min.css';

import '../../styles/ChartContainer.css'
import '../../styles/ChartNode.css'

// import '../../styles/export-chart.css'

// const clientSideEmotionCache = createEmotionCache()

// ** Pace Loader

  Router.events.on('routeChangeStart', () => {
    NProgress.start()
  })
  Router.events.on('routeChangeError', () => {
    NProgress.done()
  })
  Router.events.on('routeChangeComplete', () => {
    NProgress.done()
  })

// ** Configure JSS & ClassName
const App = props => {
  const { session, Component,  pageProps } = props

  // Variables
  const contentHeightFixed = Component.contentHeightFixed ?? false

  const getLayout =
    Component.getLayout ?? (page => <UserLayout contentHeightFixed={contentHeightFixed}>{page}</UserLayout>)
  const setConfig = Component.setConfig ?? undefined
  const guestGuard = Component.guestGuard ?? false
  const aclAbilities = Component.acl ?? defaultACLObj

  return (
    <SessionProvider session={session}>

      <Provider store={store} >

        {/* <CacheProvider value={emotionCache} > */}

          <SettingsProvider {...(setConfig ? { pageSettings: setConfig() } : {})}>
            <SettingsConsumer>
              {({ settings }) => {
                return (
                  <ThemeComponent settings={settings}>
                    {/* <WindowWrapper> */}
                      <AclGuard aclAbilities={aclAbilities} guestGuard={guestGuard}>
                        {getLayout(<Component {...pageProps} />)}
                      </AclGuard>
                    {/* </WindowWrapper> */}

                  </ThemeComponent>
                )
              }}
            </SettingsConsumer>
          </SettingsProvider>

        {/* </CacheProvider> */}
      </Provider>
    </SessionProvider>
  )
}

export default App
