// ** MUI Imports
import Card from '@mui/material/Card'
import Table from '@mui/material/Table'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import TableRow from '@mui/material/TableRow'
import Checkbox from '@mui/material/Checkbox'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import TableContainer from '@mui/material/TableContainer'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { FormControlLabel } from '@mui/material'
import Link from 'src/@core/theme/overrides/link'
import { useRouter } from 'next/router'

const UserViewPermission = ({ id }) => {
  const router = useRouter()

  const [permissionsGroup, setPermissionsGroup] = useState([])
  const [selectedPermissions, setSelectedPermissions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPermissionGroup()
    getUser()
  }, [])

  const getUser = () => {
    setLoading(true)
    axios
      .get('/api/company-user/' + id, {})
      .then(function (response) {
        setSelectedPermissions(response.data.data[0].permissions)
        setLoading(false)
      })
      .catch(function (error) {
        setLoading(false)
      })
  }

  const getPermissionGroup = () => {
    axios
      .get('/api/permission/company-premission-group', {})
      .then(function (response) {
        setPermissionsGroup(response.data.data)
      })
      .catch(function (error) {})
  }

  const routeToEditUser = () => {
    router.push('/company-dashboard/user/' + id + '/edit-user')
  }

  return (
    <Card>
      <CardHeader title='Permissions' />

      <Divider sx={{ m: '0 !important' }} />

      <CardContent>
        <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.secondary' }}>
          You can change permissions by add or remove role.{' '}
          <a
            href='#'
            onClick={() => {
              routeToEditUser()
            }}
            sx={{ color: 'text.primary' }}
          >
            Edit User Roles
          </a>
        </Typography>
      </CardContent>

      <Divider sx={{ m: '0 !important' }} />

      <TableContainer>
        <Table size='small'>
          <TableHead></TableHead>
          <TableBody>
            {permissionsGroup &&
              permissionsGroup.map((group, index) => {
                return (
                  <TableRow key={index} sx={{ '& .MuiTableCell-root:first-of-type': { p: '5 !important' } }}>
                    <TableCell
                      variant='h5'
                      sx={{
                        fontWeight: 900,
                        lineHeight: 1.3,
                        whiteSpace: 'nowrap',
                        color: theme => `${theme.palette.text.primary} !important`
                      }}
                    >
                      {group._id}
                    </TableCell>

                    <TableCell>
                      {group.permissions.map((permission, index) => {
                        return (
                          <FormControlLabel
                            key={permission.id}
                            sx={{ pr: 5 }}
                            label={permission.title}
                            control={
                              <Checkbox
                                checked={selectedPermissions.includes(permission.alias)}
                                size='small'
                                id={permission.alias}
                                desable
                              />
                            }
                          />
                        )
                      })}
                    </TableCell>
                  </TableRow>
                )
              })}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  )
}

export default UserViewPermission
