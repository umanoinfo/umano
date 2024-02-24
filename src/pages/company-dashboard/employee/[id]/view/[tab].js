// ** Third Party Imports
import { Grid } from '@mui/material'
import axios from 'axios'

// ** Demo Components Imports
import EmployeeViewLeft from './EmployeeViewLeft'
import UserViewRight from './UserViewRight'
import { useSession } from 'next-auth/react'
import NoPermission from 'src/views/noPermission'
import { useCallback, useEffect, useState } from 'react'

const DialogAddUser = ({ tab, id }) => {
  const [isLoading, setIsLoading] = useState()
  const [employee, setEmployee] = useState()

  
  const getEmployee = useCallback( () => {
    let data = { id: id }
    setIsLoading(true)

    axios
      .post('/api/company-employee/full-employee/', { data })
      .then(function (response) {
        setIsLoading(false)
        setEmployee(response.data.data[0])
      })
      .catch(function (error) {
        setIsLoading(false)
      })
    }, [id] ) ;

  useEffect(() => {
      getEmployee('')
  }, [getEmployee])

  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12} md={4} lg={4}>
          <EmployeeViewLeft employee={employee} id={id} />
        </Grid>
        <Grid item xs={12} md={8} lg={8}>
          <UserViewRight tab={tab} employee={employee} id={id} />
        </Grid>
      </Grid>
    </>
  )
}

DialogAddUser.getInitialProps = async ({ query: { id, tab } }) => {
  return { id: id, tab: tab }
}

export default DialogAddUser
