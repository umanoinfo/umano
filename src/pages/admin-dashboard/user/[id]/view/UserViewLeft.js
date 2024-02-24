// ** React Imports
import { useCallback, useEffect, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import Select from '@mui/material/Select'
import Switch from '@mui/material/Switch'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import { styled } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import InputLabel from '@mui/material/InputLabel'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import InputAdornment from '@mui/material/InputAdornment'
import LinearProgress from '@mui/material/LinearProgress'
import FormControlLabel from '@mui/material/FormControlLabel'
import DialogContentText from '@mui/material/DialogContentText'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'
import UserSuspendDialog from 'src/views/apps/user/view/UserSuspendDialog'
import UserSubscriptionDialog from 'src/views/apps/user/view/UserSubscriptionDialog'

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials'
import axios from 'axios'
import { CircularProgress } from '@mui/material'
import { tr } from 'date-fns/locale'

const roleColors = {
  admin: 'error',
  editor: 'info',
  author: 'warning',
  maintainer: 'success',
  subscriber: 'primary'
}

const statusColors = {
  active: 'success',
  pending: 'warning',
  inactive: 'secondary'
}

// ** Styled <sup> component
const Sup = styled('sup')(({ theme }) => ({
  top: '0.2rem',
  left: '-0.6rem',
  position: 'absolute',
  color: theme.palette.primary.main
}))

// ** Styled <sub> component
const Sub = styled('sub')({
  fontWeight: 300,
  fontSize: '1rem',
  alignSelf: 'flex-end'
})

const UserViewLeft = ({ id }) => {
  // ** States
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState()

   // ------------------------------ Get User ------------------------------------------------

   const getUser = useCallback( () => {
    setLoading(true)
    axios
      .get('/api/user/' + id, {})
      .then(function (response) {
        setUser(response.data.data[0])
        setLoading(false)
      })
      .catch(function (error) {
        setLoading(false)
      })
  }, [id ]);

  useEffect(() => {
    getUser()
  }, [getUser])

 

  if (user) {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12}>
          {!loading && (
            <Card>
              <CardContent sx={{ pt: 15, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                {user.img && user.img.length ? (
                  <CustomAvatar
                    src={data.avatar}
                    variant='rounded'
                    alt={user.name}
                    sx={{ width: 120, height: 120, fontWeight: 600, mb: 4, fontSize: '3rem' }}
                  />
                ) : (
                  <CustomAvatar
                    skin='light'
                    variant='rounded'
                    color={user.avatarColor}
                    sx={{ width: 120, height: 120, fontWeight: 600, mb: 4, fontSize: '3rem' }}
                  >
                    {getInitials(user.name)}
                  </CustomAvatar>
                )}
                <Typography variant='h6' sx={{ mb: 2 }}>
                  {user.name}
                </Typography>
                 <CustomChip
                  skin='light'
                  size='small'
                  label={user.email}
                  color={roleColors[user.role]}
                  sx={{
                    height: 20,
                    fontWeight: 600,
                    borderRadius: '5px',
                    fontSize: '0.875rem',
                    textTransform: 'capitalize',
                    '& .MuiChip-label': { mt: -0.25 }
                  }}
                />
              </CardContent>

              {/* <CardContent sx={{ my: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Box sx={{ mr: 8, display: 'flex', alignItems: 'center' }}>
                    <CustomAvatar skin='light' variant='rounded' sx={{ mr: 3 }}>
                      <Icon icon='mdi:check' />
                    </CustomAvatar>
                    <div>
                      <Typography variant='h6' sx={{ lineHeight: 1.3 }}>
                        1.23k
                      </Typography>
                      <Typography variant='body2'>Card Done</Typography>
                    </div>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CustomAvatar skin='light' variant='rounded' sx={{ mr: 3 }}>
                      <Icon icon='mdi:briefcase-variant-outline' />
                    </CustomAvatar>
                    <div>
                      <Typography variant='h6' sx={{ lineHeight: 1.3 }}>
                        5680
                      </Typography>
                      <Typography variant='body2'>Activity</Typography>
                    </div>
                  </Box>
                </Box>
              </CardContent> */}

              <CardContent>
                <Typography variant='h6'>Details</Typography>
                <Divider sx={{ mt: theme => `${theme.spacing(4)} !important` }} />
                <Box sx={{ pt: 2, pb: 1 }}>
                  <Box sx={{ display: 'flex', mb: 2.7 }}>
                    <Typography variant='subtitle2' sx={{ mr: 2, color: 'text.primary' }}>
                      User name:
                    </Typography>
                    <Typography variant='body2'>{user.name}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', mb: 2.7 }}>
                    <Typography variant='subtitle2' sx={{ mr: 2, color: 'text.primary' }}>
                      Email:
                    </Typography>
                    <Typography variant='body2'>{user.email}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', mb: 2.7 }}>
                    <Typography variant='subtitle2' sx={{ mr: 2, color: 'text.primary' }}>
                      Status:
                    </Typography>
                    <CustomChip
                      skin='light'
                      size='small'
                      label={user.status}
                      color={statusColors[user.status]}
                      sx={{
                        height: 20,
                        fontWeight: 500,
                        fontSize: '0.75rem',
                        borderRadius: '5px',
                        textTransform: 'capitalize'
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', mb: 2.7 }}>
                    <Typography sx={{ mr: 2, fontWeight: 500, fontSize: '0.875rem' }}>Roles:</Typography>
                    <Typography variant='body2' sx={{ textTransform: 'capitalize' }}>
                      {user.roles_info.map((role, index) => {
                        return (
                          <CustomChip
                            key={index}
                            skin='light'
                            size='small'
                            label={role.title}
                            color='info'
                            sx={{
                              mx: 0.5,
                              height: 20,
                              fontWeight: 400,
                              borderRadius: '5px',
                              fontSize: '0.875rem',
                              textTransform: 'capitalize',
                              '& .MuiChip-label': { mt: -0.25 }
                            }}
                          />
                        )
                      })}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', mb: 2.7 }}>
                    <Typography sx={{ mr: 2, fontWeight: 500, fontSize: '0.875rem' }}>Type:</Typography>
                    <Typography variant='body2' sx={{ textTransform: 'capitalize' }}>
                      {user.type}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', mb: 2.7 }}>
                    <Typography sx={{ mr: 2, fontWeight: 500, fontSize: '0.875rem' }}>Created at:</Typography>
                    <Typography variant='body2' sx={{ textTransform: 'capitalize' }}>
                      {user.created_at}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}
          {loading && (
            <Box sx={{ display: 'flex' }}>
              <CircularProgress />
            </Box>
          )}
        </Grid>
      </Grid>
    )
  } else {
    return null
  }
}

export default UserViewLeft
