import React from 'react';
import '../../styles/auth-shared.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AuthBrand from '../../components/AuthBrand';

const FoodPartnerLogin = () => {

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = e.target.email.value;
    const password = e.target.password.value;

    const response = await axios.post("https://cravio-btre.onrender.com/api/auth/food-partner/login", {
      email,
      password
    }, { withCredentials: true });

    console.log(response.data);
    localStorage.setItem('foodview-role', 'food-partner');

    navigate("/partner-home"); // Redirect to partner dashboard after login

  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card" role="region" aria-labelledby="partner-login-title">
        <header>
          <AuthBrand />
          <h1 id="partner-login-title" className="auth-title">Partner login</h1>
          <p className="auth-subtitle">Access your dashboard and manage orders.</p>
        </header>
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="field-group">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" placeholder="business@example.com" autoComplete="email" />
          </div>
          <div className="field-group">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" placeholder="Password" autoComplete="current-password" />
          </div>
          <button className="auth-submit" type="submit">Sign In</button>
        </form>
        <div className="auth-alt-action">
          New partner? <a href="/food-partner/register">Create an account</a>
        </div>
        <div className="auth-alt-action">
          Normal user? <a href="/user/login">User login</a> or <a href="/user/register">User registration</a>
        </div>
      </div>
    </div>
  );
};

export default FoodPartnerLogin;
