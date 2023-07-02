// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import Step from '@mui/material/Step'
import Divider from '@mui/material/Divider'
import { styled } from '@mui/material/styles'
import StepLabel from '@mui/material/StepLabel'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import MuiStepper from '@mui/material/Stepper'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Step Components
import StepCart from 'src/views/pages/wizard-examples/checkout/StepCart'

import StepAddress from 'src/views/pages/wizard-examples/checkout/StepPayment'

import StepPayment from 'src/views/pages/wizard-examples/checkout/StepPayment'

import StepConfirmation from 'src/views/pages/wizard-examples/checkout/StepConfirmation'

// ** Styled Components
import StepperWrapper from 'src/@core/styles/mui/stepper'

const steps = [
  {
    title: 'Information',
    icon: (
      <Icon icon='mdi:card-account-details-outline' width='40' height='40'  color="primary"/>
    )
  },
  {
    title: 'Documents',
    icon: (
      <Icon icon='mdi:file-document-multiple-outline' width='40' height='40'  color="primary"/>
    )
  },
  {
    title: 'Attendance',
    icon: (
        <Icon icon='material-symbols:calendar-month-outline-rounded' width='40' height='40'  color="primary"/>
    )
  },
  {
    title: 'Payroll',
    icon: (
        <Icon icon='ph:money' width='40' height='40'  color="primary"/>
    )
  },
]

const Stepper = styled(MuiStepper)(({ theme }) => ({
  margin: 'auto',
  maxWidth: 800,
  justifyContent: 'space-around',
  '& .MuiStep-root': {
    cursor: 'pointer',
    textAlign: 'center',
    paddingBottom: theme.spacing(8),
    '& .step-title': {
      fontSize: '1rem'
    },
    '&.Mui-completed + svg': {
      color: theme.palette.primary.main
    },
    '& + svg': {
      display: 'none',
      color: theme.palette.text.disabled
    },
    '& .MuiStepLabel-label': {
      display: 'flex',
      cursor: 'pointer',
      alignItems: 'center',
      svg: {
        marginRight: theme.spacing(1.5),
        fill: theme.palette.text.primary
      },
      '&.Mui-active, &.Mui-completed': {
        '& .MuiTypography-root': {
          color: theme.palette.primary.main
        },
        '& svg': {
          fill: theme.palette.primary.main
        }
      }
    },
    [theme.breakpoints.up('md')]: {
      paddingBottom: 0,
      '& + svg': {
        display: 'block'
      },
      '& .MuiStepLabel-label': {
        display: 'block'
      }
    }
  }
}))

const CheckoutWizard = () => {
  // ** States
  const [activeStep, setActiveStep] = useState(0)

  // Handle Stepper
  const handleNext = () => {
    setActiveStep(activeStep + 1)
  }

  const getStepContent = step => {
    switch (step) {
      case 0:
        return <StepCart handleNext={handleNext} />
      case 1:
        return <StepAddress handleNext={handleNext} />
      case 2:
        return <StepPayment handleNext={handleNext} />
      case 3:
        return <StepConfirmation />
      default:
        return null
    }
  }

  const renderContent = () => {
    return getStepContent(activeStep)
  }

  return (
    <Card>
      <CardContent sx={{ py: 5.375 }}>
        <StepperWrapper>
          <Stepper activeStep={activeStep} connector={<Icon icon='mdi:chevron-right' />}>
            {steps.map((step, index) => {
              return (
                <Step key={index} onClick={() => setActiveStep(index)} sx={{}}>
                  <StepLabel icon={<></>}>
                    {step.icon}
                    <Typography className='step-title'>{step.title}</Typography>
                  </StepLabel>
                </Step>
              )
            })}
          </Stepper>
        </StepperWrapper>
      </CardContent>

      <Divider sx={{ m: '0 !important' }} />

      <CardContent>{renderContent()}</CardContent>
    </Card>
  )
}

export default CheckoutWizard
