import { useState } from 'react'
import { useAuthContext } from '../hooks/useAuthContext'
import { useNavigate } from 'react-router-dom'

const UpdateProfile = () => {
    const { employee, dispatch } = useAuthContext()
    const navigate = useNavigate()
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        designation: employee?.designation || '',
        department: employee?.department || '',
        skills: employee?.skills?.join(', ') || '',
        salary: employee?.salary || '',
        phoneNumber: employee?.phoneNumber || '',
        address: employee?.address || ''
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        // Convert skills string to array and salary to number
        const skillsArray = formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill !== '')
        const salaryNumber = parseFloat(formData.salary)

        const response = await fetch('http://localhost:4000/api/employee/update', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${employee.token}`
            },
            body: JSON.stringify({
                designation: formData.designation,
                department: formData.department,
                skills: skillsArray,
                salary: salaryNumber,
                phoneNumber: formData.phoneNumber || undefined,
                address: formData.address || undefined
            })
        })

        const json = await response.json()

        if (!response.ok) {
            setError(json.error)
            setIsLoading(false)
        }
        if (response.ok) {
            // Update the employee in local storage
            const updatedEmployee = { ...employee, ...json }
            localStorage.setItem('employee', JSON.stringify(updatedEmployee))

            // Update the auth context
            dispatch({ type: 'LOGIN', payload: updatedEmployee })

            // Redirect to home page
            navigate('/')
        }
        setIsLoading(false)
    }

    return (
        <form className="update-profile" onSubmit={handleSubmit}>
            <h2>Update Profile</h2>

            <div className="form-group">
                <label>Designation:</label>
                <input
                    type="text"
                    name="designation"
                    onChange={handleChange}
                    value={formData.designation}
                />
            </div>

            <div className="form-group">
                <label>Department:</label>
                <input
                    type="text"
                    name="department"
                    onChange={handleChange}
                    value={formData.department}
                />
            </div>

            <div className="form-group">
                <label>Skills (comma-separated):</label>
                <input
                    type="text"
                    name="skills"
                    onChange={handleChange}
                    value={formData.skills}
                    placeholder="e.g. JavaScript, React, Node.js"
                />
            </div>

            <div className="form-group">
                <label>Annual Salary (₹):</label>
                <input
                    type="number"
                    name="salary"
                    onChange={handleChange}
                    value={formData.salary}
                    min="0"
                    step="1000"
                />
            </div>

            <div className="form-group">
                <label>Phone Number:</label>
                <input
                    type="tel"
                    name="phoneNumber"
                    onChange={handleChange}
                    value={formData.phoneNumber}
                />
            </div>

            <div className="form-group">
                <label>Address:</label>
                <textarea
                    name="address"
                    onChange={handleChange}
                    value={formData.address}
                />
            </div>

            <button type="submit" disabled={isLoading}>
                Update Profile
            </button>
            {error && <div className="error">{error}</div>}
        </form>
    )
}

export default UpdateProfile 