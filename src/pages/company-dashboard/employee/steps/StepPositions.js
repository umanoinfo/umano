// ** MUI Imports
import MuiChip from '@mui/material/Chip'

// ** React Imports
import { useEffect, useRef, useState } from 'react'

// ** Next Import
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { DatePicker, Form, Loader, Schema, SelectPicker } from 'rsuite'

// ** Custom Components Imports
import { styled } from '@mui/material/styles'
import {
  Card,
  CardActions,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  LinearProgress,
  ListItemSecondaryAction,
  Paper
} from '@mui/material'

// ** React Imports
import { Fragment } from 'react'

import { PositionChangeStartTypes, PositionChangeEndTypes  , TerminationReasonsTyps} from 'src/local-db'

// ** MUI Imports
import List from '@mui/material/List'
import Divider from '@mui/material/Divider'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import ListItemButton from '@mui/material/ListItemButton'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Axios Imports
import axios from 'axios'
import { toast } from 'react-hot-toast'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Actions Imports
import { fetchData } from 'src/store/apps/employeePosition'
import { DataGrid } from '@mui/x-data-grid'
import Loading from 'src/views/loading'

const { StringType } = Schema.Types

// Styled Grid component
const StyledGrid1 = styled(Grid)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  [theme.breakpoints.down('md')]: {
    paddingTop: '0 !important'
  },
  '& .MuiCardContent-root': {
    padding: theme.spacing(3, 4.75),
    [theme.breakpoints.down('md')]: {
      paddingTop: 0
    }
  }
}))

// Styled Grid component
const StyledGrid2 = styled(Grid)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  [theme.breakpoints.up('md')]: {
    paddingLeft: '0 !important'
  },
  [theme.breakpoints.down('md')]: {
    order: -1
  }
}))

// Styled component for the image
const Img = styled('img')(({ theme }) => ({
  height: '11rem',
  borderRadius: theme.shape.borderRadius
}))

