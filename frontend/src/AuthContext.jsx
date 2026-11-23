
import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [token, setToken] = useState(
        () => localStorage.getItem('dineora_token') || ''
    )

    const [customer, setCustomer] = useState(() => {
        const savedCustomer = localStorage.getItem('dineora_customer')

        return savedCustomer ? JSON.parse(savedCustomer) : null
    })

    const login = (newToken, customerData) => {
        localStorage.setItem('dineora_token', newToken)
        localStorage.setItem(
            'dineora_customer',
            JSON.stringify(customerData)
        )

        setToken(newToken)
        setCustomer(customerData)
    }

    const logout = () => {
        localStorage.removeItem('dineora_token')
        localStorage.removeItem('dineora_customer')

        setToken('')
        setCustomer(null)
    }

    const isLoggedIn = Boolean(token)

    return (
        <AuthContext.Provider
            value={{
                token,
                customer,
                isLoggedIn,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}
