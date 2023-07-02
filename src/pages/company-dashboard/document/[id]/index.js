// ** React Imports
import { useState, forwardRef, useEffect, useRef } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import LinearProgress from '@mui/material/LinearProgress'
import Card from '@mui/material/Card'
import CustomChip from 'src/@core/components/mui/chip'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Icon from 'src/@core/components/icon'
import { Divider, InputAdornment, Typography } from '@mui/material'
import List from '@mui/material/List'
import ListItemText from '@mui/material/ListItemText'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction'
import ListItem from '@mui/material/ListItem'
import Avatar from '@mui/material/Avatar'
import toast from 'react-hot-toast'

// ** Rsuite Imports
import { Form, Schema, DatePicker, TagPicker, Uploader, Input, Checkbox, Textarea } from 'rsuite'
import 'rsuite/dist/rsuite.min.css'

// ** Axios Imports
import axios from 'axios'

// ** Actions Imports
import { fetchData } from 'src/store/apps/company'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import Loading from 'src/views/loading'
import NoPermission from 'src/views/noPermission'

import { styled } from '@mui/material/styles'
import { grey } from '@mui/material/colors'

const { StringType, ArrayType } = Schema.Types

const styles = {
  marginBottom: 10
}

const fileType = ex => {
  switch (ex) {
    case 'jpg':
      return '/images/icons/file-icons/img.png'
      break
    default:
      return '/images/icons/file-icons/rar.png'
  }
}

const StyledList = styled(List)(({ theme }) => ({
  '& .MuiListItem-container': {
    border: `1px solid ${theme.palette.divider}`,
    '&:first-of-type': {
      borderTopLeftRadius: theme.shape.borderRadius,
      borderTopRightRadius: theme.shape.borderRadius
    },
    '&:last-child': {
      borderBottomLeftRadius: theme.shape.borderRadius,
      borderBottomRightRadius: theme.shape.borderRadius
    },
    '&:not(:last-child)': {
      borderBottom: 0
    },
    '& .MuiListItem-root': {
      paddingRight: theme.spacing(24)
    },
    '& .MuiListItemText-root': {
      marginTop: 0,
      '& .MuiTypography-root': {
        fontWeight: 500
      }
    }
  }
}))

