import {useRouter} from 'next/router' ;
import { useEffect } from 'react';

function Error({ statusCode }) {
    const router = useRouter();
    useEffect(()=>{
        if(router.pathname != '/'){
          router.push('/');
        }
    })

    // return (
    //   <p>
    //     {statusCode
    //       ? `An error ${statusCode} occurred on server`
    //       : 'An error occurred on client'}
    //   </p>
    // )
  }
   
  Error.getInitialProps = ({ res, err }) => {
    const statusCode = res ? res.statusCode : err ? err.statusCode : 404
    console.log('Error wrapper' , res , err , statusCode ) ;

    return { statusCode }
  }
   
  export default Error