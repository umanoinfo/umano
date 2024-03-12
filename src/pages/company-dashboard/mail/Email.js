// ** React Imports
import { useState, useEffect } from 'react'

// ** Redux Imports
import { useDispatch, useSelector } from 'react-redux'

// ** MUI Imports
import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

// ** Hooks
import { useSettings } from 'src/@core/hooks/useSettings'

// ** Email App Component Imports
import MailLog from './MailLog'
import SidebarLeft from './SidebarLeft'
import ComposePopup from './ComposePopup'

import { fetchData } from 'src/store/apps/mail'

// ** Actions
import {
  fetchMails,
  updateMail,
  paginateMail,
  getCurrentMail,
  updateMailLabel,
  handleSelectMail,
  handleSelectAllMail
} from 'src/store/apps/email'
import Loading from 'src/views/loading'

// ** Variables
const labelColors = {
  Task: 'info',
  Meet: 'primary',
  Document: 'success'
}

const EmailAppLayout = ({ folder, label }) => {
  // ** States
  const [query, setQuery] = useState('')

  const [composeOpen, setComposeOpen] = useState(false)
  const [mailDetailsOpen, setMailDetailsOpen] = useState(false)
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false)

  // ----------------new
  const [mailStatus, setMailStatus] = useState('')
  const [MailType, setMailType] = useState('')

  const [SelectedMail, setSelectedMail] = useState(null)

  // ** Hooks
  const theme = useTheme()
  const { settings } = useSettings()
  const dispatch = useDispatch()
  const lgAbove = useMediaQuery(theme.breakpoints.up('lg'))
  const mdAbove = useMediaQuery(theme.breakpoints.up('md'))
  const smAbove = useMediaQuery(theme.breakpoints.up('sm'))
  const hidden = useMediaQuery(theme.breakpoints.down('lg'))
  const store = useSelector(state => state.mail)
  const [loading , setLoading] = useState();

  // ** Vars
  const leftSidebarWidth = 260
  const { skin, direction } = settings
  const composePopupWidth = mdAbove ? 754 : smAbove ? 520 : '100%'

  const routeParams = {
    label: label || '',
    folder: folder || 'inbox'
  }

  useEffect(() => {
    setLoading(true);
    dispatch(
      fetchData({
        mailStatus: mailStatus,
        mailType: MailType,
        q: query
      })
    ).then(setLoading(false))
  }, [mailStatus, MailType, query,dispatch])

  // useEffect(() => {
  //   // @ts-ignore
  //   dispatch(fetchMails({ q: query || '', folder: routeParams.folder, label: routeParams.label }))
  // }, [dispatch, query, routeParams.folder, routeParams.label])

  const toggleComposeOpen = () => setComposeOpen(!composeOpen)
  const handleLeftSidebarToggle = () => setLeftSidebarOpen(!leftSidebarOpen)
  if(loading)
    return <Loading header={'Please Wait'} description={'Mails are loading'} ></Loading>

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        borderRadius: 1,
        overflow: 'hidden',
        position: 'relative',
        boxShadow: skin === 'bordered' ? 0 : 6,
        ...(skin === 'bordered' && { border: `1px solid ${theme.palette.divider}` })
      }}
    >
      <SidebarLeft
        labelColors={labelColors}
        store={store}
        hidden={hidden}
        lgAbove={lgAbove}
        dispatch={dispatch}
        mailDetailsOpen={mailDetailsOpen}
        leftSidebarOpen={leftSidebarOpen}
        leftSidebarWidth={leftSidebarWidth}
        toggleComposeOpen={toggleComposeOpen}
        setMailDetailsOpen={setMailDetailsOpen}
        handleSelectAllMail={handleSelectAllMail}
        handleLeftSidebarToggle={handleLeftSidebarToggle}
        setMailType={setMailType}
        MailType={MailType}
      />
      <MailLog
        query={query}
        store={store}
        hidden={hidden}
        lgAbove={lgAbove}
        dispatch={dispatch}
        setQuery={setQuery}
        direction={direction}
        updateMail={updateMail}
        routeParams={routeParams}
        labelColors={labelColors}
        paginateMail={paginateMail}
        getCurrentMail={getCurrentMail}
        updateMailLabel={updateMailLabel}
        mailDetailsOpen={mailDetailsOpen}
        handleSelectMail={handleSelectMail}
        setMailDetailsOpen={setMailDetailsOpen}
        handleSelectAllMail={handleSelectAllMail}
        handleLeftSidebarToggle={handleLeftSidebarToggle}
      />
      {/* <ComposePopup
        mdAbove={mdAbove}
        composeOpen={composeOpen}
        composePopupWidth={composePopupWidth}
        toggleComposeOpen={toggleComposeOpen}
      /> */}
    </Box>
  )
}

export default EmailAppLayout
