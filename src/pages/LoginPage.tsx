import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../store/hooks";
import { setCredentials } from "../redux/features/auth/authSlice";
import { api } from "../lib/axios";
import { useForm } from "react-hook-form";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../components/ui/form";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

type LoginFormValues = {
  email: string;
  password: string;
};

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const form = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const res = await api.post("/auth/login", values);
      dispatch(
        setCredentials({
          accessToken: res.data.token,
          user: res.data.data,
        })
      );
      navigate("/"); // redirect home
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded">
      <h1 className="text-2xl font-bold mb-6">Login</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            rules={{
              required: "Email is required",
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: "Invalid email address",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <Label>Email</Label>
                <FormControl>
                  <Input placeholder="Email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            rules={{ required: "Password is required" }}
            render={({ field }) => (
              <FormItem>
                <Label>Password</Label>
                <FormControl>
                  <Input type="password" placeholder="Password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            Login
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default LoginPage;
