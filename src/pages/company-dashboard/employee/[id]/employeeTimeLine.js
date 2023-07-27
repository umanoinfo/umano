// ** MUI Import
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import { styled } from '@mui/material/styles'
import TimelineDot from '@mui/lab/TimelineDot'
import TimelineItem from '@mui/lab/TimelineItem'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
import MuiTimeline from '@mui/lab/Timeline'

// ** Icon Imports
import Icon from 'src/@core/components/icon'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { Card, Grid } from '@mui/material'
import EmployeeViewLeft from './view/EmployeeViewLeft'

// Styled Timeline component
const Timeline = styled(MuiTimeline)({
  paddingLeft: 0,
  paddingRight: 0,
  '& .MuiTimelineItem-root': {
    width: '100%',
    '&:before': {
      display: 'none'
    }
  }
})

// Styled component for the image of a shoe
const ImgShoe = styled('img')(({ theme }) => ({
  borderRadius: theme.shape.borderRadius
}))

const EmployeeTimeLine = ({ id }) => {
  const [isLoading, setIsLoading] = useState()
  const [employeeTimeline, setEmployeeTimeline] = useState()
  const [timeline, setTimeline] = useState()

  useEffect(() => {
    getTimeline()
  }, [])

  const getTimeline = () => {
    let data = { id: id }
    setIsLoading(true)
    axios.post('/api/company-employee/timeline/', { data }).then(response => {
      setEmployeeTimeline(response.data.data[0])
      setTimeline(response.data.timeline)
      setIsLoading(false)
      console.log(response.data.timeline)
    })
  }

  // if (employee) {
  //   employee.employeePositions_info.map((e, index) => {
  //     e.id = index + 1
  //   })
  // }

  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12} md={4} lg={4}>
          <EmployeeViewLeft employee={employeeTimeline} id={id} />
        </Grid>
        <Grid item xs={12} md={8} lg={8}>
          <Card sx={{ p: 5 }}>
            <Typography variant='h6' sx={{ mb: 2 }}>
              Employee Timeline
            </Typography>
            <Divider></Divider>
            {!isLoading && timeline && (
              <Timeline>
                {timeline.map((time, index) => {
                  return (
                    <TimelineItem key={index}>
                      <TimelineContent sx={{ '& svg': { verticalAlign: 'bottom', mx: 4 } }}>
                        {index % 2 == 0 ? (
                          <div>
                            <Box
                              sx={{
                                mb: 2,
                                display: 'flex',
                                flexWrap: 'wrap',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                              }}
                            >
                              <Typography variant='body2' sx={{ mr: 2, fontWeight: 600, color: 'text.primary' }}>
                                {time.title}
                              </Typography>
                              <Typography variant='caption'>{new Date(time.date).toLocaleDateString()}</Typography>
                            </Box>
                            <Typography variant='body2' sx={{ color: 'text.primary' }}>
                              <span>{time.description}</span>
                            </Typography>
                            <Typography variant='caption'>{time.subTitle}</Typography>
                          </div>
                        ) : null}
                      </TimelineContent>
                      <TimelineSeparator>
                        <TimelineDot color={time.color} />
                        <TimelineConnector />
                      </TimelineSeparator>
                      <TimelineContent sx={{ '& svg': { verticalAlign: 'bottom', mx: 4 } }}>
                        {index % 2 != 0 ? (
                          <div>
                            <Box
                              sx={{
                                mb: 2,
                                display: 'flex',
                                flexWrap: 'wrap',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                              }}
                            >
                              <Typography variant='body2' sx={{ mr: 2, fontWeight: 600, color: 'text.primary' }}>
                                {time.title}
                              </Typography>
                              <Typography variant='caption'>{new Date(time.date).toLocaleDateString()}</Typography>
                            </Box>
                            <Typography variant='body2' sx={{ color: 'text.primary' }}>
                              <span>{time.description}</span>
                            </Typography>
                            <Typography variant='caption'>{time.subTitle}</Typography>
                          </div>
                        ) : null}
                      </TimelineContent>
                    </TimelineItem>
                  )
                })}
              </Timeline>
            )}
          </Card>
        </Grid>
      </Grid>
    </>
  )
}

EmployeeTimeLine.getInitialProps = async ({ query: { id } }) => {
  return { id: id }
}

export default EmployeeTimeLine
