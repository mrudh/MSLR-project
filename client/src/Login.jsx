import React, { useState, useEffect} from 'react'
import api from "./api";
import { useNavigate, Link } from 'react-router-dom'
import loginImg from './assets/onlineVote.png';
import Header from "./components/Header";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberEmail, setRememberEmail] = useState(true);
    const navigate = useNavigate()
    const [errors, setErrors] = useState({})
    const [formError, setFormError] = useState('')

    useEffect(() => {
      const savedEmail = localStorage.getItem("lastLoginEmail");
      if (savedEmail) {
        setEmail(savedEmail);
      }

      const savedRemember = localStorage.getItem("rememberEmail");
      if (savedRemember !== null) {
        setRememberEmail(savedRemember === "true");
      }
    }, []);


    const handleSubmit = (e) => {
      e.preventDefault();
      setErrors({});
      setFormError('');

      api
        .post('/login', { email: email.trim(), password })
        .then((res) => {
            const { message, token, role, errors } = res.data || {};
            if (errors) {
                setErrors(errors);
                return;
            }

        if (message === 'LOGIN_SUCCESS' && token && role) {
            if (rememberEmail) {
              localStorage.setItem("lastLoginEmail", email.trim());
              localStorage.setItem("rememberEmail", "true");
            } else {
              localStorage.removeItem("lastLoginEmail");
              localStorage.setItem("rememberEmail", "false");
            }
            localStorage.setItem('token', token);
            localStorage.setItem('role', role);
            localStorage.setItem("loginEmail", email.trim());
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setPassword("");
            if (role === 'ec') {
                navigate('/ec');
            } else {
                navigate('/voterDashboard');
            }
        } else {
            setFormError('Unexpected response from server. Please try again.');
        }
    })
    .catch((err) => {
        if (err.response && err.response.data && err.response.data.errors) {
            setErrors(err.response.data.errors);
        } else if (err.response && err.response.data && err.response.data.error) {
            setFormError(err.response.data.error);
        } else {
            setFormError('Something went wrong. Please try again.');
        }
    });
};


  return (  
  <div>
  <Header title="MSLR" showLogout={false}/>
  <div className="container-fluid vh-100">
    <div className="row h-100">
      <div className="col-md-6 d-flex justify-content-center align-items-center bg-secondary">
        <div className="bg-white p-3 w-100" style={{ maxWidth: '400px' }}>
          <h2>Login!</h2>
          {formError && (<div className="alert alert-danger" role="alert">{formError}</div>)}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email">
                <strong>Email</strong>
              </label>
              <input
                type="email"
                placeholder="Enter Email"
                autoComplete="off"
                name="email"
                value={email}
                className={`form-control rounded-0 ${errors.email ? 'is-invalid' : ''}`}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && (<div className="invalid-feedback">{errors.email}</div>)}
            </div>

            <div className="mb-3">
              <label htmlFor="password">
                <strong>Password</strong>
              </label>
              <input
                type="password"
                placeholder="Enter Password"
                autoComplete="off"
                name="password"
                value={password}
                className={`form-control rounded-0 ${errors.password ? 'is-invalid' : ''}`}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && (<div className="invalid-feedback">{errors.password}</div>)}
            </div>

            <div className="form-check mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="rememberEmail"
                checked={rememberEmail}
                onChange={(e) => setRememberEmail(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="rememberEmail">
                Remember email for next login
              </label>
            </div>

            <button type="submit" className="btn btn-success w-100 rounded-0">
              Login
            </button>

            <p className="mt-3">
              Don't have an account?{' '}
              <Link to="/register">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>


      <div className="col-md-6 d-none d-md-block p-0">
        <img 
            src={loginImg} 
            alt="Login visual" 
            className="w-100 h-100"
            style={{ objectFit: "cover" }}
        />
      </div>
    </div>
  </div>
  </div>
)

}

export default Login