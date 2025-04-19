export default defineNuxtRouteMiddleware(() => {
  
    const { session } = useUserSession()
    // redirect the user to the login screen if they're not authenticated
    if (!session.value?.loggedIn) {
      return navigateTo('/login')
    }
  })
  