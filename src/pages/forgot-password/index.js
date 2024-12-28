// ** React Imports
import { useState } from 'react'

// ** MUI Components
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import InputLabel from '@mui/material/InputLabel'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import useMediaQuery from '@mui/material/useMediaQuery'
import OutlinedInput from '@mui/material/OutlinedInput'
import { styled, useTheme } from '@mui/material/styles'
import FormHelperText from '@mui/material/FormHelperText'
import InputAdornment from '@mui/material/InputAdornment'
import Typography from '@mui/material/Typography'
import LinearProgress from '@mui/material/LinearProgress'

import { getProviders, signIn, useSession } from "next-auth/react";

import { getCsrfToken } from "next-auth/react";


// ** Next Imports
import Link from 'next/link'


// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import * as yup from 'yup'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

// ** Hooks
import { useSettings } from 'src/@core/hooks/useSettings'

// ** Configs
import themeConfig from 'src/configs/themeConfig'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

import { signOut } from 'next-auth/react'
import { FormControlLabel } from '@mui/material'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

// ** Styled Components


const LoginIllustration = styled('img')(({ theme }) => ({
  maxWidth: '48rem',
  [theme.breakpoints.down('xl')]: {
    maxWidth: '38rem'
  },
  [theme.breakpoints.down('lg')]: {
    maxWidth: '30rem'
  }
}))

const RightWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  [theme.breakpoints.up('md')]: {
    maxWidth: 400
  },
  [theme.breakpoints.up('lg')]: {
    maxWidth: 450
  }
}))

const BoxWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  [theme.breakpoints.down('md')]: {
    maxWidth: 400
  }
}))

const LinkStyled = styled(Link)(({ theme }) => ({
  display: 'flex',
  '& svg': { mr: 1.5 },
  alignItems: 'center',
  textDecoration: 'none',
  justifyContent: 'center',
  color: theme.palette.primary.main
}))

const TypographyStyled = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  letterSpacing: '0.18px',
  marginBottom: theme.spacing(1.5),
  [theme.breakpoints.down('md')]: { marginTop: theme.spacing(8) }
}))



const schema = yup.object().shape({
  email: yup.string().email().required()
})

const defaultValues = {
  password: '',
  email: ''
}

