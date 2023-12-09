import { useState } from 'react'

function Register() {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [username, setUsername] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username : username,
                email: email,
                password: password
            })
        })
        const data = await response.json()
        if (data.status === 200) {
            localStorage.setItem('user_id', data.user_id)
            localStorage.setItem('username', data.username)
            window.location.href = '/chat'

        } else {
            alert(data.message)
        }
    }

    return (
        <div className="flex min-h-full flex-col justify-center items-center  m-auto h-screen bg-[#f9fbfc]">
            <div className="flex flex-col justify-center items-center bg-white  lg:w-1/6 rounded-lg shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6 p-4 lg:p-8 rounded-lg w-full">
                <h1 className="text-3xl font-bold text-center">Register</h1>
                <div className='w-full'>
                        <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900">Username</label>
                        <div className="mt-2">
                            <input id="username" name="username" type="text" autoComplete="username" required className=" rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 w-full" onChange={(e) => setUsername(e.target.value)} />
                        </div>
                    </div>
                    <div className='w-full'>
                        <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">Email address</label>
                        <div className="mt-2">
                            <input id="email" name="email" type="email" autoComplete="email" required className=" rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 w-full" onChange={(e) => setEmail(e.target.value)} />
                        </div>
                    </div>
                    <div className='w-full'>
                        <div className="flex items-center justify-between w-full">
                            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">Password</label>
                        </div>
                        <div className="mt-2">
                            <input id="password" name="password" type="password" autoComplete="current-password" required className="w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" onChange={(e) => setPassword(e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <button type="submit" className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Sign Up</button>
                    </div>
                    <p className='flex justify-end text-sm'>
                        Don't have an account?
                        <a href="/" className=" text-indigo-600 hover:text-indigo-500 mx-1">Login</a>
                    </p>
                </form>
            </div>
        </div>
    )
}

export default Register
