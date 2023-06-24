// ** Third Party Imports
import { Grid } from '@mui/material'
import axios from 'axios'

// ** Demo Components Imports
import UserViewLeft from './UserViewLeft'
import UserViewRight from './UserViewRight'
import { useSession } from 'next-auth/react'
import NoPermission from 'src/views/noPermission'

const DialogAddUser = ({ tab, id }) => {
  const { data: session, status } = useSession()

  if (session && session.user && !session.user.permissions.includes('ViewUser'))
    return <NoPermission header='No Permission' description='No permission to View Users'></NoPermission>

  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12} md={5} lg={4}>
          <UserViewLeft id={id} />
        </Grid>
        <Grid item xs={12} md={7} lg={8}>
          <UserViewRight tab={tab} id={id} />
        </Grid>
      </Grid>
    </>
  )
}

DialogAddUser.getInitialProps = async ({ query: { id, tab } }) => {
  return { id: id, tab: tab }
}

export default DialogAddUser
