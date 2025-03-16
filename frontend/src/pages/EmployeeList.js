import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments, faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';

const EmployeeList = () => {
    const [employees, setEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState(null);
    const { employee } = useAuthContext();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await fetch('http://localhost:4000/api/employee', {
                    headers: {
                        'Authorization': `Bearer ${employee.token}`
                    }
                });
                const json = await response.json();

                if (!response.ok) {
                    setError(json.error);
                    return;
                }

                const filteredList = json.filter(emp => emp.email !== employee.email);
                setEmployees(filteredList);
                setFilteredEmployees(filteredList);
            } catch (err) {
                setError('Failed to fetch employees');
            }
        };

        if (employee) {
            fetchEmployees();
        }
    }, [employee]);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredEmployees(employees);
            return;
        }

        const query = searchQuery.toLowerCase();
        const filtered = employees.filter(emp =>
            emp.name.toLowerCase().includes(query) ||
            emp.email.toLowerCase().includes(query) ||
            (emp.department && emp.department.toLowerCase().includes(query))
        );
        setFilteredEmployees(filtered);
    }, [searchQuery, employees]);

    const getInitials = (name) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase();
    };

    const handleViewProfile = (id) => {
        navigate(`/employee/${id}`);
    };

    const handleChatClick = (targetEmployee) => {
        navigate('/chat', {
            state: {
                targetEmployee: {
                    email: targetEmployee.email,
                    name: targetEmployee.name,
                    department: targetEmployee.department
                }
            }
        });
    };

    const handleClearSearch = () => {
        setSearchQuery('');
    };

    const EmployeeCard = ({ employee }) => {
        const navigate = useNavigate();
        const initials = getInitials(employee.name);

        return (
            <div className="employee-card">
                <div className="employee-card-header">
                    <div className="employee-avatar">{initials}</div>
                    <div className="employee-card-header-info">
                        <h3>{employee.name}</h3>
                        <p>Employee</p>
                    </div>
                </div>
                <div className="employee-card-body">
                    <div className="employee-info-item">
                        <label>DEPARTMENT</label>
                        <p>{employee.department || 'Not specified'}</p>
                    </div>
                    <div className="employee-info-item">
                        <label>EMAIL</label>
                        <p>{employee.email}</p>
                    </div>
                </div>
                <div className="employee-card-actions">
                    <button
                        className="chat-btn"
                        onClick={() => handleChatClick(employee)}
                    >
                        <FontAwesomeIcon icon={faComments} />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="employee-list-container">
            <div className="employee-list-header">
                <h2>Employee Directory</h2>
                <div className="search-box">
                    <FontAwesomeIcon icon={faSearch} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or department..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button className="clear-search" onClick={handleClearSearch}>
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    )}
                </div>
            </div>
            {error && <div className="error">{error}</div>}
            <div className="employees-grid">
                {filteredEmployees && filteredEmployees.length > 0 ? (
                    filteredEmployees.map(emp => (
                        <EmployeeCard key={emp._id} employee={emp} />
                    ))
                ) : (
                    <div className="no-results">
                        {searchQuery ? 'No matching employees found' : 'No employees found'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployeeList; 