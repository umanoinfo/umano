// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import { DataGrid } from '@mui/x-data-grid'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials'
import { useRouter } from 'next/router'

const roleObj = {
  document: {
    icon: (
      <Box component='span' sx={{ display: 'flex', mr: 2, color: 'warning.main' }}>
        <Icon icon='mdi:file-outline' />
      </Box>
    )
  },
  employee: {
    icon: (
      <Box component='span' sx={{ display: 'flex', mr: 2, color: 'primary.main' }}>
        <Icon icon='mdi:account-outline' />
      </Box>
    )
  }
}

// ** Day Color

const dayColor = days => {
  if (days > 30) {
    return 'success'
  }
  if (days < 30 && days > 6) {
    return 'warning'
  }
  if (days <= 5) {
    return 'error'
  }
}


const statusObj = {
  active: { color: 'success' },
  pending: { color: 'warning' },
  inactive: { color: 'secondary' }
}

const renderUserAvatar = row => {
  if (row.avatarSrc) {
    return <CustomAvatar src={row.avatarSrc} sx={{ mr: 3, width: 34, height: 34 }} />
  } else {
    return (
      <CustomAvatar skin='light' sx={{ mr: 3, width: 34, height: 34, fontSize: '.8rem' }}>
        {getInitials(row.name ? row.name : 'John Doe')}
      </CustomAvatar>
    )
  }
}



const CrmTable = ({data}) => {
  const router = useRouter();

  const columns = [
    {
      flex: 0.06,
      minWidth: 200,
      field: 'expiryDate',
      headerName: 'Expiry Date',
      renderCell: ({ row }) => {
        return (
        <>
            <Typography variant='body2'>{new Date(row.expiryDate).toLocaleDateString()}</Typography>
              {!row.expiryDateFlag && (
                <CustomChip
                  skin='light'
                  size='small'
                  label={
                    Math.floor((new Date(row.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24), 1) +
                    ' Day'
                  }
                  color={dayColor(
                    Math.floor((new Date(row.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24), 1)
                  )}
                  sx={{ textTransform: 'capitalize', '& .MuiChip-label': { lineHeight: '18px' }, ml: 3 }}
                />
              )}
        </>
      )
      }
  
  
    },
    {
      flex: 0.09,
      field: 'name',
      minWidth: 120,
      headerName: 'Document',
      renderCell: ({ row }) => {
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant='subtitle2' sx={{ color: 'text.primary' }}>
                {row.title}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      flex: 0.05,
      minWidth: 50,
      field: 'version',
      headerName: 'Version',
      renderCell: ({ row }) => <Typography variant='body2'>{row.version}</Typography>
    },
    {
      flex: 0.15,
      minWidth: 110,
      field: 'tags',
      headerName: 'Tags',
      renderCell: ({ row }) => {
  
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', height: 250 }}>
            <Icon fontSize={20} />
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {row.type && row.type.map((t, index) => {
                if(index > 0 ) 
                  return <></>;
                  
                return (
                  <CustomChip
                    key={index}
                    color='primary'
                    skin='light'
                    size='small'
                    sx={{ mx: 0.5, mt: 0.5, mb: 0.5 }}
                    label={t}
                    onClick={()=> router.push(`/company-dashboard/document/category/-/${t}`)}
                  />
                )
              })}
              {
                row.type && row.type?.length - 1 > 0 ?
                  <CustomChip
                    key={2}
                    color='primary'
                    skin='light'
                    size='small'
                    sx={{ mx: 0.5, mt: 0.5, mb: 0.5 }}
                    label={`+${row.type.length -1} more categories`}
                  />
                :
                <></>
              }
            </div>
          </Box>
        )
      }
    }
  ]
  
return (
    <Card>
      <DataGrid autoHeight hideFooter rows={data} columns={columns} disableSelectionOnClick pagination={undefined} />
    </Card>
  )
}

export default CrmTable
