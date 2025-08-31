import { Navigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import type { JSX } from "react";

type Props = {
  children: JSX.Element;
};

const PrivateRoute = ({ children }: Props) => {
  const { accessToken } = useAppSelector((state) => state.auth);
  return accessToken ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
