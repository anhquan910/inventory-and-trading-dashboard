import { api } from "@/lib/axios";
import { login } from "@/stores/auth";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner"

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const useLoginMutation = () => {
  const navigate = useNavigate();

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
    },
    onSuccess: (data) => {
      login(data.access_token);
      toast.success("Login successful");
      navigate({ to: "/" });
    },
  });
};

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
  });

export type SignupFormData = z.infer<typeof signupSchema>;

export const useSignupMutation = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (values: SignupFormData) => {
      const payload = {
        email: values.email,
        password: values.password,
        full_name: values.full_name,
      };

      const res = await api.post("/auth/signup", payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Account created successfully! Please log in.");
      navigate({ to: "/login" });
    },
  });
};