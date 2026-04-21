import { useRouteError, Link } from "react-router-dom";

export function ErrorPage() {
  return (
    <div style={{ textAlign: "center", padding: "40px" }}>
      <h1>Something went wrong</h1>
      <p>We couldn’t load this page.</p>

      <Link to="/">Go back home</Link>
    </div>
  );
}