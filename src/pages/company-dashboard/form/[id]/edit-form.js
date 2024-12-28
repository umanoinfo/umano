// ** React Imports
import { useState, forwardRef, useEffect, useRef, useCallback } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import LinearProgress from '@mui/material/LinearProgress'
import Card from '@mui/material/Card'
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
import View from '../view'

// ** Rsuite Imports
import { Form, Schema, DatePicker, TagPicker, Uploader, Input, InputPicker, SelectPicker } from 'rsuite'
import 'rsuite/dist/rsuite.min.css'

// ** Axios Imports
import axios from 'axios'

import { EditorOptions } from 'src/local-db'
import { FormType } from 'src/local-db'

// ** Actions Imports
import { fetchData } from 'src/store/apps/company'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import Loading from 'src/views/loading'
import NoPermission from 'src/views/noPermission'

import { styled } from '@mui/material/styles'

const { StringType, ArrayType } = Schema.Types

const styles = {
  marginBottom: 10
}
import dynamic from 'next/dynamic'

import 'suneditor/dist/css/suneditor.min.css' // Import Sun Editor's CSS File
// import SunEditor, { buttonList } from 'suneditor-react'

// buttonList: [
//   ['undo', 'redo'],
//   ['bold', 'underline', 'italic', 'list'],
//   ['table', 'link', 'image'],
//   ['align', 'font', 'fontColor', 'fontSize'],
//   ['preview', 'print'],
//   ['list'],
//   [
//     {
//       name: 'customLink',
//       dataDisplay: 'dialog',
//       title: 'Custom link',
//       buttonClass: '111',
//       innerHTML: 'Employee Name'
//     }
//   ]
// ]

const SunEditor = dynamic(() => import('suneditor-react'), {
  ssr: false
})

// SunEditor.insertHTML('...')

// const list = dynamic(() => import('suneditor/src/plugins/submenu/list'), {
//   ssr: false
// })

const plugins = dynamic(() => import('suneditor/src/plugins'), {
  ssr: false
})

// import SunEditor, { buttonList } from 'suneditor-react'