const AddDepartment = ({ popperPlacement, id }) => {
  // ** States
  const [employeeId, setEmployeeId] = useState('')
  const [plan, setPlan] = useState('')
  const [loadingDescription, setLoadingDescription] = useState('')
  const [value, setValue] = useState('')
  const [form, setForm] = useState(false)
  const [action, setAction] = useState('add')
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState([])
  const [selectedDocument, setSelectedDocument] = useState()

  const [expiryDateFlag, setExpiryDateFlag] = useState(false)
  const [expiryDate, setExpiryDate] = useState(new Date().toISOString().substring(0, 10))
  const [preparedDate, setPreparedDate] = useState(new Date().toISOString().substring(0, 10))
  const [preparedBy, setPreparedBy] = useState()
  const [approvedDate, setApprovedDate] = useState(new Date().toISOString().substring(0, 10))
  const [approvedBy, setApprovedBy] = useState()
  const router = useRouter()
  const { data: session, status } = useSession
  const formRef = useRef()
  const inputFile = useRef(null)
  const [formError, setFormError] = useState({})
  const [formValue, setFormValue] = useState({})

  useEffect(() => {
    getDocument()
  }, [])

  const getDocument = () => {
    setLoading(true)
    axios.get('/api/document/' + id, {}).then(response => {
      setSelectedDocument(response.data.data[0])
      setLoading(false)
    })
  }

  // -----------------------------------------------------------

  const open_file = fileName => {
    window.open('https://robin-sass.pioneers.network/assets/testFiles/document/' + fileName, '_blank')
  }

  // ----------------------------------------------------------

  const goToIndex = () => {
    router.push('/company-dashboard/document')
  }

  // -------------------------------- Routes -----------------------------------------------

  const close = () => {
    router.push('/company-dashboard/department')
  }

  const addToFiles = e => {
    let temp = files
    temp.push(e.blobFile)
    setFiles(temp)
  }

  const removeFile = e => {}

  // const Textarea = forwardRef((props, ref) => <Input as='textarea' />)

  // ------------------------------ View ---------------------------------

  if (loading) return <Loading header='Please Wait' description={loadingDescription}></Loading>

  if (session && session.user && !session.user.permissions.includes('ViewDocument'))
    return <NoPermission header='No Permission' description='No permission to view document'></NoPermission>

  return (
    <>
      <Grid item xs={12} sm={6} lg={6}></Grid>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title='View Document' sx={{ pb: 0, pt: 2 }} />
            <Divider />
            <Grid container>
              <Grid item xs={12} sm={6} md={6} sx={{ p: 2, px: 5, mb: 5 }}>
                {selectedDocument && (
                  <Card>
                    <CardContent sx={{ pt: 8, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                      <Typography variant='h6' sx={{ mb: 2 }}>
                        {selectedDocument.title}
                      </Typography>
                      {selectedDocument.description}
                      <Box>
                        {selectedDocument.type.map((t, index) => {
                          return (
                            <CustomChip
                            key ={index}
                              skin='light'
                              size='small'
                              label={t}
                              color='info'
                              sx={{
                                height: 20,
                                mt: 3,
                                mr: 1,
                                fontWeight: 600,
                                borderRadius: '5px',
                                fontSize: '0.875rem',
                                textTransform: 'capitalize',
                                '& .MuiChip-label': { mt: -0.25 }
                              }}
                            />
                          )
                        })}
                      </Box>
                    </CardContent>

                    <CardContent>
                      <Typography variant='h6'>Details</Typography>
                      <Divider sx={{ mt: theme => `${theme.spacing(4)} !important` }} />
                      <Box sx={{ pt: 2, pb: 1 }}>
                        {selectedDocument.version && (
                          <Box sx={{ display: 'flex', mb: 2.7 }}>
                            <Typography variant='subtitle2' sx={{ mr: 2, color: 'text.primary' }}>
                              Version:
                            </Typography>
                            <Typography variant='body2' sx={{ textTransform: 'capitalize' }}>
                              {selectedDocument.version}
                            </Typography>
                          </Box>
                        )}
                        {selectedDocument.status && (
                          <Box sx={{ display: 'flex', mb: 2.7 }}>
                            <Typography variant='subtitle2' sx={{ mr: 2, color: 'text.primary' }}>
                              Status:
                            </Typography>
                            <Typography variant='body2' sx={{ textTransform: 'capitalize' }}>
                              {selectedDocument.status}
                            </Typography>
                          </Box>
                        )}
                        {selectedDocument.created_at && (
                          <Box sx={{ display: 'flex', mb: 2.7 }}>
                            <Typography variant='subtitle2' sx={{ mr: 2, color: 'text.primary' }}>
                              Created at:
                            </Typography>
                            <Typography variant='body2' sx={{ textTransform: 'capitalize' }}>
                              {new Date(selectedDocument.created_at).toISOString().substring(0, 10)}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                )}
              </Grid>
              <Grid item xs={12} sm={6} md={6} sx={{ p: 2, px: 5, mb: 5 }}>
                <Card>
                  <Box
                    sx={{
                      pt: 2,
                      px: 2,
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Typography sx={{ fontWeight: 'bold' }}>Files</Typography>
                  </Box>

                  <Divider />
                  <Box sx={{ p: 2 }}>
                    {selectedDocument && selectedDocument.files_info.length == 0 && <span>No Files To Show.</span>}
                    {selectedDocument &&
                      selectedDocument.files_info.length > 0 &&
                      selectedDocument.files_info.map((file, index) => {
                        return (
                          <>
                            <Box
                              key={file.name}
                              sx={{
                                display: 'flex',
                                alignItems: 'center'
                              }}
                            >
                              <Card sx={{ p: 2, mr: 2 }}>
                                <Icon
                                  icon='material-symbols:file-present-outline-rounded'
                                  sx={{ color: 'text.primary' }}
                                />
                              </Card>
                              {/* <Avatar src={file.src} variant='rounded' sx={{ mr: 3, width: 38, height: 38 }} /> */}
                              <Box
                                sx={{
                                  width: '100%',
                                  display: 'flex',
                                  flexWrap: 'wrap',
                                  alignItems: 'center',
                                  justifyContent: 'space-between'
                                }}
                              >
                                <Box sx={{ mr: 2, display: 'flex', mb: 0.4, flexDirection: 'column' }}>
                                  <Typography variant='body2' sx={{ mb: 0.5, fontWeight: 600, color: 'text.primary' }}>
                                    <a href='#' onClick={e => open_file(file.url)}>
                                      {file.name}
                                    </a>
                                  </Typography>
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      '& svg': {
                                        mr: 1.5,
                                        color: 'text.secondary',
                                        verticalAlign: 'middle'
                                      }
                                    }}
                                  >
                                    <Icon icon='mdi:calendar-blank-outline' fontSize='1rem' />
                                    <Typography variant='caption'>
                                      {new Date(file.created_at).toISOString().toString(0, 10)}
                                    </Typography>
                                  </Box>
                                </Box>
                                {file.deleted_at && (
                                  <CustomChip
                                    skin='light'
                                    size='small'
                                    label='Canceled'
                                    color='error'
                                    sx={{ height: 20, fontSize: '0.75rem', fontWeight: 500 }}
                                  />
                                )}
                                {!file.deleted_at && (
                                  <CustomChip
                                    skin='light'
                                    size='small'
                                    label='Active'
                                    color='success'
                                    sx={{ height: 20, fontSize: '0.75rem', fontWeight: 500 }}
                                  />
                                )}
                              </Box>
                            </Box>
                            <Divider sx={{ mt: 0, pt: 0 }} />
                          </>
                        )
                      })}
                  </Box>
                </Card>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>
    </>
  )
}

AddDepartment.getInitialProps = async ({ query: { id } }) => {
  return { id: id }
}

export default AddDepartment
