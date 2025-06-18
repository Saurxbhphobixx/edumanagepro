import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./HomePage.module.css";

const HomePage = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login");
  };

  return (
    <div className={styles["home-module"]}>
      <header className={styles["home-header"]}>
        <h1>New Life International School</h1>
        <p>Empowering Students for a Brighter Future</p>
      </header>

      <main className={styles["home-main"]}>
        <section className={styles["welcome-section"]}>
          <h2>Welcome to Our School Portal</h2>
          <p>
            Discover a world of learning and growth. Access your personalized
            dashboard, stay updated with school events, and much more.
          </p>
          <button
            className={styles["login-button"]}
            onClick={handleLoginClick}
            aria-label="Login to your account"
          >
            Login
          </button>
        </section>

        <section className={styles["features-section"]}>
          <h2>Why Choose Us?</h2>
          <div className={styles["features-grid"]}>
            <div className={styles["feature-item"]}>
              <h3>Comprehensive Curriculum</h3>
              <p>A well-rounded education tailored for success.</p>
            </div>
            <div className={styles["feature-item"]}>
              <h3>Experienced Faculty</h3>
              <p>Learn from dedicated and skilled educators.</p>
            </div>
            <div className={styles["feature-item"]}>
              <h3>State-of-the-Art Facilities</h3>
              <p>Modern infrastructure to support learning.</p>
            </div>
            <div className={styles["feature-item"]}>
              <h3>Focus on Holistic Development</h3>
              <p>Nurturing mind, body, and spirit.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles["home-footer"]}>
        <p>© 2025 New Life International School. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;