import { useEffect, useState } from 'react'

function App() {
  const [test, setTest] = useState('Hello world')
  const fetchTest = async () => {
    const response = await fetch('/api/test')
    const data = await response.json()

    if (data.status === 200){
      setTest(data.message)
    }
    else{
      setTest('Error')
    }
  }
  useEffect(() => {
    fetchTest()
  }, [])
  return (
    <h1 className="text-5xl text-center text-bold">{test}</h1>
  )
}

export default App