const Steppositions = ({ handleNext, employee }) => {

  const [emiratesID, setEmiratesID] = useState()
  const inputFrontEmiratesFile = useRef(null)
  const inputBackEmiratesFile = useRef(null)

  const [employeeId, setEmployeeId] = useState('')
  const [plan, setPlan] = useState('')
  const [userStatus, setUserStatus] = useState('')
  const [value, setValue] = useState('')
  const [form, setForm] = useState(false)
  const [action, setAction] = useState('add')
  const [positionChangeType, setPositionChangeType] = useState()
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [departmentsDataSource, setDepartmentsDataSource] = useState([])
  const [positionChangeStartTypes, setPositionChangeStartTypes] = useState([])
  const [positionChangeEndTypes, setPositionChangeEndTypes] = useState([])
  const [selectedPosition, setSelectedPosition] = useState()
  const [fileLoading, setFileLoading] = useState(false)
  const [startChangeType, setStartChangeType] = useState()
  const [startChangeDate, setStartChangeDate] = useState(new Date().toISOString().substring(0, 10))

  const [endChangeType, setEndChangeType] = useState('onPosition')
  const [endChangeDate, setEndChangeDate] = useState(new Date().toISOString().substring(0, 10))
  const [notAuthorized, setNotAuthorized] = useState([]);
  const dispatch = useDispatch()

  const store = useSelector(state => state.employeePosition)
  const departmentStore = useSelector(state => state.companyDepartment)
  const [department, setDepartment] = useState()
  const [openFileDialog, setOpenFileDialog] = useState(false)

  const [tempFile, setTempFile] = useState()
  const newinputFile = useRef(null)

  const [formError, setFormError] = useState({})
  const [formValue, setFormValue] = useState({})
  const [pageSize, setPageSize] = useState(7)
  const formRef = useRef()
  const [isManager, SetIsManager] = useState(0);
  const [positions , setPositions ] = useState([]);
  const [positionTitle , setPositionTitle] = useState('') ;
  const inputFile = useRef(null)


  const [terminationReason , setTerminationReason]= useState('other');
  const [terminationDate , setTerminationDate] = useState(new Date());
  const [terminationStatus , setTerminationStatus ] = useState(employee.terminationDate ? 'terminated' : 'notTerminated');


  // ----------------------- bulid -------------------------------------------

  const terminateEmployee = (action)=>{
    
    try{
      let data = {
        terminationDate ,
        terminationReason,
        action,
        employee_id: employee._id 
      };
      setAction('');
      axios.post('/api/terminate' , data).then((response)=>{
        toast.success(response?.data?.data , {duration:2000 , position:'bottom-right'});
        if(action=='terminate'){
          setTerminationStatus('terminated');
        }
        else{
          setTerminationStatus('notTerminated');
        }
      })
    }
    catch(err){

    }
  }
  
  const getPositions = async ()=>{
      
      try{
        axios.get('/api/position' , {}).then((response)=>{
          let positions = response?.data?.data?.map((position)=>{
            return {label: position.title , value: position.title}
          });
          setPositions(positions);

          console.log(response?.data?.data)
        })
      }
      catch(err){

      }
  }
  
  useEffect(() => {
    if (employee) {

      setLoading(true);
      setEmployeeId(employee._id)
      dispatch(
        fetchData({
          employeeId: employee._id,
          userStatus,
          q: value
        })
      ).then(() => {
        getDepartments().then(() => {
          getPositions().then(()=>{
            setLoading(false)
          })
        })
      })
      setEndChangeType('onPosition')
    }
  }, [dispatch, employeeId, userStatus, value])

  // ----------------------------- Get Options ----------------------------------

  const getDepartments = async () => {
    setLoading(true);
    axios.get('/api/company-department', {}).then(function (response) {
      const arr = response.data?.data?.map(department => ({
        label: department.name,
        value: department._id
      }))

      setDepartmentsDataSource(arr)
      if (response.data.data && response.data.data.length > 0)
        setDepartment(response.data.data[0]._id)
    }).catch((err) => {
      let message = '';
      if (err.response.status == 401) {
        message = 'Error: You do not have permission to View Departments';
        setNotAuthorized([...notAuthorized, 'ViewDepartment']);
        setDepartmentsDataSource([{
          label: <div style={{ color: 'red' }}> You do not have permission to View Departments </div>
          , value: undefined
        }]);
      }
      else if (err?.response?.data?.message) {
        message = err.response.data.message;
      }
      else {
        message = err.toString();
      }
      toast.error(message, { duration: 5000, position: 'bottom-right' });
    })

    const positionChangeStartTypes = PositionChangeStartTypes.map(type => ({
      label: type.title,
      value: type.value
    }))

    setPositionChangeStartTypes(positionChangeStartTypes)
    setStartChangeType(positionChangeStartTypes[0].value)

    const positionChangeEndTypes = PositionChangeEndTypes.map(type => ({
      label: type.title,
      value: type.value
    }))

    positionChangeEndTypes.push({ label: 'On Position', value: 'onPosition' })

    setPositionChangeEndTypes(positionChangeEndTypes)
    setEndChangeType(positionChangeEndTypes[0].value)
  }

  const validateMmodel = Schema.Model({
    // positionTitle: StringType().isRequired('Position Title is required'),

  })

  // ------------------------------- Submit --------------------------------------

  const handleSubmit = () => {
    formRef.current.checkAsync().then(result => {
      
      if (!result.hasError) {
        if (!department) {
          toast.error('Department is a required field', { duration: 5000, position: 'bottom-right' });
          
          return;
        }
        console.log(positionTitle);
        if(!positionTitle){
          toast.error('Position title is required', {duration:1000 , position:'bottom-right'}) ;

          return ;
        }

        setLoading(true)
        let data = { ...formValue }
        console.log(data);
        data.positionTitle = positionTitle
        data.startChangeType = startChangeType
        data.endChangeType = endChangeType
        data.isManager = isManager;
        data.department_id = department
        data.startChangeDate = startChangeDate
        data.employee_id = employee._id
        SetIsManager(0);
        if (endChangeType != 'onPosition') {
          data.endChangeDate = endChangeDate
        } else {
          delete data.endChangeDate
        }

        if (action == 'add') {
          data.file = tempFile
          data.created_at = new Date()
          axios
            .post('/api/employee-position/add-position', {
              data
            })
            .then(function (response) {
              dispatch(fetchData({ employeeId: employee._id })).then(() => {
                toast.success('Position (' + data.positionTitle + ') Inserted Successfully.', {
                  delay: 3000,
                  position: 'bottom-right'
                })
                setForm(false)
                setLoading(false)
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
        if (action == 'edit') {
          data._id = selectedPosition._id
          data.updated_at = new Date()
          axios
            .post('/api/employee-position/edit-position', {
              data
            })
            .then(function (response) {
              dispatch(fetchData({ employeeId: employee._id })).then(() => {
                toast.success('position (' + data.positionTitle + ') Inserted Successfully.', {
                  delay: 3000,
                  position: 'bottom-right'
                })
                setForm(false)
                setLoading(false)
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
      }
    })
  }

  const handleAdd = () => {
    setEndChangeType('onPosition');
    setSelectedPosition(null)
    setSelectedPosition({})
    setFormValue({})
    setAction('add')
    setForm(true)
  }
  
  const handleTermination = ()=>{
    setAction('terminate');
    setForm(false);
   }

  const handleDelete = e => {
    setSelectedPosition(e)
    setOpen(true)
  }

  const deletePosition = () => {
    setLoading(true)
    axios
      .post('/api/employee-position/delete-position', {
        selectedPosition
      })
      .then(function (response) {
        dispatch(fetchData({ employeeId: employeeId })).then(() => {
          toast.success('Employee Position (' + selectedPosition.positionTitle + ') Deleted Successfully.', {
            delay: 1000,
            position: 'bottom-right'
          })
          setOpen(false)
          setLoading(false);
        })
      })
      .catch(function (error) {
        toast.error('Error : ' + error.response.data.message + ' !', {
          delay: 1000,
          position: 'bottom-right'
        })
        setLoading(false)
      })
  }

  const uploadFile = async event => {
    setFileLoading(true)
    const file = event.target.files[0]
    let formData = new FormData()
    formData.append('file', file)
    console.log(selectedPosition)
    formData.append('id', selectedPosition._id)
    formData.append('type', 'employeePosition')
    let data = {}
    data.id = selectedPosition._id
    data.formData = formData
    axios
      .post('https://umanu.blink-techno.com/public/api/upload', formData)
      .then(response => {
        let data = {}
        data = {}
        data = { ...selectedPosition }
        data.updated_at = new Date()
        data.file = response.data
        delete data.department_info

        axios
          .post('/api/employee-position/edit-position', {
            data
          })
          .then(function (response) {
            dispatch(fetchData({ employeeId: employee._id })).then(() => {
              toast.success('Position (' + selectedPosition.positionTitle + ') Updated Successfully.', {
                delay: 3000,
                position: 'bottom-right'
              })
              setForm(false)
              setLoading(false)
            })
          })
          .catch(function (error) {
            toast.error('Error : ' + error.response.data.message + ' !', {
              delay: 3000,
              position: 'bottom-right'
            })
            setLoading(false)
          })
        setFileLoading(false)
      })
      .catch(function (error) {
        toast.error('Error : ' + error.response + ' !', {
          delay: 3000,
          position: 'bottom-right'
        })
      })
  }

  const uploadNewFile = async event => {
    setFileLoading(true)
    const file = event.target.files[0]
    let formData = new FormData()
    formData.append('file', file)
    formData.append('id', selectedPosition?._id)
    formData.append('type', 'employeePosition')
    let data = {}
    data.id = selectedPosition._id
    data.formData = formData
    axios
      .post('https://umanu.blink-techno.com/public/api/upload', formData)
      .then(response => {
        setTempFile(response.data)
        setFileLoading(false)
      })
      .catch(function (error) {
        toast.error('Error : ' + error.response + ' !', {
          delay: 3000,
          position: 'bottom-right'
        })
        setFileLoading(false)
      })
  }


  const openNewUploadFile = row => {
    newinputFile.current.click()
  }

  const open_file = fileName => {
    window.open('https://umanu.blink-techno.com/' + fileName, '_blank')
  }

  // ------------------------------- handle Edit --------------------------------------

  const handleEdit = e => {
    setFormValue({})
    setSelectedPosition(e)
    console.log(e)
    setFormValue(e)
    setDepartment(e.department_id)
    setEndChangeType(e.endChangeType)
    setStartChangeType(e.startChangeType)
    setStartChangeDate(e.startChangeDate)
    if (e.endChangeDate) {
      setEndChangeDate(e.endChangeDate)
    }
    setAction('edit')
    setForm(true)
  }

  const openUploadFile = row => {
    inputFile.current.click()
  }

  const handleDeleteFile = e => {
    setOpenFileDialog(true)
  }

  const deleteFile = () => {

    setLoading(true)

    let data = { ...formValue }
    delete data.file
    data._id = selectedPosition._id
    data.updated_at = new Date()
    axios
      .post('/api/employee-position/delete-positionFile', {
        data
      })
      .then(function (response) {
        dispatch(fetchData({ employeeId: employee._id })).then(() => {
          toast.success('Position (' + data.positionTitle + ') deleted file successfully.', {
            delay: 3000,
            position: 'bottom-right'
          })
          setForm(false)
          setOpenFileDialog(false)
          setLoading(false)
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

  const columns = [
    {
      flex: 0.25,
      minWidth: 220,
      resizable: true,
      field: 'title',
      headerName: 'Title',
      renderCell: ({ row }) => <Typography variant='body2'>{row.department_info[0].name} / {row.positionTitle}</Typography>
    },
    {
      flex: 0.15,
      minWidth: 100,
      field: 'startAt',
      headerName: 'Start at',
      renderCell: ({ row }) => <Typography variant='body2'>{row.startChangeDate}</Typography>
    },
    {
      flex: 0.15,
      minWidth: 100,
      field: 'endAt',
      headerName: 'End at',
      renderCell: ({ row }) => <Typography variant='body2'>{row.endChangeDate}</Typography>
    },
    {
      flex: 0.15,
      minWidth: 120,
      field: 'action',
      headerName: '',
      renderCell: ({ row }) => (
        <>
          <span>
            <IconButton
              size='small'
              onClick={e => {
                handleEdit(row)
              }}
            >
              <Icon icon='mdi:pencil-outline' fontSize={18} />
            </IconButton>
            <IconButton
              size='small'
              onClick={e => {
                handleDelete(row)
              }}
            >
              <Icon icon='mdi:delete-outline' fontSize={18} />
            </IconButton>
            {row.file && (
              <IconButton size='small' onClick={() => open_file(row.file)}>
                <Icon icon='ic:outline-remove-red-eye' fontSize={18} />
              </IconButton>
            )}
          </span>
        </>
      )
    }
  ]

  if (!employee) {
    return <Typography sx={{ mt: 2, mb: 3, px: 2, fontWeight: 400, fontSize: 15, color: 'red', textAlign: 'center', fontStyle: 'italic' }}>You must insert employee ..</Typography>
  }
  if (loading) {
    // return <Loading header='Please Wait' description='Positions are loading' />
  }

  return (
    <Grid spacing={6}>

      <Grid item xs={12} lg={12}>
        <Grid container spacing={1}>
          {/* --------------------------- Emirates  View ------------------------------------ */}

          <Grid xs={12} md={7} lg={7} sx={{ px: 3, mt: 2 }}>

            <Typography sx={{ mt: 2, mb: 3, px: 2, fontWeight: 600, fontSize: 20, color: 'blue' }}>Positions</Typography>
            <Box
              sx={{
                mb: 2.5,
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'flex-end'
              }}>
              {
                terminationStatus == 'notTerminated' && 
                <Button variant='outlined' style={{color:'red'}} size='small' onClick={handleTermination} sx={{ px: 1, mt: 1, mb: 1 }}>
                  Terminate Employee
                </Button>
              }
              {
                terminationStatus == 'terminated' && 
                <Button variant='outlined' style={{color:'red'}} size='small' onClick={()=>terminateEmployee('re-employ')} sx={{ px: 1, mt: 1, mb: 1 }}>
                  Re-employ Employee
                </Button>
              }
              {
                terminationStatus == 'notTerminated' &&  (
                <Button variant='outlined'  size='small' onClick={handleAdd} sx={{ px: 2, mt: 2, mb: 2 }}>
                  Add Employee Position
                </Button>)
              }
            </Box>
{
            loading ? 
              <Loading header='Please Wait' description='Positions are loading' />:            
            <DataGrid
              autoHeight
              rows={store.data}
              columns={columns}
              pageSize={pageSize}
              disableSelectionOnClick
              rowsPerPageOptions={[7, 10, 25, 50]}
              onPageSizeChange={newPageSize => setPageSize(newPageSize)}
            />
}
          </Grid>

          {/* --------------------------- Passport  ------------------------------------ */}
          {
            action == 'terminate' && (
              <Grid xs={12} md={5} lg={5} sx={{px: 1 , mt:2}}>
                 <Card xs={12} md={12} lg={12} sx={{ px: 1, pb: 8 }}>
 
                  <Typography variant='h6' sx={{ px: 2, pt: 2 }}>
                    Terminate Employee
                  </Typography>
               
                 
       
                <Form
                  fluid
                  ref={formRef}
                  onChange={setFormValue}
                  onCheck={setFormError}
                  formValue={formValue}
                  model={validateMmodel}
                >
                  <Grid container sx={{ mt: 3, px: 5 }}>     
                    <Grid container spacing={3}>
                      <Grid item sm={12} xs={12} mt={2}>
                        <small>Termination Reason</small>
                        <SelectPicker
                          size='sm'
                          name='Terminatoin Reason'
                          onChange={e => {
                            // console.log(e)
                            setTerminationReason(e)
                          }}

                          value={terminationReason}
                          data={TerminationReasonsTyps}
                          block
                        />
                      </Grid>
                    
                        <Grid item sm={12} xs={12} mt={2}>
                          <small>Date of Termination</small>
                          <Form.Control
                            size='sm'
                            oneTap
                            accepter={DatePicker}
                            name='terminationDate'
                            onChange={e => {
                              setTerminationDate(e)
                            }}

                            value={new Date(terminationDate)}
                            block
                          />
                        </Grid>
                        <Grid>
                          <Typography>
                            <small style={{color:'red' , paddingLeft:'1rem'}}>
                              by terminating employee all of his positions will be ended
                            </small>
                          </Typography>
                        </Grid>
                    </Grid>
 
                    <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 40, mt: 3 }}>
                      {!loading && (
                        <>
                          <Button color='success' onClick={()=>terminateEmployee('terminate')} variant='contained' sx={{ mr: 3 }}>
                              Save
                          </Button>
                         
                          <Button
                            type='button'
                            color='warning'
                            variant='contained'
                            sx={{ mr: 3 }}
                            onClick={() => setAction('')}
                          >
                            Close
                          </Button>
                        </>
                      )}
                      {loading && <LinearProgress />}
                    </Box>
                  </Grid>
                </Form>
              </Card>
              </Grid>
            )
          }
          <Grid xs={12} md={5} lg={5} sx={{ px: 1, mt: 2 }}>
            {form && (
              <Card xs={12} md={12} lg={12} sx={{ px: 1, pb: 8 }}>
                {action == 'add' && (
                  <Typography variant='h6' sx={{ px: 2, pt: 2 }}>
                    Add New Position
                  </Typography>
                )}
                {action == 'edit' && (
                  <Typography variant='h6' sx={{ px: 2, pt: 2 }}>
                    Edit Position
                  </Typography>
                )}
       
                <Form
                  fluid
                  ref={formRef}
                  onChange={setFormValue}
                  onCheck={setFormError}
                  formValue={formValue}
                  model={validateMmodel}
                >
                  <Grid container sx={{ mt: 3, px: 5 }}>

                    {departmentsDataSource && (
                      <Grid item sm={12} xs={12} mt={2}>
                        <small>Department</small>
                        <SelectPicker
                          size='sm'
                          name='department'
                          controlId='department'
                          onChange={e => {
                            setDepartment(e)
                          }}
                          value={department}
                          data={departmentsDataSource}
                          block
                        />
                      </Grid>
                    )}
                    <Grid item sm={6} md={6} sx={{ mt: 2 }}>
                      <small>Position Title</small>
                      <SelectPicker
                        controlId='positionTitle'
                        size='sm'
                        name='positionTitle'
                        placeholder='position Title'
                        data={positions}
                        value={positionTitle}
                        onChange={e=>{
                          setPositionTitle(e)
                        }}
                        block
                      />

                    </Grid>
                    <Grid item sm={6} md={6} sx={{ mt: 8 }}>
                      <small style={{ paddingLeft: '0.3rem' }}> Manager </small>
                      <Form.Control
                        controlId='manager'
                        name='manager'
                        type='checkbox'
                        checked={isManager}
                        onChange={(e) => { SetIsManager(!isManager); console.log(isManager) }}
                        placeholder='manager'
                      />


                    </Grid>

                    <Grid container spacing={3}>
                      <Grid item sm={6} xs={12} mt={2}>
                        <small>Start Reason</small>
                        <SelectPicker
                          size='sm'
                          name='startChangeType'
                          onChange={e => {
                            setStartChangeType(e)
                          }}
                          value={startChangeType}
                          data={positionChangeStartTypes}
                          block
                        />
                      </Grid>
                      <Grid item sm={6} xs={12} mt={2}>
                        <small>Date of Start</small>
                        <Form.Control
                          size='sm'
                          oneTap
                          accepter={DatePicker}
                          name='startChangeDate'
                          onChange={e => {
                            setStartChangeDate(e.toISOString().substring(0, 10))
                          }}
                          value={new Date(startChangeDate)}
                          block
                        />
                      </Grid>
                    </Grid>

                    <Grid container spacing={3}>
                      <Grid item sm={6} xs={12} mt={2}>
                        <small>End Reason</small>
                        <SelectPicker
                          size='sm'
                          name='endChangeType'
                          onChange={e => {
                            console.log(e)
                            setEndChangeType(e)
                          }}
                          value={endChangeType}
                          data={positionChangeEndTypes}
                          block
                        />
                      </Grid>
                      {endChangeType != 'onPosition' && (
                        <Grid item sm={6} xs={12} mt={2}>
                          <small>Date of End</small>
                          <Form.Control
                            size='sm'
                            oneTap
                            accepter={DatePicker}
                            name='endChangeDate'
                            onChange={e => {
                              setEndChangeDate(e.toISOString().substring(0, 10))
                            }}
                            value={new Date(endChangeDate)}
                            block
                          />
                        </Grid>
                      )}


                    </Grid>

                    <Grid item sm={12} xs={12} mt={4} mb={10}>
                      <Typography sx={{ pt: 6 }}>
                        File :
                        {tempFile && action == "add" && !fileLoading && (<span style={{ paddingRight: '10px', paddingLeft: '5px' }}><a href='#' onClick={() => open_file(tempFile)} >{tempFile}</a></span>)}
                        {tempFile && action == "add" && !fileLoading && (<Chip label='Delete' variant='outlined' size="small" color='error' onClick={() => setTempFile(null)} icon={<Icon icon='mdi:delete-outline' />} />)}
                        {selectedPosition?.file && !fileLoading && (<span style={{ paddingRight: '10px', paddingLeft: '5px' }}><a href='#' onClick={() => open_file(selectedPosition?.file)} >{selectedPosition?.file}</a></span>)}
                        {selectedPosition?.file && !fileLoading && (<Chip label='Delete' variant='outlined' size="small" color='error' onClick={() => handleDeleteFile()} icon={<Icon icon='mdi:delete-outline' />} />)}
                        {selectedPosition && !fileLoading && action != "add" && <Chip label='Upload' variant='outlined' size="small" color='primary' sx={{ mx: 2 }} onClick={() => openUploadFile()} icon={<Icon icon='mdi:upload-outline' />} />}
                        {!fileLoading && action == "add" && <Chip label='Upload' variant='outlined' size="small" color='primary' sx={{ mx: 2 }} onClick={() => openNewUploadFile()} icon={<Icon icon='mdi:upload-outline' />} />}
                        {fileLoading && <small style={{ paddingLeft: '20px', fontStyle: 'italic', color: 'blue' }}>Uploading ...</small>}
                      </Typography>
                    </Grid>

                    <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 40, mt: 3 }}>
                      {!loading && (
                        <>
                          {action == 'add' && (
                            <Button color='success' onClick={handleSubmit} variant='contained' sx={{ mr: 3 }}>
                              Save
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
                      {loading && <LinearProgress />}
                    </Box>
                  </Grid>
                </Form>
              </Card>
            )}
          </Grid>

          <input
            id='file'
            ref={inputFile}
            hidden
            type='file'
            onChange={e => {
              uploadFile(e)
            }}
            name='file'
          />

          <input
            id='newfile'
            ref={newinputFile}
            hidden
            type='file'
            onChange={e => {
              uploadNewFile(e)
            }}
            name='file'
          />

          {/* -------------------------- Clinician  ------------------------------------- */}
          <Dialog
            open={open}
            disableEscapeKeyDown
            aria-labelledby='alert-dialog-title'
            aria-describedby='alert-dialog-description'
            onClose={(event, reason) => {
              if (reason !== 'backdropClick') {
                // handleClose()
              }
            }}
          >
            <DialogTitle id='alert-dialog-title text'>Warning</DialogTitle>
            <DialogContent>
              <DialogContentText id='alert-dialog-description'>
                Are you sure , you want to delete employee position{' '}
                <span className='bold'>{selectedPosition && selectedPosition.positionTitle}</span>
              </DialogContentText>
            </DialogContent>
            <DialogActions className='dialog-actions-dense'>
              <Button onClick={deletePosition}>Yes</Button>
              <Button onClick={() => setOpen(false)}>No</Button>
            </DialogActions>
          </Dialog>

          <Dialog
            open={openFileDialog}
            disableEscapeKeyDown
            aria-labelledby='alert-dialog-title'
            aria-describedby='alert-dialog-description'
            onClose={(event, reason) => {
              if (reason !== 'backdropClick') {
                // handleClose()
              }
            }}
          >
            <DialogTitle id='alert-dialog-title text'>Warning</DialogTitle>
            <DialogContent>
              <DialogContentText id='alert-dialog-description'>
                Are you sure , you want to delete file{' '}
                <span className='bold'>{selectedPosition?.file && selectedPosition?.file}</span>
              </DialogContentText>
            </DialogContent>
            <DialogActions className='dialog-actions-dense'>
              <Button onClick={deleteFile}>Yes</Button>
              <Button onClick={() => setOpenFileDialog(false)}>No</Button>
            </DialogActions>
          </Dialog>

        </Grid>
      </Grid>
    </Grid>
  )
}

export default Steppositions
