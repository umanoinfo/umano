// ** MUI Components
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'


// ** Demo Imports
import { LinearProgress } from '@mui/material'

// ** Styled Components
const BoxWrapper = styled(Box)(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    width: '90vw'
  }
}))

const Img = styled('img')(({ theme }) => ({
  marginTop: theme.spacing(15),
  marginBottom: theme.spacing(15),
  [theme.breakpoints.down('lg')]: {
    height: 450,
    marginTop: theme.spacing(10),
    marginBottom: theme.spacing(10)
  },
  [theme.breakpoints.down('md')]: {
    height: 400
  }
}))

const Loading = ({ header, description }) => {
  return (
    <Box className='content-center'>
      <Box sx={{ mt: 30, p: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <BoxWrapper>
          <Typography variant='h4' sx={{ mb: 2.5, fontSize: '1.5rem !important' }}>
            {header}
          </Typography>
          <Typography variant='h7'>{description}</Typography>
        </BoxWrapper>
        <Img height='75' alt='under-maintenance-illustration' src='/images/apple-touch-icon.png' />
      </Box>
      <LinearProgress sx={{ mt: 5 }} />
    </Box>
  )
}

export default Loading
