import React, { useEffect, useState } from 'react'
import useTheme from '../hooks/useTheme'

import { RiMoonClearLine, RiSunFill } from "react-icons/ri";


function Navbar() {
    const [nextTheme, setTheme] = useTheme();
    const [currentTheme, setCurrenTheme] = useState("light")
    useEffect(() => {
        setCurrenTheme(localStorage.getItem('theme'))
    }, [nextTheme])
    return (
        <div className="sticky h-16 top-12 lg:top-0  md:top-0 w-full px-4  justify-between backdrop-blur flex  transition-colors duration-500 lg:z-50 lg:border-b lg:border-slate-900/10 dark:border-slate-50/[0.06] bg-white/60 supports-backdrop-blur:bg-white/95 dark:bg-[#151626]">
            <div className='flex flex-col mt-4 py-4'>
                {/* <h1 className="text-2xl font-bold dark:text-white">RS BOT</h1> */}
            </div>

            <div className='flex flex-col mt-2'>
                <button onClick={() => setTheme(nextTheme)} className='flex flex-row items-center justify-center mt-1 mr-2'>
                    {currentTheme === "light" ? <RiSunFill size={24} className='text-amber-500 dark:text-black' /> : <RiMoonClearLine size={24} className='text-black dark:text-amber-400' />}
                </button>
            </div>

        </div>
    )
}

export default Navbar
