import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/axios";

const SignupPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/auth/signup", { name, email, password });
      navigate("/login"); // go to login after signup
    } catch (err) {
      console.error(err);
      alert("Signup failed");
    }
  };

  return (
    <form onSubmit={handleSignup} style={{ padding: 24, maxWidth: 400 }}>
      <h1 className="text-xl font-bold">Signup</h1>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="block mb-2 w-full p-2 border rounded"
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="block mb-2 w-full p-2 border rounded"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="block mb-2 w-full p-2 border rounded"
      />
      <button type="submit" className="p-2 bg-green-500 text-white rounded">
        Signup
      </button>
    </form>
  );
};

export default SignupPage;
