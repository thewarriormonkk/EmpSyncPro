import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthContext } from './hooks/useAuthContext'

// pages and components
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Navbar from './components/Navbar'
import UpdateProfile from './pages/UpdateProfile'
import EmployeeList from './pages/EmployeeList'
import Chat from './pages/Chat'


function App() {
  const { employee } = useAuthContext()

  return (
    <div className="App">
      <BrowserRouter>
        <Navbar />
        <div className="pages">
          <Routes>
            <Route
              path='/'
              element={employee ? <Home /> : <Navigate to="/login" />}
            />
            <Route
              path='/login'
              element={!employee ? <Login /> : <Navigate to="/" />}
            />
            <Route
              path='signup'
              element={!employee ? <Signup /> : <Navigate to="/" />}
            />
            <Route
              path='/update-profile'
              element={employee ? <UpdateProfile /> : <Navigate to="/login" />}
            />
            <Route
              path='/employees'
              element={employee ? <EmployeeList /> : <Navigate to="/login" />}
            />
            <Route
              path="/chat"
              element={employee ? <Chat /> : <Navigate to="/login" />}
            />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
