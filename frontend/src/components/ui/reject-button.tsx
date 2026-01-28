import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "./button";
import { useApiMutation } from "@/services/useApiMutation";
import LoadingButton from "./loading-button";
import { X } from "lucide-react";
import { Label } from "./label";
import { Input } from "./input";

interface RejectProps {
  label: string;
  apiUrl: string;
  queryKey: string[] | string;
  desc?: string;
  id: number | string;
  variant?: "default" | "contextMenu";
  onSuccess?: () => void;
}

interface RejectRequest {
  id: number | string;
  auditRemark: string;
}

export default function RejectButton(props: RejectProps) {
  const [open, setOpen] = useState(false);
  const [auditRemark, setAuditRemark] = useState("");
  const queryClient = useQueryClient();

  const mutation = useApiMutation<RejectRequest>({
    onSuccess: (res) => {
      const queryKey = Array.isArray(props.queryKey)
        ? props.queryKey
        : [props.queryKey];
      queryClient.invalidateQueries({ queryKey });
      toast.success(res.message);
      setAuditRemark("");
      setOpen(false);
      props.onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to Reject");
    },
  });

  const handleReject = () => {
    if (!auditRemark.trim()) {
      toast.error("Please enter an audit remark");
      return;
    }
    const request = {
      id: props.id,
      auditRemark: auditRemark.trim(),
    };

    mutation.mutate({
      endpoint: `${props.apiUrl}/${props.id}`,
      method: "POST",
      body: request,
    });
  };

  const handleClose = () => {
    setOpen(false);
    setAuditRemark("");
    props.onSuccess?.();
  };

  if (props.variant === "contextMenu") {
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2"
          disabled={mutation.isPending}
        >
          Reject {props.label}
        </button>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="w-125 max-h-[80vh] overflow-y-auto dark:bg-gray-900">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-gray-100">
                Reject {props.label}
              </DialogTitle>
              <DialogDescription className="pt-4 text-gray-600 dark:text-gray-400">
                Are you sure you want to reject this {props.label}? This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label
                  htmlFor="audit-remark"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Audit Remark *
                </Label>
                <Input
                  id="audit-remark"
                  placeholder="Enter reason for rejecting"
                  value={auditRemark}
                  onChange={(e) => setAuditRemark(e.target.value)}
                  disabled={mutation.isPending}
                  className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-red-500 dark:focus:ring-red-600 focus:border-transparent"
                />
                <p className="text-xs text-muted-foreground dark:text-gray-400">
                  Please provide remark.
                </p>
              </div>
            </div>

            <DialogFooter>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={mutation.isPending}
                  className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 bg-white dark:bg-gray-900"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={mutation.isPending}
                  className="bg-red-500 dark:bg-red-600 text-white hover:bg-red-600 dark:hover:bg-red-700 focus:ring-2 focus:ring-red-500 dark:focus:ring-red-600 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                >
                  {mutation.isPending ? (
                    <>
                      <LoadingButton />
                      Rejecting...
                    </>
                  ) : (
                    "Confirm Reject"
                  )}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Default Variant - Original implementation
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="reject">
          <X />
          {props.desc && (
            <span className="text-xs text-red-500 dark:text-red-400">
              {props.desc}
            </span>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="w-125 max-h-[80vh] overflow-y-auto dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-gray-100">
            Reject {props.label}
          </DialogTitle>
          <DialogDescription className="pt-4 text-gray-600 dark:text-gray-400">
            Are you sure you want to reject this {props.label}? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label
              htmlFor="audit-remark"
              className="text-gray-700 dark:text-gray-300"
            >
              Audit Remark *
            </Label>
            <Input
              id="audit-remark"
              placeholder="Enter reason for rejecting"
              value={auditRemark}
              onChange={(e) => setAuditRemark(e.target.value)}
              disabled={mutation.isPending}
              className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-red-500 dark:focus:ring-red-600 focus:border-transparent"
            />
            <p className="text-xs text-muted-foreground dark:text-gray-400">
              Please provide remark.
            </p>
          </div>
        </div>

        <DialogFooter>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={mutation.isPending}
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 bg-white dark:bg-gray-900"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={mutation.isPending}
              className="bg-red-500 dark:bg-red-600 text-white hover:bg-red-600 dark:hover:bg-red-700 focus:ring-2 focus:ring-red-500 dark:focus:ring-red-600 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
              {mutation.isPending ? (
                <>
                  <LoadingButton />
                  Rejecting...
                </>
              ) : (
                "Confirm Reject"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
