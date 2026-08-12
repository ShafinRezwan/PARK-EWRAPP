"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

import styles from "../app/login/login.module.css";

function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setIsLoggingIn(true);
      setError("");
      console.log("SENDING LOGIN REQUEST");

      const response = await fetch("/api/auth/login", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email,
          password,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to log in.");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to log in.");
    } finally {
      setIsLoggingIn(false);
    }
  }

  return (
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
        <form
          onSubmit={handleLogin}
          className={`${styles["login-input-container"]} mt-3 w-full gap-8`}
        >
          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            className={`${styles["login-input-field"]} tracking-widest`}
          />
          <input
            type="password"
            placeholder="Password"

            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            className={`${styles["login-input-field"]} tracking-widest`}
          />
          {error && (
            <p className="text-center font-semibold text-red-600">{error}</p>
          )}
          <button
            type="submit"
            disabled={isLoggingIn}
            className={`${styles["login-button"]}`}
          >
            {isLoggingIn ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default Login;
