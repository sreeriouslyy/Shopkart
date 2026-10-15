import React from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api.js';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');

  const change = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    setError('');
    if (!form.fullName || !form.email || !form.password || !form.phone)
      return setError('All fields are required');
    if (form.password.length < 6) return setError('Password must contain at least 6 characters');

    try {
      await api.post('/customers/register', form);
      navigate('/login', { state: { message: 'Registration successful. Please login.' } });
    } catch (e) {
      setError(e.response?.data?.message || 'Registration failed');
    }
  };

  return <main className="auth-page"><section className="card">
    <div className="logo">S</div><h1>Create Account</h1><p>Register for ShopKart</p>
    {error && <div className="error">{error}</div>}
    <form onSubmit={submit}>
      <label>Full Name<input name="fullName" value={form.fullName} onChange={change} placeholder="John Doe" /></label>
      <label>Email<input name="email" type="email" value={form.email} onChange={change} placeholder="john@gmail.com" /></label>
      <label>Password<input name="password" type="password" value={form.password} onChange={change} placeholder="Minimum 6 characters" /></label>
      <label>Phone Number<input name="phone" value={form.phone} onChange={change} placeholder="9876543210" /></label>
      <button className="primary">Create Account</button>
    </form>
    <p className="switch">Already have an account? <Link to="/login">Login</Link></p>
  </section></main>;
}
