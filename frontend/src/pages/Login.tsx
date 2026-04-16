import { Link, useNavigate } from "react-router-dom";
import { fetchWithQuery } from "../../helpers/fetchData";
import { SubmitHandler, useForm } from "react-hook-form";
import styles from "./login.module.css";
import { useState } from "react";
import { Loading } from "../loading/Loading";
import { Logo } from "../icons/Logo";

export function Login() {
  interface FormInput {
    email: string;
    password: string;
  }

  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInput>();

  const [submitting, setSubmitting] = useState(false);
  const [backendError, setBackendError] = useState("");

  const submitLogin: SubmitHandler<FormInput> = async (data) => {
    setSubmitting(true);
    const cookieQuery = {
      useCookies: "true",
      useSessionCookies: "true",
    };
    const credentials = JSON.stringify(data);
    const loginResponse = await fetchWithQuery(
      "login",
      "POST",
      credentials,
      cookieQuery
    );

    if (loginResponse instanceof Error) {
      return navigate("/error");
    } else if (loginResponse.status === 401) {
      setBackendError("User doesn't exist");
      setSubmitting(false);
    } else if (!loginResponse.ok) {
      return navigate("/error");
    } else {
      return navigate("/");
    }
  };

  return (
    <>
      <main>
        <section className={styles.container}>
          <Logo size="extraLarge" />
          <h1 className={styles.title}>CryoAI</h1>
          <form onSubmit={handleSubmit(submitLogin)} className={styles.form}>
            <input
              type="text"
              placeholder="Email"
              {...register("email", { required: true })}
            />
            <input
              type="password"
              placeholder="Password"
              {...register("password", { required: true })}
            />
            {!submitting ? (
              <input type="submit" value="Login" />
            ) : (
              <input type="submit" value="Logging in" disabled />
            )}
            <section className={styles.errors}>
              {errors.email && (
                <span className={styles.error}>Please provide email</span>
              )}
              {errors.password && (
                <span className={styles.error}>Please provide password</span>
              )}
              {backendError && (
                <span className={styles.error}>{backendError}</span>
              )}
            </section>
          </form>
          <section className={styles.options}>
            <Link className={styles.link} to={"/signup"}>
              Don't have an account? Sign up
            </Link>
          </section>
      </main>
    </>
  );
}
