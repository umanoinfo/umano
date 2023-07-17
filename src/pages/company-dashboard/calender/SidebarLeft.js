// ** MUI Imports
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import Checkbox from '@mui/material/Checkbox'
import Typography from '@mui/material/Typography'
import FormControlLabel from '@mui/material/FormControlLabel'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

const SidebarLeft = props => {
  const {
    mdAbove,
    leftSidebarOpen,
    leftSidebarWidth,
    handleLeftSidebarToggle,
    handleAddEventSidebarToggle,
    setParams,
    params
  } = props

  const store = useSelector(state => state.event)
  const { data: session, setSession } = useSession()

  const colorsArr = [
    ['Meet', 'primary'],
    ['Task', 'info'],
    ['Document', 'success'],
    ['Holiday', 'secondary']
  ]

  let types = []
  types = store.data.map(el => el.type)
  types = Array.from(new Set(types))

  const renderFilters = colorsArr.map(([key, value]) => {
    return (
      <FormControlLabel
        key={key}
        label={key}
        sx={{ mb: 0.5 }}
        control={
          <Checkbox
            color={value}
            checked={types.includes(key) && params.includes(key)}
            onChange={() => {
              setParams(params.includes(key) ? params.replace(key, '') : params + ',' + key)
            }}
          />
        }
      />
    )
  })

  const handleSidebarToggleSidebar = () => {
    handleAddEventSidebarToggle()
  }

  if (renderFilters) {
    return (
      <Drawer
        open={leftSidebarOpen}
        onClose={handleLeftSidebarToggle}
        variant={mdAbove ? 'permanent' : 'temporary'}
        ModalProps={{
          disablePortal: true,
          disableAutoFocus: true,
          disableScrollLock: true,
          keepMounted: true // Better open performance on mobile.
        }}
        sx={{
          zIndex: 2,
          display: 'block',
          position: mdAbove ? 'static' : 'absolute',
          '& .MuiDrawer-paper': {
            borderRadius: 1,
            boxShadow: 'none',
            width: leftSidebarWidth,
            borderTopRightRadius: 0,
            alignItems: 'flex-start',
            borderBottomRightRadius: 0,
            p: theme => theme.spacing(5),
            zIndex: mdAbove ? 2 : 'drawer',
            position: mdAbove ? 'static' : 'absolute'
          },
          '& .MuiBackdrop-root': {
            borderRadius: 1,
            position: 'absolute'
          }
        }}
      >
        {session && session.user && session.user.permissions.includes('AddEvent') && (
          <Button fullWidth variant='contained' onClick={handleSidebarToggleSidebar}>
            Add Event
          </Button>
        )}

        <Typography variant='body2' sx={{ mt: 7, mb: 2.5, textTransform: 'uppercase' }}>
          Calendars
        </Typography>
        <FormControlLabel
          label='View All'
          sx={{ mr: 0, mb: 0.5 }}
          control={
            <Checkbox
              color='secondary'
              checked={params.includes('Meet') && params.includes('Task') && params.includes('Document') && params.includes('Holiday')}
              onChange={e => {
                setParams(params == '' ? 'Meet,Task,Document,Holiday' : '')
              }}
            />
          }
        />
        {renderFilters}
      </Drawer>
    )
  } else {
    return null
  }
}

export default SidebarLeft
