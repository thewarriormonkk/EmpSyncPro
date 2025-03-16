import { Link } from "react-router-dom"
import { useLogout } from "../hooks/useLogout"
import { useAuthContext } from "../hooks/useAuthContext"

const Navbar = () => {
    const { logout } = useLogout()
    const { employee } = useAuthContext()

    const handleClick = () => {
        logout()
    }

    return (
        <header>
            <div className="container">
                <Link to='/' >
                    <h1>EmpSyncPro</h1>
                </Link>
                <nav>
                    {employee && (
                        <div>
                            <Link to="/employees">Employee List</Link>
                            <div className="user-info">
                                <span className="user-name">{employee.name}</span>
                                <span className="user-email">{employee.email}</span>
                            </div>
                            <button onClick={handleClick}>Log out</button>
                        </div>
                    )}
                    {!employee && (
                        <div>
                            <Link to='/login'>Login</Link>
                            <Link to='/signup'>Signup</Link>
                        </div>
                    )}
                </nav>
            </div>
        </header>

    );
}

export default Navbar