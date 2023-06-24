// ** Third Party Imports
import { Grid } from '@mui/material'
import axios from 'axios'

// ** Demo Components Imports
import CompanyViewLeft from './CompanyViewLeft'
import UserViewRight from './UserViewRight'

const DialogAddUser = ({ tab, id }) => {
  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12} md={5} lg={4}>
          <CompanyViewLeft id={id} />
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
