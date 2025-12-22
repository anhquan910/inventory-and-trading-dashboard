import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { useForm } from "@tanstack/react-form";
import { Link } from "@tanstack/react-router";
import { useSignupMutation, signupSchema } from "@/hooks/use-auth";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { mutateAsync, isPending } = useSignupMutation();

  const form = useForm({
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validators: {
      onChange: signupSchema,
    },
    onSubmit: async ({ value }) => await mutateAsync(value),
  });

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>
            Enter your email below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
              {/* --- FULL NAME --- */}
              <form.Field
                name="full_name"
                children={(field) => (
                  <Field>
                    <FieldLabel htmlFor="name">Full Name</FieldLabel>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      required
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className={cn(
                        field.state.meta.errors.length > 0 &&
                          "border-destructive focus-visible:ring-destructive"
                      )}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )}
              />

              {/* --- EMAIL --- */}
              <form.Field
                name="email"
                children={(field) => (
                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className={cn(
                        field.state.meta.errors.length > 0 &&
                          "border-destructive focus-visible:ring-destructive"
                      )}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )}
              />

              {/* --- PASSWORDS GRID --- */}
              <Field className="grid grid-cols-2 gap-4">
                {/* Password Field */}
                <form.Field
                  name="password"
                  children={(field) => (
                    <Field>
                      <FieldLabel htmlFor="password">Password</FieldLabel>
                      <Input
                        id="password"
                        type="password"
                        required
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className={cn(
                          field.state.meta.errors.length > 0 &&
                            "border-destructive focus-visible:ring-destructive"
                        )}
                      />
                      {field.state.meta.errors.length > 0 && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )}
                />

                {/* Confirm Password Field */}
                <form.Field
                  name="confirmPassword"
                  children={(field) => (
                    <Field>
                      <FieldLabel htmlFor="confirm-password">
                        Confirm Password
                      </FieldLabel>
                      <Input
                        id="confirm-password"
                        type="password"
                        required
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className={cn(
                          field.state.meta.errors.length > 0 &&
                            "border-destructive focus-visible:ring-destructive"
                        )}
                      />
                      {field.state.meta.errors.length > 0 && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )}
                />
              </Field>

              <FieldDescription>
                Must be at least 8 characters long.
              </FieldDescription>

              {/* --- SUBMIT BUTTON --- */}
              <Field>
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? "Creating Account..." : "Create Account"}
                </Button>
                <FieldDescription className="text-center">
                  Already have an account?{" "}
                  {/* Changed from <a> to <Link> for client-side routing */}
                  <Link to="/login" className="underline hover:text-primary">
                    Sign in
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
