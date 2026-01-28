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
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import {
  forgetPasswordSchema,
  type ForgetPasswordSchema,
} from "../schema/forget-password.schema";
import { useApiMutation } from "@/services/useApiMutation";
import { toast } from "sonner";

const ForgetPasswordForm = ({}) => {
  const form = useForm<ForgetPasswordSchema>({
    resolver: zodResolver(forgetPasswordSchema),
    defaultValues: { email: "" },
  });

  const forgetMutation = useApiMutation(
    {
        onSuccess: (res) => {
            toast.success(res.message);
        }
    }
  )

  const handleSubmit = (data: ForgetPasswordSchema) => {
    try {
      forgetMutation.mutate({
        endpoint: "/auth/forgot-password",
        method: "POST",
        body: data,
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="your.email@example.com"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button variant="primary" type="submit" className="w-full" disabled={forgetMutation.isPending}>
              {forgetMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send reset link
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <div className="w-full text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link to="/signin" className="text-text-primary/90 hover:underline hover:text-text-primary underline">
            Sign in
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export { ForgetPasswordForm };
