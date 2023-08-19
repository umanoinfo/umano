// // ** MUI Imports
// import Box from '@mui/material/Box'
// import Card from '@mui/material/Card'
// import Button from '@mui/material/Button'
// import { styled } from '@mui/material/styles'
// import Typography from '@mui/material/Typography'
// import CardContent from '@mui/material/CardContent'
// import { useSession } from 'next-auth/react'

// // Styled component for the trophy image
// const TrophyImg = styled('img')(({ theme }) => ({
//   right: 22,
//   bottom: 0,
//   width: 106,
//   position: 'absolute',
//   [theme.breakpoints.down('sm')]: {
//     width: 95
//   }
// }))

// const CrmAward = () => {

//   const { data: session, status } = useSession()


//   return (
//     <Card sx={{ position: 'relative' }}>
//       <CardContent>
//         <Typography variant='h6'>
//           <Box component='span' sx={{ fontWeight: 'bold' }}>
//             {session.user.company_info[0].name}
//           </Box>
//         </Typography>
//         <Typography variant='body2' sx={{ mb: 3.25 }}>
//           Type
//         </Typography>
//         <Typography variant='h5' sx={{ fontWeight: 600, mt:10 , color: 'primary.main' }}>
//           10/15/2022 Satarday3
//         </Typography>
//         <Button size='small' variant='contained' sx={{  mt:5 }} >
//           View Sales
//         </Button>
//         <TrophyImg alt='trophy' src={session.user.company_info[0].logo} />
//       </CardContent>
//     </Card>
//   )
// }

// export default CrmAward


// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Rating from '@mui/material/Rating'
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Grid from '@mui/material/Grid'
import { useSession } from 'next-auth/react'

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
  marginTop:9 ,
  height: '9rem',
  borderRadius: theme.shape.borderRadius
}))

const CrmAward = () => {

  const { data: session, status } = useSession()
  
  const days = [
    'Sunday',
    'Monday' ,
    'Tuesday' ,
    'Wednesday',
    'Thursday' ,
    'Friday' ,
    'Saturday' 
     ]

  return (
    <Card>
      <Grid container spacing={6}>
        <StyledGrid1 item xs={12} md={9} lg={9}>
          <Box sx={{ p: theme => `${theme.spacing(6)} !important` }}>
          <Typography variant='h6' sx={{ fontWeight: 600,  color: 'primary.main' }}>
              {session.user && session.user.company_info[0] && session.user.company_info[0].name}
            </Typography>
            
         
         <Typography sx={{  mt:10  }}>
           {days[new Date().getUTCDay()]}
         </Typography>
         <Typography variant='h6' sx={{ mb: 2  }}>
           {new Date().toLocaleDateString()}
         </Typography>

          </Box>
        </StyledGrid1>
        <StyledGrid2 item xs={12} md={3} lg={3}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {session.user && session.user.company_info[0] && <Img alt='Stumptown Roasters' src={session.user.company_info[0].logo} />}
          </CardContent>
        </StyledGrid2>
      </Grid>
    </Card>
  )
}

export default CrmAward

