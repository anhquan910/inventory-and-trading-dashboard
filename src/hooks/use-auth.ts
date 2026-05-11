import { api } from "@/lib/axios"; // Axios instance for API calls
import { login } from "@/stores/auth"; // Auth store action to save login token
import { useMutation } from "@tanstack/react-query"; // React Query hook for mutations
import { useNavigate } from "@tanstack/react-router"; // Router hook for navigation
import { z } from "zod"; // Schema validation library
import { toast } from "sonner"; // Toast notification library

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
}); // Validation schema for login form inputs

export type LoginFormData = z.infer<typeof loginSchema>; // Type for login form data

export const useLoginMutation = () => {
  const navigate = useNavigate(); // Get navigation function for redirects

  return useMutation({
    mutationFn: async (values: LoginFormData) => {
      const formData = new URLSearchParams();
      formData.append("username", values.email);
      formData.append("password", values.password);

      const res = await api.post("/auth/token", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      return res.data;
    }, // API call to authenticate user and retrieve access token
    onSuccess: (data) => {
      login(data.access_token);
      toast.success("Login successful");
      navigate({ to: "/" });
    }, // Save token, show success message, and redirect to home on successful login
  });
}; // Hook for logging in users with email and password

export const signupSchema = z
  .object({
    full_name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }); // Validation schema for signup form with password match check

export type SignupFormData = z.infer<typeof signupSchema>; // Type for signup form data

export const useSignupMutation = () => {
  const navigate = useNavigate(); // Get navigation function for redirects

  return useMutation({
    mutationFn: async (values: SignupFormData) => {
      const payload = {
        email: values.email,
        password: values.password,
        full_name: values.full_name,
      };

      const res = await api.post("/auth/signup", payload);
      return res.data;
    }, // API call to create new user account
    onSuccess: () => {
      toast.success("Account created successfully! Please log in.");
      navigate({ to: "/login" });
    }, // Show success message and redirect to login after account creation
  });
}; // Hook for registering new users with email, password, and full name
