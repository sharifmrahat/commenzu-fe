import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import HomePage from "../pages/HomePage";
import PostsPage from "../pages/PostPage";
import PostDetailsPage from "../pages/PostDetailsPage";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";

import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";
import Header from "../components/Header";

const AppRoutes = () => (
  <Router>
    <Header />
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/posts" element={<PostsPage />} />
      <Route
        path="/posts/:postId"
        element={
          <PrivateRoute>
            <PostDetailsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <SignupPage />
          </PublicRoute>
        }
      />
    </Routes>
  </Router>
);

export default AppRoutes;
