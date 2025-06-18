// LoginPage.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "./images/logo.jpg";
import styles from "./Login.module.css";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost/school/index.php", {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      console.log("Response data:", data);

      if (data.success) {
        localStorage.setItem("userToken", data.token);
        localStorage.setItem("userID", data.userID);
        localStorage.setItem("userRole", data.role);
        navigate("/dashboard");
      } else {
        setError(data.message || "Login failed. Please try again.");
      }
    } catch (error) {
      setError("An error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles["login-module"]}>
      <div className={styles["login-container"]}>
        <div className={styles["login-left"]}>
          <div className={styles["login-left-content"]}>
            <h1>Welcome Back!</h1>
            <p>Your personalized school portal</p>
            <div className={styles["logo-container"]}>
              <img src={logo} alt="Logo" />
            </div>
          </div>
        </div>

        <div className={styles["login-right"]}>
          <div className={styles["login-right-content"]}>
            <h2>Login</h2>
            <p>Enter your credentials to access your account</p>
            {error && <div className={styles["error-message"]}>{error}</div>}
            <form className={styles["login-form"]} onSubmit={handleSubmit}>
              <div className={styles["form-group"]}>
                <label htmlFor="username" className={styles["form-label"]}>
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={styles["form-input"]}
                  required
                />
              </div>
              <div className={styles["form-group"]}>
                <label htmlFor="password" className={styles["form-label"]}>
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles["form-input"]}
                  required
                />
              </div>
              <div className={styles["form-actions"]}>
                <Link to="/forgot-password" className={styles["forgot-password"]}>
                  Forgot Password?
                </Link>
                <button type="submit" className={styles["login-button"]} disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Log In"}
                </button>
              </div>
            </form>
            
            <div className={styles["terms-and-privacy"]}>
              <span>Terms and Conditions & Privacy Policy</span>
            </div>
            <h3 className={styles["school-name"]}>
              New Life International School
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;