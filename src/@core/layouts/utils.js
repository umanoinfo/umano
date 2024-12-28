/**
 * Check for URL queries as well for matching
 * Current URL & Item Path
 *
 * @param item
 * @param activeItem
 */
export const handleURLQueries = (router, path) => {
  
      let router_paths = router.asPath.split('/');
      path = path.split('/');
      

      const isId = (str)=>{
        return str.match(/^[a-f\d]{24}$/i);
      }
  
    
      if(isId(router_paths[router_paths.length-2])){
        // console.log('up');
        let match = true ;
        for(let i = 1;i < router_paths.length - 2 ;i++){
          if(path[i] != router_paths[i] ){
            match = false ;
            break;
          }
        }
        if(match){
          // console.log('a', router_paths) ;
          // console.log('b' , path);

          return true ;
        }
        else{
          return false;
        }
      }
      else{
        // console.log('down');
        let match = true ;
        if(router_paths.length != path.length ){
          return false ;
        }
        for(let i = 1 ;i < router_paths.length - 1 ;i++ ){
          if(path[i] != router_paths[i]){
            match = false; 
            break;
          }
        }
        if(match){
          // console.log('a', router_paths) ;
          // console.log('b' , path);

          return true; 
        }
        else{
          return false ;
        }

      }

}

/**
 * Check if the given item has the given url
 * in one of its children
 *
 * @param item
 * @param currentURL
 */
export const hasActiveChild = (item, currentURL) => {
  const { children } = item
  if (!children) {
    return false
  }
  for (const child of children) {
    if (child.children) {
      if (hasActiveChild(child, currentURL)) {
        return true
      }
    }
    const childPath = child.path

    // Check if the child has a link and is active
    if (
      child &&
      childPath &&
      currentURL &&
      (childPath === currentURL || (currentURL.includes(childPath) && childPath !== '/'))
    ) {
      return true
    }
  }

  return false
}

/**
 * Check if this is a children
 * of the given item
 *
 * @param children
 * @param openGroup
 * @param currentActiveGroup
 */
export const removeChildren = (children, openGroup, currentActiveGroup) => {
  children.forEach(child => {
    if (!currentActiveGroup.includes(child.title)) {
      const index = openGroup.indexOf(child.title)
      if (index > -1) openGroup.splice(index, 1)

      // @ts-ignore
      if (child.children) removeChildren(child.children, openGroup, currentActiveGroup)
    }
  })
}
