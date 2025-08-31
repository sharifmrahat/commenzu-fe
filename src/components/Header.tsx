import { Link, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { logout } from "../redux/features/auth/authSlice";

const Header = () => {
  const { accessToken, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "16px 24px",
        borderBottom: "1px solid #ccc",
      }}
    >
      <div>
        <Link to="/" style={{ fontWeight: "bold", fontSize: 20 }}>
          Commenzu
        </Link>
      </div>

      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        {!accessToken ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
          </>
        ) : (
          <>
            <span>Hi, {user?.name}</span>
            <button
              onClick={handleLogout}
              style={{
                padding: "4px 8px",
                backgroundColor: "#f00",
                color: "#fff",
                borderRadius: 4,
                border: "none",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
