import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "./images/logo.jpg";
import styles from "./ResetPassword.module.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleSubmitEmail = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost/school/ForgotPassword.php", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      if (data.success) {
        alert("OTP sent to your email.");
        setStep(2);
      } else {
        alert("Failed to send OTP: " + data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost/school/verify_otp_and_reset_password.php", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, otp, new_password: newPassword })
      });

      const data = await response.json();
      if (data.success) {
        alert("Password reset successfully.");
        navigate("/login");
      } else {
        alert("Failed to reset password: " + data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className={styles["reset-module"]}>
      <div className={styles["reset-container"]}>
        <div className={styles["reset-left"]}>
          <div className={styles["reset-left-content"]}>
            <h1>Password Reset</h1>
            <p>We'll help you get back into your account</p>
            <div className={styles["logo-container"]}>
              <img src={logo} alt="Logo" />
            </div>
          </div>
        </div>
        <div className={styles["reset-right"]}>
          <div className={styles["reset-right-content"]}>
            <h2>Forgot Password</h2>
            {step === 1 ? (
              <>
                <p>Enter your email to receive reset instructions</p>
                <form className={styles["reset-form"]} onSubmit={handleSubmitEmail}>
                  <div className={styles["form-group"]}>
                    <label htmlFor="email">Email</label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit">Send OTP</button>
                </form>
              </>
            ) : (
              <>
                <p>Enter OTP and new password</p>
                <form className={styles["reset-form"]} onSubmit={handleResetPassword}>
                  <div className={styles["form-group"]}>
                    <label htmlFor="otp">OTP</label>
                    <input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                    />
                  </div>
                  <div className={styles["form-group"]}>
                    <label htmlFor="newPassword">New Password</label>
                    <input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit">Reset Password</button>
                </form>
              </>
            )}
            <div className={styles["back-to-login"]}>
              <Link to="/login">Back to Login</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
