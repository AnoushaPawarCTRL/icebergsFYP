import { Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./pages/Login.tsx";
import { Signup } from "./pages/Signup.tsx";

// export default function App() {
//   return (
//     <Routes>
//       <Route path="/" element={<Navigate to="/login" />} />

//       <Route path="/login" element={<Login />} />
//       <Route path="/signup" element={<Signup />} />

//       <Route path="*" element={<div>Page not found</div>} />
//     </Routes>
//   );

export default function App() {
  return <Login />;
}

