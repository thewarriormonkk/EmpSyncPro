import { Link } from 'react-router-dom'
import { useAuthContext } from '../hooks/useAuthContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import '../styles/Home.css'

const Home = () => {
    const { employee, dispatch } = useAuthContext()

    const handleDelete = async (field) => {
        try {
            const response = await fetch('http://localhost:4000/api/employee/update', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${employee.token}`
                },
                body: JSON.stringify({
                    [field]: null
                })
            })

            const json = await response.json()

            if (response.ok) {
                // Update the employee in local storage
                const updatedEmployee = { ...employee, ...json }
                localStorage.setItem('employee', JSON.stringify(updatedEmployee))

                // Update the auth context
                dispatch({ type: 'LOGIN', payload: updatedEmployee })
            }
        } catch (error) {
            console.error('Error deleting field:', error)
        }
    }

    return (
        <div className="home">
            <div className="employee-details">
                <h2>Employee Profile</h2>
                {employee && (
                    <div className="profile-card">
                        <div className="profile-header">
                            <h3>{employee.name}</h3>
                            <Link to="/update-profile" className="update-button">
                                Update Profile
                            </Link>
                        </div>

                        <div className="profile-info">
                            <div className="info-group">
                                <label>Email:</label>
                                <p>{employee.email}</p>
                            </div>

                            {employee.designation && (
                                <div className="info-group">
                                    <div className="info-header">
                                        <label>Designation:</label>
                                        <button
                                            className="delete-btn"
                                            onClick={() => handleDelete('designation')}
                                            title="Delete designation"
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </div>
                                    <p>{employee.designation}</p>
                                </div>
                            )}

                            {employee.department && (
                                <div className="info-group">
                                    <div className="info-header">
                                        <label>Department:</label>
                                        <button
                                            className="delete-btn"
                                            onClick={() => handleDelete('department')}
                                            title="Delete department"
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </div>
                                    <p>{employee.department}</p>
                                </div>
                            )}

                            {employee.skills && employee.skills.length > 0 && (
                                <div className="info-group">
                                    <div className="info-header">
                                        <label>Skills:</label>
                                        <button
                                            className="delete-btn"
                                            onClick={() => handleDelete('skills')}
                                            title="Delete skills"
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </div>
                                    <div className="skills-list">
                                        {employee.skills.map((skill, index) => (
                                            <span key={index} className="skill-tag">{skill}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {employee.salary && (
                                <div className="info-group">
                                    <label>Salary:</label>
                                    <p>₹{employee.salary.toLocaleString()}/year</p>
                                </div>
                            )}

                            {employee.phoneNumber && (
                                <div className="info-group">
                                    <div className="info-header">
                                        <label>Phone:</label>
                                        <button
                                            className="delete-btn"
                                            onClick={() => handleDelete('phoneNumber')}
                                            title="Delete phone number"
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </div>
                                    <p>{employee.phoneNumber}</p>
                                </div>
                            )}

                            {employee.address && (
                                <div className="info-group">
                                    <div className="info-header">
                                        <label>Address:</label>
                                        <button
                                            className="delete-btn"
                                            onClick={() => handleDelete('address')}
                                            title="Delete address"
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </div>
                                    <p>{employee.address}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Home