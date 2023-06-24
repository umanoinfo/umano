// ** Demo Components Imports
import { useSession } from 'next-auth/react'
import Email from './Email'
import NoPermission from 'src/views/noPermission'

const EmailApp = () => {
  const { data: session, status } = useSession()

  if (session && session.user && !session.user.permissions.includes('ViewMail'))
    return <NoPermission header='No Permission' description='No permission to view mails'></NoPermission>

  return (
    <>
      <Email folder='inbox' />
    </>
  )
}

EmailApp.contentHeightFixed = true

export default EmailApp
