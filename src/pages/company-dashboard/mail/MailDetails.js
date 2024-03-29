// ** React Imports
import { Fragment, useState } from 'react'

// ** MUI Imports
import List from '@mui/material/List'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import ListItem from '@mui/material/ListItem'
import { styled } from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import ListItemIcon from '@mui/material/ListItemIcon'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// ** Hooks
import { useSettings } from 'src/@core/hooks/useSettings'

// ** Custom Components Imports
import Sidebar from 'src/@core/components/sidebar'
import CustomChip from 'src/@core/components/mui/chip'
import OptionsMenu from 'src/@core/components/option-menu'

const HiddenReplyBack = styled(Box)(({ theme }) => ({
  height: 11,
  width: '90%',
  opacity: 0.5,
  borderWidth: 1,
  borderBottom: 0,
  display: 'block',
  marginLeft: 'auto',
  marginRight: 'auto',
  borderStyle: 'solid',
  borderColor: theme.palette.divider,
  borderTopLeftRadius: theme.shape.borderRadius,
  borderTopRightRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper
}))

const HiddenReplyFront = styled(Box)(({ theme }) => ({
  height: 12,
  width: '95%',
  opacity: 0.7,
  borderWidth: 1,
  borderBottom: 0,
  display: 'block',
  marginLeft: 'auto',
  marginRight: 'auto',
  borderStyle: 'solid',
  borderColor: theme.palette.divider,
  borderTopLeftRadius: theme.shape.borderRadius,
  borderTopRightRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper
}))

