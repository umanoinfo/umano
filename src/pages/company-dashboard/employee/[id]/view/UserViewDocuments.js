import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'

// ** React Imports
import { Fragment } from 'react'
import { Divider } from '@mui/material'

// ** MUI Imports
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

const UserViewOverview = ({ employee }) => {
  const open_file = fileName => {
    window.open('https://robin-sass.pioneers.network/assets/testFiles/employeeDocument/' + fileName, '_blank')
  }

  return (
    <>
      {employee && employee.documents_info && (
        <Grid xs={12} md={12} lg={12} sx={{ px: 1, mt: 2 }}>
          {employee.documents_info.map(doc => {
            return (
              <Card xs={12} md={12} lg={12} sx={{ mb: 1 }}>
                <Grid container sx={{ px: 1 }}>
                  <CardContent sx={{ p: theme => `${theme.spacing(6)} !important` }}>
                    <Typography variant='h6' sx={{ mb: 2 }}>
                      {doc.documentTitle}
                    </Typography>
                    {/* <Box sx={{ py: 1, mb: 1, display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
              <Typography variant='body2'>4 Star | 98 reviews</Typography>
            </Box> */}
                    <Typography variant='body2'>{doc.documentDescription}</Typography>
                    <Grid container spacing={3}>
                      <Grid item sm={12} xs={12} mt={2}>
                        <div>
                          <small>Document ID : </small> {doc.documentNo}
                        </div>
                        {doc.expiryDate && (
                          <div>
                            <small>Expiry Date : </small> {doc.expiryDate}
                          </div>
                        )}
                      </Grid>
                      <Divider sx={{ pt: '2 !important' }} />

                      <Fragment sx={{ pt: '2 !important' }}>
                        <List dense>
                          {doc.file && (
                            <ListItem disablePadding sx={{ mr: 8, ml: 3 }}>
                              <ListItemIcon>
                                <Icon icon='icon-park-outline:id-card-h' fontSize={20} />
                              </ListItemIcon>
                              <a href='#' onClick={() => open_file(doc.file)}>
                                <ListItemText primary='Show Documents' />
                              </a>
                            </ListItem>
                          )}
                        </List>
                      </Fragment>
                    </Grid>
                  </CardContent>
                </Grid>
              </Card>
            )
          })}
        </Grid>
      )}
    </>
  )
}

export default UserViewOverview
