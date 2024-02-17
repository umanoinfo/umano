// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import Fab from '@mui/material/Fab'
import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Spinner Import
import Spinner from 'src/@core/components/spinner'

// ** Theme Config Import
import themeConfig from 'src/configs/themeConfig'

// ** Components
import AppBar from './components/vertical/appBar'
import Navigation from './components/vertical/navigation'
import Footer from './components/shared-components/footer'
import ScrollToTop from 'src/@core/components/scroll-to-top'
import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { Error401 } from 'src/pages/401'
import { Button, Typography } from '@mui/material'

const VerticalLayoutWrapper = styled('div')({
  height: '100%',
  display: 'flex'
})

const MainContentWrapper = styled(Box)({
  flexGrow: 1,
  minWidth: 0,
  display: 'flex',
  minHeight: '100vh',
  flexDirection: 'column'
})

const ContentWrapper = styled('main')(({ theme }) => ({
  flexGrow: 1,
  width: '100%',
  padding: theme.spacing(6),
  transition: 'padding .25s ease-in-out',
  [theme.breakpoints.down('sm')]: {
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4)
  }
}))

const VerticalLayout = props => {
  // ** Props
  const { hidden, settings, children, scrollToTop, footerProps, contentHeightFixed, verticalLayoutProps } = props

  // ** Vars
  const { skin, navHidden, contentWidth } = settings
  const { navigationSize, disableCustomizer, collapsedNavigationSize } = themeConfig
  const navWidth = navigationSize
  const navigationBorderWidth = skin === 'bordered' ? 1 : 0
  const collapsedNavWidth = collapsedNavigationSize
  const router = useRouter()

  // ** States
  const [navVisible, setNavVisible] = useState(false)

  // ** Toggle Functions
  const toggleNavVisibility = () => setNavVisible(!navVisible)

  const { data: session, status } = useSession()

  if(session && session.user && session.user.status != 'active'){


    return(
      <>
          <Box className='content-center'>
            <Box sx={{ p: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <Typography variant='h1' sx={{ mb: 2.5 }}>
                405
              </Typography>
              <Typography variant='h5' sx={{ mb: 2.5, fontSize: '1.5rem !important' }}>
                You are not active! 🔐
              </Typography>
              <Typography variant='body2'>You don&prime;t have permission to access this page.</Typography>
            </Box>
          </Box>
        </>
    )
  }

  const Img = styled('img')(({ theme }) => ({
    marginTop: theme.spacing(15),
    marginBottom: theme.spacing(15),
    [theme.breakpoints.down('lg')]: {
      height: 450,
      marginTop: theme.spacing(10),
      marginBottom: theme.spacing(10)
    },
    [theme.breakpoints.down('md')]: {
      height: 400
    }
  }))

  return (
    <>
      {status == 'loading' &&<Box className='content-center'>
            <Box sx={{ mt:50 , p: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <Typography variant='h6' sx={{mt:6 ,  mb: 2.5 }}>
                Please Wait
              </Typography>
              <Spinner sx={{ height: '100%' }} />
            </Box>
          </Box>}

      {status == 'unauthenticated' && (
        <>
          <Box className='content-center'>
            <Box sx={{ p: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>

            <Img sx={{mt:40 , mb: 2.5, fontSize: '1.5rem !important' }} alt='error-illustration' src='/images/pages/401.png' />

              <Typography variant='h5' sx={{mt:10 , mb: 2.5, fontSize: '1rem !important' }}>
                You are not authorized! 
              </Typography>

              
              <Button href='/login' variant='contained' sx={{ mt:10 , px: 5.5 }}>
                Back to login
              </Button>
            </Box>
          </Box>
        </>
      )}
      {status == 'authenticated' && (
        <>
          {' '}
          <VerticalLayoutWrapper className='layout-wrapper'>
            {navHidden && !(navHidden && settings.lastLayout === 'horizontal') ? null : (
              <Navigation
                navWidth={navWidth}
                navVisible={navVisible}
                setNavVisible={setNavVisible}
                collapsedNavWidth={collapsedNavWidth}
                toggleNavVisibility={toggleNavVisibility}
                navigationBorderWidth={navigationBorderWidth}
                navMenuContent={verticalLayoutProps.navMenu.content}
                navMenuBranding={verticalLayoutProps.navMenu.branding}
                menuLockedIcon={verticalLayoutProps.navMenu.lockedIcon}
                verticalNavItems={verticalLayoutProps.navMenu.navItems}
                navMenuProps={verticalLayoutProps.navMenu.componentProps}
                menuUnlockedIcon={verticalLayoutProps.navMenu.unlockedIcon}
                afterNavMenuContent={verticalLayoutProps.navMenu.afterContent}
                beforeNavMenuContent={verticalLayoutProps.navMenu.beforeContent}
                {...props}
              />
            )}
            <MainContentWrapper
              className='layout-content-wrapper'
              sx={{ ...(contentHeightFixed && { maxHeight: '100vh' }) }}
            >
              <AppBar
                toggleNavVisibility={toggleNavVisibility}
                appBarContent={verticalLayoutProps.appBar?.content}
                appBarProps={verticalLayoutProps.appBar?.componentProps}
                {...props}
              />

              <ContentWrapper
                className='layout-page-content'
                sx={{
                  ...(contentHeightFixed && {
                    overflow: 'hidden',
                    '& > :first-of-type': { height: '100%' }
                  }),
                  ...(contentWidth === 'boxed' && {
                    mx: 'auto',
                    '@media (min-width:1440px)': { maxWidth: 1440 },
                    '@media (min-width:1200px)': { maxWidth: '100%' }
                  })
                }}
              >
                {children}
              </ContentWrapper>

              <Footer footerStyles={footerProps?.sx} footerContent={footerProps?.content} {...props} />
            </MainContentWrapper>
          </VerticalLayoutWrapper>
          {scrollToTop ? (
            scrollToTop(props)
          ) : (
            <ScrollToTop className='mui-fixed'>
              <Fab color='primary' size='small' aria-label='scroll back to top'>
                <Icon icon='mdi:arrow-up' />
              </Fab>
            </ScrollToTop>
          )}
        </>
      )}
    </>
  )
}

export default VerticalLayout
