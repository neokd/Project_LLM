import React from 'react';
import { FaAngleLeft, FaAngleRight, FaCircleXmark, FaAlignJustify } from "react-icons/fa6";
import { RiMenu3Fill } from "react-icons/ri";

function Sidebar({ isOpen, onToggle }) {
    return (
        <div className="relative">
            {/* Sidebar in mobile view */}
            <div className='md:hidden fixed w-full z-50 h-12  bg-slate-50 dark:border-slate-700 dark:bg-[#151626] items-center px-2 flex flex-row justify-between'>
                <div>
                    <button className="p-2 rounded-full text-white duration-300" onClick={onToggle}>
                        {
                            isOpen ? (
                                <FaCircleXmark size={20} />
                            ) : (
                                <FaAlignJustify size={20} />
                            )
                        }
                    </button>

                </div>
                <div className='flex '>
                    <h1 className="text-2xl font-bold dark:text-white">HISTORY</h1>
                </div>
            </div>

            {/* Sidebar */}
            <aside
                className={`fixed top-12 md:top-0 h-[100vh] w-52 flex border-r border-gray-200 flex-col overflow-y-auto bg-slate-50 pt-4 dark:border-slate-600 dark:bg-[#151626] sm:h-[100vh] sm:w-64 z-40 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full  '
                    }`}
            >
                <div className="flex px-4 justify-between">
                    <h1 className="text-2xl font-bold dark:text-white">RS BOT</h1>
                    <button className=" rounded-full text-white duration-300" onClick={onToggle}>
                        <RiMenu3Fill size={24} className='text-black dark:text-white' />
                    </button>
                </div>
                <div className="mx-2 mt-8">
                    <button
                        className="flex w-full gap-x-4 rounded-lg bg-[#0f162b] border border-slate-300 p-4 text-left text-sm font-medium text-slate-100 transition-colors duration-200 hover:bg-[] dark:bg-[#5841d9] focus:outline-none dark:border-slate-700 dark:text-slate-200 dark:hover:bg-violet-500"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            stroke="currentColor"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path stroke="none" d="M0 0h24v24H0z"></path>
                            <path d="M12 5l0 14"></path>
                            <path d="M5 12l14 0"></path>
                        </svg>
                        New Chat
                    </button>
                </div>
            </aside>

            {/* Toggle button */}

            {
                isOpen ? (
                    <button className={`absolute md:block hidden md:top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-gray-300 duration-300 ${isOpen ? 'left-52 lg:left-[16.5rem]' : 'left-2'} `} onClick={onToggle}>
                        <FaAngleLeft />
                    </button>
                ) : (
                    <button
                        className={`absolute md:block hidden md:top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-gray-300 duration-300 ${isOpen ? 'left-52 lg:left-[16.5rem]' : 'left-2'} `}
                        onClick={onToggle}
                    >
                        <FaAngleRight />
                    </button>

                )
            }

        </div>
    );
}

export default Sidebar;
