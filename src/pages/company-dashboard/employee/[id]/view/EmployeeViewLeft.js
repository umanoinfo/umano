// ** React Imports
import { useEffect, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import Select from '@mui/material/Select'
import Switch from '@mui/material/Switch'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'

// ** Data
import { GetHealthInsuranceTypes, GetSourceOfHire, GetEmployeesType, GetMaritalStatus } from 'src/local-db'

// ** Custom Components
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials'

const roleColors = {
  admin: 'error',
  editor: 'info',
  author: 'warning',
  maintainer: 'success',
  subscriber: 'primary'
}

const statusColors = {
  active: 'success',
  pending: 'warning',
  inactive: 'secondary'
}

// ** Styled <sup> component
const Sup = styled('sup')(({ theme }) => ({
  top: '0.2rem',
  left: '-0.6rem',
  position: 'absolute',
  color: theme.palette.primary.main
}))

// ** Styled <sub> component
const Sub = styled('sub')({
  fontWeight: 300,
  fontSize: '1rem',
  alignSelf: 'flex-end'
})

const EmployeeViewLeft = ({ id, employee }) => {
  if (employee) {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ pt: 15, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
              {employee.logo && employee.logo.length ? (
                <CustomAvatar
                  src={employee.logo}
                  variant='rounded'
                  alt={employee.name}
                  sx={{ width: 120, height: 120, fontWeight: 600, mb: 4, fontSize: '3rem' }}
                />
              ) : (
                <CustomAvatar
                  skin='light'
                  variant='rounded'
                  color={employee.avatarColor}
                  sx={{ width: 120, height: 120, fontWeight: 600, mb: 4, fontSize: '3rem' }}
                >
                  {getInitials(employee.firstName + ' ' + employee.lastName)}
                </CustomAvatar>
              )}
              <Typography variant='h6' sx={{ mb: 2 }}>
                {employee.firstName + ' ' + employee.lastName}
              </Typography>
              {employee.gender && <Typography sx={{ mb: 2 }}>{employee.gender}</Typography>}

              <CustomChip
                skin='light'
                size='small'
                label={employee.dateOfBirth}
                color={roleColors[employee.dateOfBirth]}
                sx={{
                  height: 20,
                  fontWeight: 600,
                  borderRadius: '5px',
                  fontSize: '0.875rem',
                  textTransform: 'capitalize',
                  '& .MuiChip-label': { mt: -0.25 }
                }}
              />
            </CardContent>

            <CardContent>
              <Typography variant='h6'>Details</Typography>
              <Divider sx={{ mt: theme => `${theme.spacing(4)} !important` }} />
              <Box sx={{ pt: 2, pb: 1 }}>
                {employee.firstName && (
                  <Box sx={{ display: 'flex', mb: 2.7 }}>
                    <Typography variant='subtitle2' sx={{ mr: 2, color: 'text.primary' }}>
                      Employee name:
                    </Typography>
                    <Typography variant='body2'>{employee.firstName + ' ' + employee.lastName}</Typography>
                  </Box>
                )}
                {employee.email && (
                  <Box sx={{ display: 'flex', mb: 2.7 }}>
                    <Typography variant='subtitle2' sx={{ mr: 2, color: 'text.primary' }}>
                      Email:
                    </Typography>
                    <Typography variant='body2'>{employee.email}</Typography>
                  </Box>
                )}
                {employee.idNo && (
                  <Box sx={{ display: 'flex', mb: 2.7 }}>
                    <Typography variant='subtitle2' sx={{ mr: 2, color: 'text.primary' }}>
                      ID No.:
                    </Typography>
                    <Typography variant='body2'>{employee.idNo}</Typography>
                  </Box>
                )}
                {employee.country_info[0] && (
                  <Box sx={{ display: 'flex', mb: 2.7 }}>
                    <Typography variant='subtitle2' sx={{ mr: 2, color: 'text.primary' }}>
                      Nationality:
                    </Typography>
                    <Typography variant='body2'>{employee.country_info[0].name}</Typography>
                  </Box>
                )}
                {employee.healthType && (
                  <Box sx={{ display: 'flex', mb: 2.7 }}>
                    <Typography variant='subtitle2' sx={{ mr: 2, color: 'text.primary' }}>
                      Health insurance type:
                    </Typography>
                    <Typography variant='body2'>{GetHealthInsuranceTypes(employee.healthType)}</Typography>
                  </Box>
                )}
                {employee.sourceOfHire && (
                  <Box sx={{ display: 'flex', mb: 2.7 }}>
                    <Typography variant='subtitle2' sx={{ mr: 2, color: 'text.primary' }}>
                      Source of Hire:
                    </Typography>
                    <Typography variant='body2'>{GetSourceOfHire(employee.sourceOfHire)}</Typography>
                  </Box>
                )}
                {employee.employeeType && (
                  <Box sx={{ display: 'flex', mb: 2.7 }}>
                    <Typography variant='subtitle2' sx={{ mr: 2, color: 'text.primary' }}>
                      Employee Type:
                    </Typography>
                    <Typography variant='body2'>{GetEmployeesType(employee.employeeType)}</Typography>
                  </Box>
                )}
                {employee.maritalStatus && (
                  <Box sx={{ display: 'flex', mb: 2.7 }}>
                    <Typography variant='subtitle2' sx={{ mr: 2, color: 'text.primary' }}>
                      Marital status:
                    </Typography>
                    <Typography variant='body2'>{GetMaritalStatus(employee.maritalStatus)}</Typography>
                  </Box>
                )}
                {employee.otherEmail && (
                  <Box sx={{ display: 'flex', mb: 2.7 }}>
                    <Typography variant='subtitle2' sx={{ mr: 2, color: 'text.primary' }}>
                      Other email:
                    </Typography>
                    <Typography variant='body2'>{employee.otherEmail}</Typography>
                  </Box>
                )}
                {employee.mobilePhone && (
                  <Box sx={{ display: 'flex', mb: 2.7 }}>
                    <Typography variant='subtitle2' sx={{ mr: 2, color: 'text.primary' }}>
                      Mobile phone:
                    </Typography>
                    <Typography variant='body2'>{employee.mobilePhone}</Typography>
                  </Box>
                )}
                {employee.workPhone && employee.extension && (
                  <Box sx={{ display: 'flex', mb: 2.7 }}>
                    <Typography variant='subtitle2' sx={{ mr: 2, color: 'text.primary' }}>
                      Work phone:
                    </Typography>
                    <Typography variant='body2'>
                      {employee.workPhone} - {employee.extension}
                    </Typography>
                  </Box>
                )}

                {employee.emergencyContact && (
                  <Box sx={{ display: 'flex', mb: 2.7 }}>
                    <Typography variant='subtitle2' sx={{ mr: 2, color: 'text.primary' }}>
                      Emergency contact information:
                    </Typography>
                    <Typography variant='body2'>{employee.emergencyContact}</Typography>
                  </Box>
                )}
                {employee.address && (
                  <Box sx={{ display: 'flex', mb: 2.7 }}>
                    <Typography variant='subtitle2' sx={{ mr: 2, color: 'text.primary' }}>
                      Address:
                    </Typography>
                    <Typography variant='body2'>{employee.address}</Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    )
  } else {
    return null
  }
}

export default EmployeeViewLeft
