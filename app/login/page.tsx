import React from "react";

import styles from "./login.module.css";

function Login() {
  return (
    <>
      <main className="relative min-h-screen overflow-hidden">
        <div className={`${styles["background-effects"]} `} aria-hidden="true">
          <div className={`${styles["blur-circle"]} ${styles["circle-one"]}`} />
          <div className={`${styles["blur-circle"]} ${styles["circle-two"]}`} />
        </div>

        <img
          src="/images/ppl-logo.png"
          alt="Logo"
          className="park-logo absolute left-5 top-5 z-20"
        />

        <div className="relative z-10 flex h-full flex-col items-center justify-center">
          <div className={`${styles["login-box"]} mt-35 `}>
            <h1 className="login-title tracking-[0.02em]">Extra Work Report</h1>
            <h1 className="login-title tracking-[0.02em]"> Dashboard</h1>
          </div>
          <div
            className={`${styles["login-input-container"]} mt-3 w-full gap-8`}
          >
            <input
              type="text"
              placeholder="Email"
              className={`${styles["login-input-field"]} tracking-widest`}
            />
            <input
              type="password"
              placeholder="Password"
              className={`${styles["login-input-field"]} tracking-widest`}
            />
            <button className={`${styles["login-button"]}`}>Login</button>
          </div>
        </div>
      </main>
    </>
  );
}

export default Login;
