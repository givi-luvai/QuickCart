'use client'
import { productsDummyData, userDummyData } from "@/assets/assets";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import toast from "react-hot-toast";

export const AppContext = createContext();

export const useAppContext = () => {
    return useContext(AppContext)
}


export default function DebugSeller() {
    const { user } = useUser()
    const { isSeller, userData } = useAppContext()

    return (
        <div className="p-4 bg-gray-100 my-4">
            <h2 className="font-bold">Debug Info:</h2>
            <pre className="whitespace-pre-wrap">
                {JSON.stringify({
                    userId: user?.id,
                    userEmail: user?.primaryEmailAddress?.emailAddress,
                    metadata: user?.publicMetadata,
                    isSeller: isSeller,
                    userData: userData
                }, null, 2)}
            </pre>
        </div>
    )
}

export const AppContextProvider = (props) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY
    const router = useRouter()

    const { user } = useUser()
    const{getToken} = useAuth()

    const [products, setProducts] = useState([])
    const [userData, setUserData] = useState(false)
    const [isSeller, setIsSeller] = useState(false)
    const [cartItems, setCartItems] = useState({})

    const fetchProductData = async () => {
        setProducts(productsDummyData)
    }

// ...existing code...
const fetchUserData = async () => {
    try {
        if (!user) {
            console.log("No user found")
            return
        }

        console.log("Current user:", {
            id: user.id,
            metadata: user.publicMetadata
        })

        // Check seller status from Clerk metadata
        if (user.publicMetadata?.role === 'seller') {
            console.log("Setting seller status from metadata")
            setIsSeller(true)
        }

        const token = await getToken()
        console.log("Got auth token:", !!token)

        const response = await axios.get('/api/user/data', {
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        console.log("API Response:", response.data)

        if (response.data.success) {
            setUserData(response.data.user)
            if (response.data.user.role === 'seller') {
                setIsSeller(true)
            }
        }
    } catch (error) {
        console.error("Error in fetchUserData:", error)
    }
}
// ...existing code...
   

    const addToCart = async (itemId) => {

        let cartData = structuredClone(cartItems);
        if (cartData[itemId]) {
            cartData[itemId] += 1;
        }
        else {
            cartData[itemId] = 1;
        }
        setCartItems(cartData);

    }

    const updateCartQuantity = async (itemId, quantity) => {

        let cartData = structuredClone(cartItems);
        if (quantity === 0) {
            delete cartData[itemId];
        } else {
            cartData[itemId] = quantity;
        }
        setCartItems(cartData)

    }

    const getCartCount = () => {
        let totalCount = 0;
        for (const items in cartItems) {
            if (cartItems[items] > 0) {
                totalCount += cartItems[items];
            }
        }
        return totalCount;
    }

    const getCartAmount = () => {
        let totalAmount = 0;
        for (const items in cartItems) {
            let itemInfo = products.find((product) => product._id === items);
            if (cartItems[items] > 0) {
                totalAmount += itemInfo.offerPrice * cartItems[items];
            }
        }
        return Math.floor(totalAmount * 100) / 100;
    }

    useEffect(() => {
        fetchProductData()
    }, [])

    useEffect(() => {
        if(user){
        fetchUserData()
        }
    }, [user])

    const value = {
        user,getToken,
        currency, router,
        isSeller, setIsSeller,
        userData, fetchUserData,
        products, fetchProductData,
        cartItems, setCartItems,
        addToCart, updateCartQuantity,
        getCartCount, getCartAmount
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}