export default defineNuxtRouteMiddleware(() => {
  
    const { session } = useUserSession()
    console.log('session', session.value)
    // redirect the user to the login screen if they're not authenticated
    if (!session.value?.loggedIn) {
      return navigateTo('/login')
    }
  })
  