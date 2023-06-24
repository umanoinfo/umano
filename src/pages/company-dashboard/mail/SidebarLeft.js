// ** Next Import
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import ListItem from '@mui/material/ListItem'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// ** Custom Components Imports
import CustomBadge from 'src/@core/components/mui/badge'

// ** Styled Components
const ListItemStyled = styled(ListItem)(({ theme }) => ({
  borderLeftWidth: '3px',
  borderLeftStyle: 'solid',
  padding: theme.spacing(0, 5),
  marginBottom: theme.spacing(2)
}))

const ListBadge = styled(CustomBadge)(() => ({
  '& .MuiBadge-badge': {
    height: '18px',
    minWidth: '18px',
    transform: 'none',
    position: 'relative',
    transformOrigin: 'none'
  }
}))

const SidebarLeft = props => {
  // ** Props
  const {
    labelColors,
    store,
    hidden,
    lgAbove,
    dispatch,
    leftSidebarOpen,
    leftSidebarWidth,
    setMailDetailsOpen,
    handleLeftSidebarToggle,
    setMailType,
    MailType
  } = props

  // const RenderBadge = (folder, color) => {
  //   // && store.mailMeta && store.mailMeta[folder] > 0
  //   if (store ) {
  //     return <ListBadge skin='light' color={color} sx={{ ml: 2 }} badgeContent={store.mailMeta[folder]} />
  //   } else {
  //     return null
  //   }
  // }

  const handleActiveItem = type => {
    if (store && MailType == type) {
      return true
    } else {
      return false
    }
  }

  //
  // && store.filter[type] !== value
  //

  const handleListItemClick = type => {
    setMailDetailsOpen(false)
    setMailType(type)
    handleLeftSidebarToggle()
  }

  // const activeInboxCondition =
  //   store && handleActiveItem('folder', 'inbox') && store.filter.folder === 'inbox' && store.filter.label === ''

  const ScrollWrapper = ({ children }) => {
    if (hidden) {
      return <Box sx={{ height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>{children}</Box>
    } else {
      return <PerfectScrollbar options={{ wheelPropagation: false }}>{children}</PerfectScrollbar>
    }
  }

  return (
    <Drawer
      open={leftSidebarOpen}
      onClose={handleLeftSidebarToggle}
      variant={lgAbove ? 'permanent' : 'temporary'}
      ModalProps={{
        disablePortal: true,
        keepMounted: true // Better open performance on mobile.
      }}
      sx={{
        zIndex: 9,
        display: 'block',
        position: lgAbove ? 'static' : 'absolute',
        '& .MuiDrawer-paper': {
          boxShadow: 'none',
          width: leftSidebarWidth,
          zIndex: lgAbove ? 2 : 'drawer',
          position: lgAbove ? 'static' : 'absolute'
        },
        '& .MuiBackdrop-root': {
          position: 'absolute'
        }
      }}
    >
      <ScrollWrapper>
        <Box sx={{ pt: 1.25, overflowY: 'hidden' }}>
          <Typography
            component='h6'
            variant='caption'
            sx={{
              mx: 6,
              mb: 0,
              mt: 3.5,
              lineHeight: '.95rem',
              color: 'text.disabled',
              letterSpacing: '0.4px',
              textTransform: 'uppercase'
            }}
          >
            Types
          </Typography>
          <List component='div' sx={{ pt: 1 }}>
            <ListItemStyled
              style={{ cursor: 'pointer' }}
              onClick={() => {
                handleListItemClick('')
              }}
              sx={{
                mb: 1,
                borderLeftColor: handleActiveItem('') ? 'primary.main' : 'transparent'
              }}
            >
              <ListItemIcon sx={{ '& svg': { mr: 1, color: 'warning.main' } }}>
                <Icon icon='mdi:circle' fontSize='0.75rem' />
              </ListItemIcon>
              <ListItemText
                primary='All'
                primaryTypographyProps={{
                  noWrap: true,
                  sx: { ...(handleActiveItem('') && { color: 'primary.main' }) }
                }}
              />
            </ListItemStyled>
            <ListItemStyled
              style={{ cursor: 'pointer' }}
              onClick={() => {
                handleListItemClick('Task')
              }}
              sx={{
                mb: 1,
                borderLeftColor: handleActiveItem('Task') ? 'primary.main' : 'transparent'
              }}
            >
              <ListItemIcon sx={{ '& svg': { mr: 1, color: `${labelColors.Task}.main` } }}>
                <Icon icon='mdi:circle' fontSize='0.75rem' />
              </ListItemIcon>
              <ListItemText
                primary='Task'
                primaryTypographyProps={{
                  noWrap: true,
                  sx: { ...(handleActiveItem('Task') && { color: `${labelColors.Task}.main` }) }
                }}
              />
            </ListItemStyled>
            <ListItemStyled
              style={{ cursor: 'pointer' }}
              onClick={() => {
                handleListItemClick('Meet')
              }}
              sx={{
                mb: 1,
                borderLeftColor: handleActiveItem('Meet') ? 'primary.main' : 'transparent'
              }}
            >
              <ListItemIcon sx={{ '& svg': { mr: 1, color: `${labelColors.Meet}.main` } }}>
                <Icon icon='mdi:circle' fontSize='0.75rem' />
              </ListItemIcon>
              <ListItemText
                primary='Meet'
                primaryTypographyProps={{
                  noWrap: true,
                  sx: { ...(handleActiveItem('Meet') && { color: 'primary.main' }) }
                }}
              />
            </ListItemStyled>
          </List>
        </Box>
      </ScrollWrapper>
    </Drawer>
  )
}

export default SidebarLeft