// import suneditor from 'suneditor'
// import plugins from 'suneditor/src/plugins'
// import list from 'suneditor/src/plugins/submenu/list'

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
  const [type, setType] = useState()
  const [loadingDescription, setLoadingDescription] = useState('')
  const [value, setValue] = useState('')
  const [form, setForm] = useState(false)
  const [open, setOpen] = useState(false)
  const [action, setAction] = useState('add')
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState([])
  const [selectedForm, setSelectedForm] = useState()

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

  const [cursorPosition, setCursorPosition] = useState(0)
  const [textBeforeCursorPosition, setTextBeforeCursorPosition] = useState('')
  const [textAfterCursorPosition, setTextAfterCursorPosition] = useState('')
  const [content, setContent] = useState('')
  const [divcontent, setDivcontent] = useState('')
  const [selectValue, setSelectValue] = useState('')

  const [statusDataSource, setStatusTypesDataSource] = useState([
    { label: 'Active', value: 'active' },
    { label: 'Pending', value: 'pending' },
    { label: 'Blocked', value: 'blocked' }
  ])



  const getForm =  () => {
    setLoading(true);
    axios.get('/api/form/' + id, {}).then(res => {
      setSelectedForm(res.data.data[0])
      setFormValue(res.data.data[0])
      setContent(res.data.data[0].content)
      setLoading(false);
    }).catch((err)=>{})
  }  ;
  
  useEffect(() => {
    getForm()
  }, [ ])

  const editorRef = useRef()

  const getSunEditorInstance = sunEditor => {
    editorRef.current = sunEditor
  }

  // ------------------------------ validate Mmodel ------------------------------------

  const validateMmodel = Schema.Model({
    title: StringType().isRequired('This field is required.'),
    type: StringType().isRequired('This field is required.'),
    version: StringType().isRequired('This field is required.')
  })

  // ------------------------------- Submit --------------------------------------

  const handleSubmit = () => {
    formRef.current.checkAsync().then(result => {
      if (!result.hasError) {
        let data = {}
        data._id = id
        data.title = formValue.title
        data.version = formValue.version
        data.type = formValue.type
        data.description = formValue.description
        data.content = content
        data.status = formValue.status
        data.updated_at = new Date()
        setLoading(true)
        setLoadingDescription('Form is updating')
        axios
          .post('/api/form/edit-form', {
            data
          })
          .then(function (response) {
            router.push('/company-dashboard/form')
            toast.success('Form (' + data.title + ') Updated Successfully.', {
              delay: 3000,
              position: 'bottom-right'
            })
          })
          .catch(function (error) {
            toast.error('Error : ' + error.response.data.message + ' !', {
              delay: 3000,
              position: 'bottom-right'
            })
            setLoading(false)
          })
      }
    })
  }

  // -------------------------------- Routes -----------------------------------------------

  const close = () => {
    router.push('/company-dashboard/department')
  }

  //--------------------------- View Form -----------------------------------

  const viewForm = e => {
    let temp = files
    temp.push(e.blobFile)
    setFiles(temp)
  }

  function test2(str, EditorOptions) {
    let new_string = str
    for (let index = 0; index < EditorOptions.length; index++) {
      const element = EditorOptions[index]
      let v = new_string.split(element.key)
      let ret = ''
      for (let index = 1; index < v.length; index++) {
        ret = ret + element.replace + v[index]
      }
      new_string = v[0] + ret
    }

    return new_string
  }

  // ------------------------------ View ---------------------------------

  if (loading) return <Loading header='Please Wait' description={loadingDescription}></Loading>

  if (session && session.user && !session.user.permissions.includes('EditForm'))
    return <NoPermission header='No Permission' description='No permission to edit form'></NoPermission>

  return (
    <>
      <Grid item xs={12} sm={6} lg={6}></Grid>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title='Edit Form' sx={{ pb: 0, pt: 2 }} />
            <Divider />
            <Grid container>
              <Grid item xs={12} sm={12} md={12} sx={{ p: 2, px: 5, mb: 5 }}>
                <Form
                  fluid
                  ref={formRef}
                  onChange={setFormValue}
                  onCheck={setFormError}
                  formValue={formValue}
                  model={validateMmodel}
                >
                  <Grid container spacing={1} sx={{ px: 5 }}>
                    <Grid item sm={12} md={4}>
                      <small>Type</small>
                      <Form.Control
                        size='sm'
                        controlId='type'
                        value={type}
                        name='type'
                        accepter={SelectPicker}
                        data={FormType}
                        block
                      />
                    </Grid>
                    <Grid item sm={12} md={6}>
                      <small>Title</small>
                      <Form.Control controlId='title' size='sm' name='title' placeholder='Title' />
                    </Grid>
                    <Grid item sm={12} md={2}>
                      <small>Version</small>
                      <Form.Control controlId='version' size='sm' type='number' name='version' placeholder='Version' />
                    </Grid>
                    <Grid container spacing={2}>
                      <Grid item size='sm' sm={12} md={9} sx={{ mt: 2 }}>
                        <small>Description</small>
                        <Form.Control rows={2} name='description' controlId='description'  />
                      </Grid>
                      <Grid item sm={12} xs={12} md={3} mt={2}>
                        <small>Select status</small>
                        <Form.Control
                          size='md'
                          name='status'
                          value={status}
                          data={statusDataSource}
                          accepter={InputPicker}
                          block
                        />
                      </Grid>
                    </Grid>
                    <Grid item size='sm' sm={12} md={12} sx={{ mt: 2 }}>
                      <small>Content</small>
                      <Box
                        sx={{
                          backgroundColor: '#fafafa',
                          borderTop: 1,
                          borderLeft: 0.5,
                          borderRight: 1,
                          padding: 2,
                          borderBlockColor: '#dadada'
                        }}
                      >
                        <span>Add function</span>
                        <select
                          style={{
                            backgroundColor: '#fafafa',
                            borderBlockColor: '#dadada',
                            borderRadius: 4,
                            height: 30,
                            marginLeft: 8
                          }}
                          value={selectValue}
                          onChange={e => {
                            // setContent(content + e.target.value);
                            editorRef.current.insertHTML('<span>' + e.target.value + '</span>', false, true, 0)
                            setContent(editorRef.current.getContents())

                            // setDivcontent(test2(editorRef.current.getContents(), arr))
                            setSelectValue('')
                          }}
                        >
                          <option value=''>Select</option>
                          {EditorOptions.map(val => (
                            <option key={val.key} value={val.key}>
                              {val.label}
                            </option>
                          ))}
                        </select>
                      </Box>
                      <SunEditor
                        getSunEditorInstance={getSunEditorInstance}
                        setAllPlugins={true}
                        setOptions={{
                          height: '350',
                          buttonList: [
                            ['undo', 'redo'],
                            ['bold', 'underline', 'italic', 'list'],
                            ['table', 'link', 'image'],
                            ['align', 'font', 'fontColor', 'fontSize', 'paragraphStyle'],
                            ['codeView', 'preview']
                          ]
                        }}
                        setContents={content}
                        onChange={e => {
                          setContent(e)
                          setDivcontent(test2(e, EditorOptions))
                        }}
                      />
                    </Grid>

                    <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 40, mt: 5 }}>
                      {!loading && (
                        <>
                          {action == 'add' && (
                            <Button color='success' onClick={handleSubmit} variant='contained' sx={{ mr: 3 }}>
                              Update
                            </Button>
                          )}
                          {action == 'edit' && (
                            <Button color='success' onClick={handleSubmit} variant='contained' sx={{ mr: 3 }}>
                              Update
                            </Button>
                          )}
                          <Button
                            type='button'
                            color='warning'
                            variant='contained'
                            sx={{ mr: 3 }}
                            onClick={() => setForm(false)}
                          >
                            Close
                          </Button>
                        </>
                      )}
                    </Box>
                  </Grid>
                </Form>
              </Grid>
            </Grid>
            <Grid container sx={{ px: 5, m: 5 }}>
              <small>Preview</small>
              <View divcontent={divcontent}></View>
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
