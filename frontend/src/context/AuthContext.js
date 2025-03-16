import { createContext, useReducer, useEffect } from 'react'

export const AuthContext = createContext()

export const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN':
            return { employee: action.payload }
        case 'LOGOUT':
            return { employee: null }
        default:
            return state
    }
}

export const AuthContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, {
        employee: null
    })

    useEffect(() => {
        const employee = JSON.parse(localStorage.getItem('employee'))
        console.log(employee);

        if (employee) {
            dispatch({ type: 'LOGIN', payload: employee })
        }
    }, [])

    console.log('AuthContext state: ', state)

    return (
        <AuthContext.Provider value={{ ...state, dispatch }}>
            {children}
        </AuthContext.Provider>
    )
}