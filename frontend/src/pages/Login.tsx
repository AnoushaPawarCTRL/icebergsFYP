import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api/auth.ts";
import { SubmitHandler, useForm } from "react-hook-form";
import styles from "./login.module.css";
import { useState } from "react";
import { Loading } from "../components/loading/Loading.tsx";
import iceberg from "../assets/iceberg.png";

interface FormInput {
  email: string;
  password: string;
}

export function Login() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInput>();

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [backendError, setBackendError] = useState<string>("");

  const submitLogin: SubmitHandler<FormInput> = async (data) => {
    setSubmitting(true);
    setBackendError("");
    try {
      await loginUser(data.email, data.password);
      navigate("/");
    } catch (err) {
      console.error(err);
      setBackendError("Invalid email or password");
      setSubmitting(false);
    }
  };

  if (submitting) {
    return <Loading />;
  }

  return (
    <main className={styles.container}>

      {/* Iceberg image with bobbing animation */}
      <div className={styles.icebergWrapper}>
        <img src={iceberg} alt="CryoAI iceberg" />
      </div>

      {/* CryoAI logo overlaid on iceberg */}
      <span className={styles.logo}>CryoAI</span>

      {/* Animated water wave at sea level */}
      <div className={styles.waveContainer}>
        <svg
          className={styles.wave}
          viewBox="0 0 1440 40"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            d="M0,20 C180,35 360,5 540,20 C720,35 900,5 1080,20 C1260,35 1440,5 1440,20 L1440,40 L0,40 Z"
            fill="#0d3a5c"
          />
        </svg>
      </div>

      {/* Login form */}
      <section className={styles.formSection}>
        <form onSubmit={handleSubmit(submitLogin)} className={styles.form}>
          <input
            className={styles.input}
            type="text"
            placeholder="Email"
            {...register("email", { required: true })}
          />

          <input
            className={styles.input}
            type="password"
            placeholder="Password"
            {...register("password", { required: true })}
          />

          <button type="submit" className={styles.loginBtn}>
            {submitting ? "Logging in..." : "Login"}
          </button>

          <div className={styles.signupLink}>
            <Link to="/signup">Don't have an account? Sign up</Link>
          </div>

          <button type="button" className={styles.guestBtn}>
            Try guest account
          </button>

          <section className={styles.errors}>
            {errors.email && (
              <span className={styles.error}>Please provide your email</span>
            )}
            {errors.password && (
              <span className={styles.error}>Please provide your password</span>
            )}
            {backendError && (
              <span className={styles.error}>{backendError}</span>
            )}
          </section>
        </form>
      </section>
    </main>
  );
}
