// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'

// ** Custom Components Imports
import ReactApexcharts from 'src/@core/components/react-apexcharts'

const CrmTotalGrowth = ( props) => {
    const { expiaryDocuments_count , documents_count } = props

  // ** Hook
  const theme = useTheme()

  const options = {
    legend: { show: false },
    stroke: { width: 5, colors: [theme.palette.background.paper] },
    colors: [theme.palette.primary.main, theme.palette.success.main, theme.palette.secondary.main],
    labels: [`${new Date().getFullYear()}`, `${new Date().getFullYear() - 1}`, `${new Date().getFullYear() - 2}`],
    tooltip: {
      y: { formatter: val => `${val}%` }
    },
    dataLabels: {
      enabled: false
    },
    states: {
      hover: {
        filter: { type: 'none' }
      },
      active: {
        filter: { type: 'none' }
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            name: { show: false },
            total: {
              label: '',
              show: true,
              fontWeight: 600,
              fontSize: '1rem',
              color: theme.palette.text.secondary,
              formatter: val => (typeof val === 'string' ? `${val}%` : Math.floor((Number( expiaryDocuments_count ) / Number(documents_count ))*100)+'%' )
            },
            value: {
              offsetY: 6,
              fontWeight: 600,
              fontSize: '1rem',
              formatter: val => `${val}%`,
              color: theme.palette.text.secondary
            }
          }
        }
      }
    }
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
          <Typography variant='h6' sx={{ mr: 1.5 }}>
            Expired documents 
          </Typography>
          <Typography variant='subtitle2' sx={{ color: 'primary.main' }}>
            {expiaryDocuments_count} of {documents_count}
          </Typography>
        </Box>
        <ReactApexcharts type='donut' height={135} options={options} series={[ Number(documents_count - expiaryDocuments_count ) , Number(expiaryDocuments_count )]} />
      </CardContent>
    </Card>
  )
}

export default CrmTotalGrowth