const ForgetPassword = ({ csrfToken, providers, query }) => {

  const [badToken, setBadtoken] = useState();
  const [checkingToken, setCheckingToken] = useState(false);
  const [loading , setLoading ]= useState(false)
  const [user, setUser] = useState();
  const [errorReset, setErrorReset] = useState();
  const [mailsent, setmailsent] = useState(query.token ? true : false);
  const [showPassword, setShowPassword] = useState(false)
  const [newPassword , setNewPassword]= useState()
  const [passwordConf , setPasswordConf]= useState()

  // ** Hooks

  const theme = useTheme()
  const { settings } = useSettings()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))

  // ** Vars
  const { skin } = settings

  const {
    control,
    setError,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues,
    mode: 'onBlur',
    resolver: yupResolver(schema)
  })

  const router = useRouter()
  
  useEffect(() => {
    if (router.query.email && router.query.token) {
      setCheckingToken(true);
      fetch("/api/reset-password/check-token/", {
        body: JSON.stringify({ email: query.email, token: query.token }),
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setCheckingToken(false);
          if (data.success) {
            setUser(data.user);
            setBadtoken(false);
          } else {
            setBadtoken(true);
            setError(data.message);
          }
        }).catch(err=>{});
    }
       // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const setPassword = (e) => {

    if (passwordConf === newPassword && (passwordConf && passwordConf.length > 5 && newPassword && newPassword.length > 5)) {
      setLoading(true);
      setErrorReset()
      fetch("/api/reset-password/set-password/", {
        method: "POST",
        body: JSON.stringify({ password: newPassword, user: user }),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }).then(res=>res.json()).then(data=>{
        if(data.success)
        {
            signIn("credentials",{email:user.email,password:newPassword}).then(()=>{
                window.location.href='/';
            });
        }
        else
        {
            setError(data.message);
        }
      }).catch(err=>{});
    } else {
      setErrorReset("Passwords don't matched! or Passwords length 5 character at least");
    }
  };

  //----------------- Request mail ------------------------------


  const onSubmit = (data) => {
    setLoading(true);
    const { email } = data
    fetch("/api/reset-password/request/", {
      method: "POST",
      body: JSON.stringify({ email: email }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        
        if (data.success) {
          setmailsent(true);
        }
      }).catch(err=>{});
  };

  // -----------------------------------------------------

  const imageSource = skin === 'bordered' ? 'auth-v2-login-illustration-bordered' : 'auth-v2-login-illustration'

  return (
    <Box className='content-right'>
      {!hidden ? (

        <Box sx={{ flex: 1, display: 'flex', position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
            <LoginIllustration
              alt='login-illustration'
              width={300}
              src={`/images/pages/${imageSource}-${theme.palette.mode}.png`}
            />
        </Box>
      ) : null}
      <RightWrapper  sx={skin === 'bordered' && !hidden ? { borderLeft: `1px solid ${theme.palette.divider}` } : {}}>
        <Box
          sx={{
            p: 7,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'background.paper'
          }}
        >
          <BoxWrapper>
            <Box
              sx={{
                top: 30,
                left: 40,
                display: 'flex',
                position: 'absolute',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {/* --------------------------------- Logo --------------------------------------------- */}
              
              <Box sx={{ px: 1}}>
                <img alt='umano' src='/images/apple-touch-icon.png' width='32px' />
              </Box>
              <Typography variant='h6' sx={{ ml: 2, lineHeight: 1, fontWeight: 700, fontSize: '1.5rem !important' }}>
                {themeConfig.templateName}
              </Typography>
            </Box>
            {/* ----------------------------------------------------------------------------------------------------- */}

            {checkingToken && (
              <div className="contianer">
              <Box sx={{ mb: 6 }}>
                  <TypographyStyled
                    variant='h5'
                    sx={{ mb: 5 }}
                  >Checking...</TypographyStyled>
                </Box>
              </div>)}
            
            {query.email && query.token && badToken == false && (
            <>
            <Box sx={{ mb: 6 }}>
              <TypographyStyled
                variant='h5'
                sx={{ mb: 5 }}
              >{`Reset Password`}</TypographyStyled>
              <Typography variant='body2'>Please insert new password</Typography>
            </Box>
   

              <FormControl fullWidth>
                <InputLabel htmlFor='auth-login-v2-password' error={Boolean(errors.password)}>
                New Password
                </InputLabel>
                <Controller
                  name='newPassword'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange, onBlur } }) => (
                    <OutlinedInput
                      value={value}
                      onBlur={onBlur}
                      label='New Password'
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                      }}
                      id='auth-login-v2-password'
                      error={Boolean(errorReset)}
                      type={showPassword ? 'text' : 'password'}
                      endAdornment={
                        <InputAdornment position='end'>
                          <IconButton
                            edge='end'
                            onMouseDown={e => e.preventDefault()}
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            <Icon icon={showPassword ? 'mdi:eye-outline' : 'mdi:eye-off-outline'} fontSize={20} />
                          </IconButton>
                        </InputAdornment>
                      }
                    />
                  )}
                />
              </FormControl>


              <FormControl fullWidth sx={{mt:3}}>
                <InputLabel htmlFor='auth-login-v2-password' error={Boolean(errors.passwordConf)}>
                Confirm new password
                </InputLabel>
                <Controller
                  name='passwordConf'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange, onBlur } }) => (
                    <OutlinedInput
                      value={value}
                      onBlur={onBlur}
                      label='Confirm new password'
                      onChange={(e) => {
                        setPasswordConf(e.target.value);
                      }}
                      id='auth-login-v2-password'
                      error={Boolean(errorReset)}
                      type={showPassword ? 'text' : 'password'}
                      endAdornment={
                        <InputAdornment position='end'>
                          <IconButton
                            edge='end'
                            onMouseDown={e => e.preventDefault()}
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            <Icon icon={showPassword ? 'mdi:eye-outline' : 'mdi:eye-off-outline'} fontSize={20} />
                          </IconButton>
                        </InputAdornment>
                      }
                    />
                  )}
                />
              </FormControl>

              {errorReset && (
                  <FormHelperText sx={{ color: 'error.main' }} id=''>
                    {errorReset}
                  </FormHelperText>
                )}


              {!loading && <Button onClick = {()=>{setPassword()}} fullWidth size='large' type='submit' variant='contained' sx={{ mt: 10, mb: 7 }}>
                Save Password & Sign in
              </Button>}
              {loading && <LinearProgress sx={{ mt: 10, mb: 7 }} />}
         
            </>
            )}
      

            {mailsent && !query.token && (
              <div className="container">
                <Box sx={{ mb: 6 }}>
                  <TypographyStyled
                    variant='h5'
                    sx={{ mb: 5 }}
                  >Reset Link sent</TypographyStyled>
                  <Typography variant='body2'>Please check your email and use the link as soon as possible!</Typography>
                </Box>
                    <Typography sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <LinkStyled href='/login'>
                      <Icon icon='mdi:chevron-left' fontSize='2rem' />
                      <span>Back to login</span>
                    </LinkStyled>
                  </Typography>
              </div>
            )}

            {(!mailsent || badToken) && (
              <>
                <Box sx={{ mb: 6 }}>
                  <TypographyStyled
                    variant='h5'
                    sx={{ mb: 5 }}
                  >Reset Password?</TypographyStyled>
                  <Typography variant='body2'>Enter your email and we&prime;ll send you instructions to reset your password</Typography>
                </Box>
                <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)}>
                  <FormControl fullWidth sx={{ mb: 4 }}>
                    <Controller
                      name='email'
                      control={control}
                      rules={{ required: true }}
                      render={({ field: { value, onChange, onBlur } }) => (
                        <TextField
                          autoFocus
                          label='Email'
                          value={value}
                          onBlur={onBlur}
                          onChange={onChange}
                          error={Boolean(errors.email)}
                          placeholder='admin@admin.com'
                        />
                      )}
                    />
                    {errors.email && <FormHelperText sx={{ color: 'error.main' }}>{errors.email.message}</FormHelperText>}
                  </FormControl>

                  {!loading && <Button fullWidth size='large' type='submit' variant='contained' sx={{ mt: 4, mb: 7 }}>
                  Send reset link
                  </Button>}
                  {loading && <LinearProgress sx={{ mt: 10, mb: 7 }} />}

                  <Typography sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <LinkStyled href='/login'>
                      <Icon icon='mdi:chevron-left' fontSize='2rem' />
                      <span>Back to login</span>
                    </LinkStyled>
                  </Typography>

                </form>
              </>
            )}


          </BoxWrapper>
        </Box>
      </RightWrapper>
    </Box>
  )
}

ForgetPassword.getLayout = page => <BlankLayout>{page}</BlankLayout>
ForgetPassword.guestGuard = true

export default ForgetPassword


export async function getServerSideProps(context) {
  const providers = await getProviders() || null ;
  console.log(context , providers) ; 

  return {
    props: {
      query: context.query || null,
      csrfToken: await getCsrfToken(context) || null,
      providers,
    },
  };
}
