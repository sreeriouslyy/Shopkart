import React from 'react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api.js';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = async e => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/customers/login', { email, password });
      navigate('/home', { replace: true });
    } catch (e) {
      setError(e.response?.status === 401 ? 'Invalid Credentials' : (e.response?.data?.message || 'Login failed'));
    }
  };

  return <main className="auth-page"><section className="card">
    <div className="logo">S</div><h1>Welcome Back</h1><p>Login to your ShopKart account</p>
    {location.state?.message && <div className="success">{location.state.message}</div>}
    {error && <div className="error">{error}</div>}
    <form onSubmit={submit}>
      <label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@gmail.com" /></label>
      <label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Your password" /></label>
      <button className="primary">Login</button>
    </form>
    <p className="switch">New to ShopKart? <Link to="/register">Create Account</Link></p>
  </section></main>;
}
