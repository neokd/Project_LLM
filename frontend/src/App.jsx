import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./components/Home"
import Login from "./components/Login"
import Register from "./components/Register"
import Admin from "./components/admin/AdminDashboard"

function App() {

  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" Component={Login} />
          <Route path="/register" Component={Register} />
          <Route path="/chat" Component={Home} />
          <Route path="/admin" Component={Admin} />
        </Routes>
      </BrowserRouter>
  )
}

export default App
