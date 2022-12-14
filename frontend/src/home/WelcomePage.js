import React from 'react';
import {Link} from "react-router-dom";

export default function WelcomePage() {
    return (
        <div className="welcome-bg">
            <div className="d-flex flex-column container me-lg-5 gap-lg-5 m-auto pt-lg-5 w-50">
                <h1 className="title">Online Energy Utility Platform</h1>
                <Link className="custom-link" to="/login">Login</Link>
                <Link className="custom-link" to="/register">Register</Link>
            </div>
        </div>
    );
}
