// ** React Imports
import { useState, useRef, useEffect, useCallback } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'

import { Divider, Tab, Typography } from '@mui/material'

import toast from 'react-hot-toast'
import TabList from '@mui/lab/TabList'

// ** Rsuite Imports
import { Form, Schema, SelectPicker } from 'rsuite'
import 'rsuite/dist/rsuite.min.css'

// ** Axios Imports
import axios from 'axios'

import { CompensationsType } from 'src/local-db'

// ** Store Imports
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import Loading from 'src/views/loading'
import NoPermission from 'src/views/noPermission'

const { StringType, NumberType, DateType, ArrayType  , MixedType } = Schema.Types

import { TabContext, TabPanel } from '@mui/lab'

const AddDepartment = ({ popperPlacement, id }) => {
  // ** States
  const [loadingDescription, setLoadingDescription] = useState('')
  const [action, setAction] = useState('add')
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState([])
  const router = useRouter()
  const { data: session, status } = useSession
  const formRef = useRef()
  const [formError, setFormError] = useState()

  // --------------forms values--------------------------------

  const default_value = {
    type: 'Monthly',
    fixedValue: 0,
    percentageValue: 0
  }
  const [formValue, setFormValue] = useState(default_value)


  // ------------------------ Get Employee -----------------------------------

  const getCompensation = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/compensation/' + id)
      const { data } = await res.json()
      
      setFormValue(data[0])
      setLoading(false)

    }
    catch (err) {

    }
  };

  useEffect(() => {
    getCompensation()
  }, [])


  // ------------------------------ validate Mmodel ------------------------------------

  const validateMmodel = Schema.Model({
    title: StringType().isRequired('This field is required.'),
    type: StringType().isRequired('This field is required.'),
    fixedValue:  MixedType().isRequired('The field is required'),
    percentageValue: MixedType()

  })

  // ------------------------------- Submit --------------------------------------

  const handleSubmit = () => {
    formRef.current.checkAsync().then(result => {
      if (!result.hasError) {
        let data = { ...formValue , fixedValue: Number(String(formValue.fixedValue).replaceAll(',','')) ,percentageValue: Number(String(formValue.percentageValue).replaceAll(',',''))}
        if( isNaN(data.fixedValue) || isNaN(data.percentageValue)  ) {
          toast.error('fixed value / percentage value must be a number' , {duration:5000 , position:'bottom-right'});

          return ;
        } 
        setLoading(true)
        setLoadingDescription('Allowances are updating')
        axios
          .post('/api/compensation/edit-compensation', {
            data
          })
          .then(function (response) {
            router.push('/company-dashboard/payroll/compensation')
            toast.success('Form (' + data.title + ') updated Successfully.', {
              delay: 3000,
              position: 'bottom-right'
            })
            close()
            setLoading(false)
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
    router.push('/company-dashboard/payroll/compensation/')
  }

  const addToFiles = e => {
    let temp = files
    temp.push(e.blobFile)
    setFiles(temp)
  }

  // const Textarea = forwardRef((props, ref) => <Input as='textarea' />)

  // ------------------------------ View ---------------------------------

  if (loading) return <Loading header='Please Wait' description={loadingDescription}></Loading>

  if (session && session.user && !session.user.permissions.includes('EditPayrollAllowance'))
    return <NoPermission header='No Permission' description='No permission to edit payroll Allowance'></NoPermission>

  return (
    <>
      <Grid item xs={12} sm={6} lg={6}></Grid>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title='Edit Allowance' sx={{ pb: 0, pt: 2 }} />
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
                        name='type'
                        accepter={SelectPicker}
                        data={CompensationsType}
                        block
                      />
                    </Grid>
                    <Grid item sm={12} md={8}>
                      <small>Title</small>
                      <Form.Control controlId='title' size='sm' name='title' placeholder='Title' />
                    </Grid>
                    <Grid item size='sm' sm={12} md={12} sx={{ mt: 6, mb: 8 }}>
                      <Grid item sm={12} md={4}>
                      <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                          <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                            Fixed value :
                          </Typography>
                          <Form.Control
                            controlId='fixedValue'
                            size='sm'
                            name='fixedValue'
                            placeholder='Fixed value'
                            type='text'
                            onChange={(e) => {
                              e = String(e).replaceAll(',', '');
                              e = Number(e);
                              setFormValue({ ...formValue, fixedValue: Number(e).toLocaleString() })
                            }}
                          />
                        </Box>
                        {/* <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                          <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                            Percentage value (%) :
                          </Typography>
                          <Form.Control
                            controlId='percentageValue'
                            size='sm'
                            name='percentageValue'
                            placeholder='Percentage value'
                            type='text'
                            onChange={(e) => {
                              e = String(e).replaceAll(',', '');
                              e = Number(e);
                              setFormValue({ ...formValue, percentageValue: Number(e).toLocaleString() })
                            }}
                          />
                        </Box> */}
                      </Grid>
                    </Grid>
                    <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 40, mt: 5 }}>
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
                          <Button type='button' color='warning' variant='contained' sx={{ mr: 3 }} onClick={close}>
                            Close
                          </Button>
                        </>
                      )}
                    </Box>
                  </Grid>
                </Form>
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
