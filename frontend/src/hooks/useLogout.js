import { useAuthContext } from "./useAuthContext"

export const useLogout = () => {
    const { dispatch } = useAuthContext()

    const logout = () => {
        // remove employee from storage
        localStorage.removeItem('employee')

        // dispatch logout action
        dispatch({ type: 'LOGOUT' })
    }

    return { logout }
}