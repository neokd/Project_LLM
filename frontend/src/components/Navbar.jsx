import React, { useEffect, useState } from 'react'
import useTheme from '../hooks/useTheme'

function Navbar() {
    const [nextTheme, setTheme] = useTheme();
    const [currentTheme,setCurrenTheme] = useState("light")
    useEffect(() => {
        setCurrenTheme(localStorage.getItem('theme'))
    },[nextTheme])
    return (
        <div className="w-full h-12 dark:bg-gray flex justify-between">
            <div></div>
            <button
              onClick={nextTheme === "light" ? () => setTheme(nextTheme) : () => setTheme(nextTheme)}
              className={`${
                nextTheme === "light"
                  ? "text-white bg-gray-800"
                  : "text-black bg-gray-200"
              }`}
            >
                Hello
            </button>
            

        </div>
    )
}

export default Navbar
