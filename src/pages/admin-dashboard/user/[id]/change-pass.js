// ** React Imports
import { useState, forwardRef, useEffect, useCallback } from 'react'

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
import { addUser } from 'src/store/apps/user'
import { Divider } from '@mui/material'
import { useRouter } from 'next/router'

const DialogAddUser = ({ id }) => {
  // ** States
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('active')
  const [email, setEmail] = useState('')
  const [user, setUser] = useState('')
  const [password, setPassword] = useState()

  const [defaultValues, setDefaultValues] = useState({
    email: '',
    password: '',
    name: ''
  })
  const router = useRouter()

  const getUser = () => {
    setLoading(true)
    axios
      .get('/api/user/' + id, {})
      .then(function (response) {
        setUser(response.data.data[0])
        setLoading(false)
      })
      .catch(function (error) {
        // setLoading(false)
      })
  } 

  useEffect(() => {
    getUser()
  }, [ ])



  const save = data => {
    if (!password || password.length < 6) {
      toast.error('Password at least 6 character!', {
        delay: 3000,
        position: 'bottom-right'
      })
      
      return
    }
    setLoading(true)
    let user = {}
    user.password = password
    user._id = id
    user.updated_at = new Date()
    axios
      .post('/api/user/change-pass', {
        user
      })
      .then(function (response) {
        toast.success('User password Updated Successfully.', {
          delay: 3000,
          position: 'bottom-right'
        })
        router.push('/admin-dashboard/user')
      })
      .catch(function (error) {
        toast.error('Error : ' + error.message + ' !', {
          delay: 3000,
          position: 'bottom-right'
        })
        setLoading(false)
      })
  }

  const close = () => {
    router.push('/admin-dashboard/user')
  }

  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title='Change User Password'
              sx={{ pb: 1, '& .MuiCardHeader-title': { letterSpacing: '.1px' } }}
            />
            {user && (
              <CardContent>
                {user.name} ({user.email})
              </CardContent>
            )}
            <Divider />
            <Grid item xs={12} sm={5} md={5} sx={{ p: 2, mb: 5 }}>
              <TextField
                type='password'
                size='small'
                name='password'
                label='New Password'
                onChange={e => setPassword(e.target.value)}
                placeholder='xxxxxx'
              />

              <Box sx={{ mb: 2, mt: 2, alignItems: 'center' }}>{loading && <LinearProgress />}</Box>

              <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 40 }}>
                {!loading && (
                  <>
                    <Button color='success' type='submit' variant='contained' onClick={() => save()} sx={{ mr: 3 }}>
                      Save
                    </Button>
                    <Button type='button' color='warning' variant='contained' sx={{ mr: 3 }} onClick={() => close()}>
                      Close
                    </Button>
                  </>
                )}
              </Box>
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
