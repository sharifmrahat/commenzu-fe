import { Link, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { logout } from "../redux/features/auth/authSlice";
import { Button } from "../components/ui/button"; // adjust path

const Header = () => {
  const { accessToken, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <header className="flex justify-between items-center p-4 border-b border-gray-200">
      <div>
        <Link to="/" className="text-2xl font-bold">
          Commenzu
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {!accessToken ? (
          <>
            <Link to="/login">
              <Button variant="outline" size="sm">
                Login
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="sm">Signup</Button>
            </Link>
          </>
        ) : (
          <>
            <span className="text-gray-700">Hi, {user?.name}</span>
            <Button variant="destructive" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
