
import { createContext, useContext, useState } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([])

    const addToCart = (food) => {
        setCartItems((previousItems) => {
            const existingItem = previousItems.find(
                (item) => item.id === food.id
            )

            if (existingItem) {
                return previousItems.map((item) =>
                    item.id === food.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            }

            return [...previousItems, { ...food, quantity: 1 }]
        })
    }

    const increaseQuantity = (foodId) => {
        setCartItems((items) =>
            items.map((item) =>
                item.id === foodId
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            )
        )
    }

    const decreaseQuantity = (foodId) => {
        setCartItems((items) =>
            items
                .map((item) =>
                    item.id === foodId
                        ? { ...item, quantity: item.quantity - 1 }
                        : item
                )
                .filter((item) => item.quantity > 0)
        )
    }

    const removeFromCart = (foodId) => {
        setCartItems((items) =>
            items.filter((item) => item.id !== foodId)
        )
    }

    const clearCart = () => {
        setCartItems([])
    }

    const cartCount = cartItems.reduce(
        (total, item) => total + item.quantity,
        0
    )

    const cartTotal = cartItems.reduce(
        (total, item) => total + Number(item.price) * item.quantity,
        0
    )

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                increaseQuantity,
                decreaseQuantity,
                removeFromCart,
                clearCart,
                cartCount,
                cartTotal
            }}
        >
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    return useContext(CartContext)
}
