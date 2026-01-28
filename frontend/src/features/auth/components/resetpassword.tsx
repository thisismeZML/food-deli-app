import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  resetPasswordSchema,
  type ResetPasswordSchema,
} from "../schema/reset-password.schema";
import { useApiMutation } from "@/services/useApiMutation";
import { toast } from "sonner";
import { PasswordInput } from "@/components/ui/password-input";

interface ResetPasswordFormProps {
  token: string;
}

const ResetPasswordForm = ({ token }: ResetPasswordFormProps) => {
  const navigate = useNavigate();

  const form = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const resetMutation = useApiMutation({
    onSuccess: (res) => {
      toast.success(res.message);
      navigate("/signin");
    },
  });

  const handleSubmit = (data: ResetPasswordSchema) => {
    try {
      resetMutation.mutate({
        endpoint: "/auth/reset-password",
        method: "POST",
        body: {
          password: data.password,
          token,
        },
      });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="Enter new password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="Confirm password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={resetMutation.isPending}
              variant="primary"
            >
              {resetMutation.isPending && (
                <Loader2 className=" mr-2 font-primary-bold h-4 w-4 animate-spin" />
              )}
              Reset Password
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <div className="w-full text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link to="/signin" className="hover:underline text-text-primary">
            Sign in
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export { ResetPasswordForm };
