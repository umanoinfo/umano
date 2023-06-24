import Box from '@mui/material/Box'
import { grey, lightBlue } from '@mui/material/colors'
import { useEffect } from 'react'

const View = ({ divcontent, options }) => {
  function test2(str) {
    let new_string = str
    for (let index = 0; index < options.length; index++) {
      const element = options[index]
      let v = new_string.split(element.key)
      let ret = ''
      for (let index = 1; index < v.length; index++) {
        ret = ret + element.replace + v[index]
      }
      new_string = v[0] + ret
    }

    return new_string
  }

  return (
    <>
      <div style={{ border: '1px solid black', padding: '10px' }}>
        {divcontent && options && <div dangerouslySetInnerHTML={{ __html: test2(divcontent) }}></div>}
      </div>
    </>
  )
}

export default View
