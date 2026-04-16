import React from "react";
import ReactDOM from "react-dom/client";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { HomePage } from "./pages/HomePage";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { UploadPage } from "./pages/UploadPage";
import { HistoryPage } from "./pages/HistoryPage";
import { ErrorPage } from "./pages/ErrorPage";

import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />, // main layout
    errorElement: <ErrorPage />,
    children: [
      {
        index: true, // default route "/"
        element: <UploadPage />,
      },
      {
        path: "iceberg/:icebergId",
        element: <HistoryPage />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);