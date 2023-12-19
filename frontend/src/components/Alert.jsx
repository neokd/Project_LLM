import React, { useState, useEffect } from 'react';
import { IoMdCloseCircleOutline, IoMdInformationCircle } from 'react-icons/io';
import { MdOutlineCloudUpload, MdOutlineTimer } from "react-icons/md";
import { IoWarning } from "react-icons/io5";
import { CgDanger } from "react-icons/cg";
import { BiSolidBot } from "react-icons/bi";

function Alert({ title, message, show, handleAlert, colorType }) {
    
    const color = {
        success: 'green-500',
        danger: 'red-500',
        warning: 'yellow-500',
        info: 'blue-500',
    };

    const getIcon = (colorType) => {
        switch (colorType) {
            case 'success':
                return <MdOutlineCloudUpload size={32} />;
            case 'danger':
                return <CgDanger size={32} />;
            case 'warning':
                return <IoWarning size={32} />;
            case 'info':
                return <IoMdInformationCircle size={32} />;
            default:
                return <BiSolidBot size={32} />;
        }
    }

    const [countdown, setCountdown] = useState(10);

    useEffect(() => {
        let timer;

        if (show) {
            timer = setInterval(() => {
                setCountdown((prevCountdown) => prevCountdown - 1);
            }, 1000);
        }

        return () => {
            clearInterval(timer);
        };
    }, [show]);

    useEffect(() => {
        if (countdown === 0) {
            handleAlert();
        }
    }, [countdown, handleAlert]);

    // useEffect to reset countdown when show changes
    useEffect(() => {
        if (show) {
            setCountdown(10); // Reset countdown when show becomes true
        }
    }, [show]);

    return (
        <div
            role="alert"
            className={`flex w-full max-w-lg bg-white dark:bg-slate-900 items-start justify-between rounded-xl p-4 text-slate-800 shadow-xl fixed top-16 right-4 z-99 ${show ? 'opacity-100' : 'opacity-0 transition-opacity duration-500'
                }`}
        >
            <div className="flex gap-2 sm:gap-4 items-start">
                <div className={`rounded-full p-2 text-${color[colorType]} my-auto `}>
                    {getIcon(colorType)}

                </div>
                <div className={`flex-1  rounded-xl p-4`}>
                    <strong className={`block text-xl font-medium dark:text-white`}>{title}</strong>
                    <p className="mt-2 dark:text-slate-300 text-lg">{message}</p>
                </div>
            </div>
            <div className='lg:w-16 flex flex-col'>
                <button
                    onClick={handleAlert}
                    className="top-0 -right-3 dark:text-slate-300 dark:hover:text-white duration-200 self-end"
                >
                    <IoMdCloseCircleOutline size={24} />
                </button>
                {show && (
                    <p className="mt-8 self-center gap-x-2 dark:text-slate-300 text-lg flex flex-row">
                      <MdOutlineTimer size={26}/>  {countdown}
                    </p>
                )}
            </div>
        </div>
    );
}

export default Alert;