const MailDetails = props => {
  // ** Props
  const {
    mail,
    hidden,
    folders,
    dispatch,
    direction,
    updateMail,
    foldersObj,
    labelColors,
    routeParams,
    paginateMail,
    handleStarMail,
    mailDetailsOpen,
    handleLabelUpdate,
    handleFolderUpdate,
    setMailDetailsOpen
  } = props

  // ** State
  const [showReplies, setShowReplies] = useState(false)

  // ** Hook
  const { settings } = useSettings()

  const handleMoveToTrash = () => {
    dispatch(updateMail({ emailIds: [mail.id], dataToUpdate: { folder: 'trash' } }))
    setMailDetailsOpen(false)
  }

  const handleReadMail = () => {
    dispatch(updateMail({ emailIds: [mail.id], dataToUpdate: { isRead: false } }))
    setMailDetailsOpen(false)
  }

  const handleLabelsMenu = () => {
    const array = []
    Object.entries(labelColors).map(([key, value]) => {
      array.push({
        text: <Typography sx={{ textTransform: 'capitalize' }}>{key}</Typography>,
        icon: (
          <Box component='span' sx={{ mr: 2, color: `${value}.main` }}>
            <Icon icon='mdi:circle' fontSize='0.75rem' />
          </Box>
        ),
        menuItemProps: {
          onClick: () => {
            handleLabelUpdate([mail.id], key)
            setMailDetailsOpen(false)
          }
        }
      })
    })

    return array
  }

  const handleFoldersMenu = () => {
    const array = []
    if (routeParams && routeParams.folder && !routeParams.label && foldersObj[routeParams.folder]) {
      foldersObj[routeParams.folder].map(folder => {
        array.length = 0
        array.push({
          icon: folder.icon,
          text: <Typography sx={{ textTransform: 'capitalize' }}>{folder.name}</Typography>,
          menuItemProps: {
            onClick: () => {
              handleFolderUpdate(mail.id, folder.name)
              setMailDetailsOpen(false)
            }
          }
        })
      })
    } else if (routeParams && routeParams.label) {
      folders.map(folder => {
        array.length = 0
        array.push({
          icon: folder.icon,
          text: <Typography sx={{ textTransform: 'capitalize' }}>{folder.name}</Typography>,
          menuItemProps: {
            onClick: () => {
              handleFolderUpdate(mail.id, folder.name)
              setMailDetailsOpen(false)
            }
          }
        })
      })
    } else {
      foldersObj['inbox'].map(folder => {
        array.length = 0
        array.push({
          icon: folder.icon,
          text: <Typography sx={{ textTransform: 'capitalize' }}>{folder.name}</Typography>,
          menuItemProps: {
            onClick: () => {
              handleFolderUpdate(mail.id, folder.name)
              setMailDetailsOpen(false)
            }
          }
        })
      })
    }

    return array
  }
  const prevMailIcon = direction === 'rtl' ? 'mdi:chevron-right' : 'mdi:chevron-left'
  const nextMailIcon = direction === 'rtl' ? 'mdi:chevron-left' : 'mdi:chevron-right'
  const goBackIcon = prevMailIcon

  const ScrollWrapper = ({ children }) => {
    if (hidden) {
      return <Box sx={{ height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>{children}</Box>
    } else {
      return <PerfectScrollbar options={{ wheelPropagation: false }}>{children}</PerfectScrollbar>
    }
  }

  return (
    <Sidebar
      hideBackdrop
      direction='right'
      show={mailDetailsOpen}
      sx={{ zIndex: 3, width: '100%', overflow: 'hidden' }}
      onClose={() => {
        setMailDetailsOpen(false)
        setShowReplies(false)
      }}
    >
      {mail ? (
        <Fragment>
          <Box
            sx={{
              px: 2.6,
              py: [2.25, 3],
              backgroundColor: 'background.paper',
              borderBottom: theme => `1px solid ${theme.palette.divider}`
            }}
          >
            <Box sx={{ display: 'flex', alignItems: ['flex-start', 'center'], justifyContent: 'space-between' }}>
              <Box
                sx={{
                  display: 'flex',
                  overflow: 'hidden',
                  alignItems: 'center',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis'
                }}
              >
                <IconButton
                  sx={{ mr: 3, '& svg': { color: 'text.primary' } }}
                  onClick={() => {
                    setMailDetailsOpen(false)
                    setShowReplies(false)
                  }}
                >
                  <Icon icon={goBackIcon} fontSize='1.5rem' />
                </IconButton>
                <Box
                  sx={{
                    display: 'flex',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    flexDirection: ['column', 'row']
                  }}
                >
                  <Typography noWrap sx={{ mr: 5 }}>
                    {mail.subject}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {
                      <CustomChip
                        size='small'
                        skin='light'
                        label={mail.type}
                        color={labelColors[mail.type]}
                        sx={{
                          height: 20,
                          textTransform: 'capitalize',
                          '&:not(:last-of-type)': { mr: 2 },
                          '& .MuiChip-label': { fontWeight: 500 }
                        }}
                      />
                    }
                  </Box>
                </Box>
              </Box>
              {/* <Box sx={{ display: 'flex' }}>
                <IconButton
                  size='small'
                  disabled={!mail.hasPreviousMail}
                  sx={{ color: mail.hasPreviousMail ? 'text.primary' : 'text.secondary' }}
                  onClick={() => dispatch(paginateMail({ dir: 'previous', emailId: mail.id }))}
                >
                  <Icon icon={prevMailIcon} />
                </IconButton>
                <IconButton
                  size='small'
                  disabled={!mail.hasNextMail}
                  sx={{ color: mail.hasNextMail ? 'text.primary' : 'text.secondary' }}
                  onClick={() => dispatch(paginateMail({ dir: 'next', emailId: mail.id }))}
                >
                  <Icon icon={nextMailIcon} />
                </IconButton>
              </Box> */}
            </Box>
          </Box>
          {/* <Box
            sx={{
              backgroundColor: 'background.paper',
              p: theme => theme.spacing(3, 2, 3, 3),
              borderBottom: theme => `1px solid ${theme.palette.divider}`
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {routeParams && routeParams.folder !== 'trash' ? (
                  <IconButton size='small' onClick={handleMoveToTrash}>
                    <Icon icon='mdi:delete-outline' />
                  </IconButton>
                ) : null}

                <IconButton size='small' onClick={handleReadMail}>
                  <Icon icon='mdi:email-outline' fontSize='1.375rem' />
                </IconButton>
                <OptionsMenu
                  leftAlignMenu
                  options={handleFoldersMenu()}
                  iconButtonProps={{ size: 'small' }}
                  icon={<Icon icon='mdi:folder-outline' fontSize='1.375rem' />}
                />
                <OptionsMenu
                  leftAlignMenu
                  options={handleLabelsMenu()}
                  iconButtonProps={{ size: 'small' }}
                  icon={<Icon icon='mdi:label-outline' fontSize='1.375rem' />}
                />
              </Box>
              <div>
                <IconButton
                  size='small'
                  onClick={e => handleStarMail(e, mail.id, !mail.isStarred)}
                  sx={{ mr: 1, ...(mail.isStarred ? { color: 'warning.main' } : {}) }}
                >
                  <Icon icon='mdi:star-outline' />
                </IconButton>

                <IconButton size='small'>
                  <Icon icon='mdi:dots-vertical' />
                </IconButton>
              </div>
            </Box>
          </Box> */}
          <Box sx={{ height: 'calc(100% - 7.75rem)', backgroundColor: 'action.hover' }}>
            <ScrollWrapper>
              <Box
                sx={{
                  py: 4,
                  px: 5,
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
              >
                <Box
                  sx={{
                    mb: 4,
                    width: '100%',
                    borderRadius: 1,
                    overflow: 'visible',
                    position: 'relative',
                    backgroundColor: 'background.paper',
                    boxShadow: settings.skin === 'bordered' ? 0 : 6,
                    border: theme => `1px solid ${theme.palette.divider}`
                  }}
                >
                  <Box sx={{ p: 5 }}>
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar alt={mail.user_info[0].name} sx={{ width: '2.375rem', height: '2.375rem', mr: 3 }} />
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography sx={{ color: 'text.secondary' }}>{mail.user_info[0].name}</Typography>
                          <Typography variant='body2' sx={{ color: 'text.disabled' }}>
                            {mail.user_info[0].email}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant='body2' sx={{ mr: 1.75, color: 'text.disabled' }}>
                          {new Date(mail.created_at).toDateString()}{' '}
                          {new Date(mail.created_at).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </Typography>
                        {/* <OptionsMenu
                          iconButtonProps={{ size: 'small' }}
                          iconProps={{ fontSize: '1.375rem' }}
                          options={[
                            {
                              text: 'Reply',
                              menuItemProps: { sx: { '& svg': { mr: 2 } } },
                              icon: <Icon icon='mdi:share-outline' fontSize={20} />
                            },
                            {
                              text: 'Forward',
                              menuItemProps: { sx: { '& svg': { mr: 2 } } },
                              icon: <Icon icon='mdi:reply-outline' fontSize={20} />
                            }
                          ]}
                        /> */}
                      </Box>
                    </Box>
                  </Box>
                  <Divider sx={{ m: '0 !important' }} />
                  <Box sx={{ px: 5, py: 0, mb: '30px' }}>
                    <Box sx={{ color: 'text.secondary' }}>
                      <h2>{mail.subject}</h2>
                      <div className='form-container'>Mr/Mrs : {mail.toUser}</div>
                      <p>{mail.message}</p>
                      <p>Date : {mail.date}</p>
                      Email sent from :{mail.user}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </ScrollWrapper>
          </Box>
        </Fragment>
      ) : null}
    </Sidebar>
  )
}

export default MailDetails
