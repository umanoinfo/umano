// ** React Imports
import { useState, forwardRef, useEffect, useRef } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import LinearProgress from '@mui/material/LinearProgress'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Fade from '@mui/material/Fade'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import FormHelperText from '@mui/material/FormHelperText'
import Select from '@mui/material/Select'
import toast from 'react-hot-toast'
import Link from '@mui/material/Link'
import { styled } from '@mui/material/styles'

import { Input, InputGroup, Row, Col } from 'rsuite'
import { Form, Schema, Panel } from 'rsuite'
import { DatePicker } from 'rsuite'
import 'rsuite/dist/rsuite.min.css'

// ** Third Party Imports
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Controller } from 'react-hook-form'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Axios Imports
import axios from 'axios'

// ** Actions Imports
import { fetchData, deleteUser } from 'src/store/apps/user'

// ** Store Imports
import { useDispatch } from 'react-redux'
import { Avatar, Divider } from '@mui/material'
import { useRouter } from 'next/router'

// ** Data
import { companiesTypes } from 'src/local-db'

const DialogAddUser = ({ id }) => {
  // ** States

  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [company, setCompany] = useState([])
  const [end_at, setEnd_at] = useState(new Date().toISOString().substring(0, 10))
  const [start_at, setStart_at] = useState(new Date().toISOString().substring(0, 10))
  const [remarks, setRemarks] = useState()
  const [availableUsers, setAvailableUsers] = useState(1)
  const [formError, setFormError] = useState({})
  const [formValue, setFormValue] = useState({ availableUsers: 1 })

  const dispatch = useDispatch()
  const formRef = useRef()

  useEffect(() => {
    getCompany()
  }, [])

  // ---------------------- Get Company ------------------------------------

  const getCompany = () => {
    setLoading(true)
    axios
      .get('/api/company/' + id, {})
      .then(function (response) {
        setCompany(response.data.data[0])
        setLoading(false)
      })
      .catch(function (error) {
        setLoading(false)
      })
  }

  // ---------------------- Submit ------------------------------------

  const handleSubmit = () => {
    setLoading(true)
    let data = formValue
    data.company_id = id
    data.start_at = start_at
    data.end_at = end_at
    data.created_at = new Date()
    axios
      .post('/api/subscription/add-subscription', {
        data
      })
      .then(function (response) {
        dispatch(fetchData({})).then(() => {
          toast.success('Subscription Inserted Successfully.', {
            delay: 3000,
            position: 'bottom-right'
          })
          router.push('/admin-dashboard/company/' + id + '/view/subscriptions/')
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

  const close = () => {
    router.push('/admin-dashboard/company')
  }

  // ---------------------- View ------------------------------------

  return (
    <>
      <Grid item xs={12} sm={7} lg={7}></Grid>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title='Add Subscription' sx={{ pb: 1, '& .MuiCardHeader-title': { letterSpacing: '.1px' } }} />
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 5 }}>
                <Avatar alt='Avatar' src={company.logo} sx={{ width: 50, height: 50, mr: 2 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {company.name}
                  </Typography>
                  <Typography variant='body2'>{company.type}</Typography>
                </Box>
              </Box>
            </CardContent>
            <Divider />
            <Grid container>
              <Grid item xs={12} sm={7} md={7} sx={{ p: 2, mb: 5 }}>
                <Form fluid ref={formRef} onChange={setFormValue} onCheck={setFormError} formValue={formValue}>
                  <Grid container spacing={2} mt={1}>
                    {start_at && (
                      <Grid item sm={4} xs={12}>
                        <small>Subscription start</small>
                        <Form.Control
                          size='lg'
                          oneTap
                          accepter={DatePicker}
                          name='start_at'
                          onChange={e => {
                            setStart_at(e.toISOString().substring(0, 10))
                          }}
                          value={new Date(start_at)}
                          block
                        />
                      </Grid>
                    )}

                    {end_at && (
                      <Grid item sm={4} xs={12}>
                        <small>Subscription End</small>
                        <Form.Control
                          size='lg'
                          oneTap
                          name='end_at'
                          accepter={DatePicker}
                          onChange={e => {
                            setEnd_at(e.toISOString().substring(0, 10))
                          }}
                          value={new Date(end_at)}
                          block
                        />
                      </Grid>
                    )}
                    <Grid item sm={4} xs={12}>
                      <Form.Group controlId='input-group'>
                        <small>Available users</small>
                        <InputGroup size='lg'>
                          <Form.Control
                            name='availableUsers'
                            min='1'
                            max='100'
                            type='number'
                            size='lg'
                          />
                        </InputGroup>
                      </Form.Group>
                    </Grid>
                  </Grid>
                  <Grid container spacing={3} mt={1}>
                    <Grid item sm={4} xs={4}>
                      <Form.Group>
                        <small>Cost</small>
                        <Form.Control name='cost' />
                      </Form.Group>
                    </Grid>
                  </Grid>
                  <Grid container spacing={3} mt={1}>
                    <Grid item sm={12} xs={12}>
                      <Form.Group>
                        <small>Remarks</small>
                        <Form.Control rows={2} name='remarks' />
                      </Form.Group>
                    </Grid>
                  </Grid>

                  <Box sx={{ mb: 2, alignItems: 'center' }}>{loading && <LinearProgress />}</Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 40 }}>
                    {!loading && (
                      <>
                        <Button color='success' onClick={handleSubmit} variant='contained' sx={{ mr: 3 }}>
                          Save
                        </Button>
                        <Button
                          type='button'
                          color='warning'
                          variant='contained'
                          sx={{ mr: 3 }}
                          onClick={() => close()}
                        >
                          Close
                        </Button>
                      </>
                    )}
                  </Box>
                </Form>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>
    </>
  )
}

DialogAddUser.getInitialProps = async ({ query: { id } }) => {
  return { id: id }
}

export default DialogAddUser
