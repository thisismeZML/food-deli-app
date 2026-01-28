import ApproveButton from "@/components/ui/approve-button";
import RejectButton from "@/components/ui/reject-button";
import { UserAvatar } from "@/utils/UserAvator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle, XCircle, CreditCard, Banknote, Smartphone, Building, Info, User, Mail, Phone } from "lucide-react";

export type Owner = {
  _id: string | number;
  user: {
    _id: string;
    photo: string;
    username: string;
    email: string;
  };
  name: string;
  phone: string;
  payout: {
    method?: {
      _id: string;
      code: string;
      name: string;
    };
    provider?: {
      _id: string;
      code: string;
      name: string;
    };
    instrument?: {
      _id: string;
      type: string;
      network: string;
      name: string;
    };
    accountNumber?: string;
    accountName?: string;
    phone?: string;
  };
  isVerified: boolean;
  verificationStatus: "pending" | "approved" | "rejected";
  verifiedAt: string;
  verifiedBy?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
};

export const columns: ColumnDef<Owner>[] = [
  {
    accessorKey: "photo",
    header: "User",
    cell: ({ row }) => {
      const { user } = row.original;
      return (
        <div className="flex items-center gap-3">
          <UserAvatar photo={user?.photo} username={user?.username} />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help">
                  <Info className="h-4 w-4 text-gray-400" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3" />
                  <span className="font-medium">{user?.username}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-3 w-3" />
                  <span className="text-sm">{user?.email}</span>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Owner Name",
    cell: ({ row }) => {
      return <span className="font-medium">{row.original.name}</span>;
    },
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-gray-400" />
          <span>{row.original.phone}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "payout.method",
    header: "Payment Method",
    cell: ({ row }) => {
      const payout = row.original.payout;

      const methodIcons = {
        CASH: <Banknote className="h-4 w-4" />,
        WALLET: <Smartphone className="h-4 w-4" />,
        BANK: <Building className="h-4 w-4" />,
        CARD: <CreditCard className="h-4 w-4" />,
      };

      if (!payout?.method) {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-gray-400 text-sm cursor-help">Not set</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Payment method not configured</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }

      const methodIcon = methodIcons[payout.method.code as keyof typeof methodIcons] ||
        <CreditCard className="h-4 w-4" />;

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 cursor-help">
                <div className="p-1.5 rounded-md bg-blue-50 text-blue-700">
                  {methodIcon}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{payout.method.name}</span>
                  {payout.provider && (
                    <span className="text-xs text-gray-500">
                      {payout.provider.name}
                    </span>
                  )}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent className="space-y-2">
              <div>
                <p className="font-medium">Payment Details</p>
                <div className="h-px bg-gray-200 my-1"></div>
              </div>
              <div className="space-y-1">
                <p><strong>Method:</strong> {payout.method.name}</p>
                {payout.provider && (
                  <p><strong>Provider:</strong> {payout.provider.name}</p>
                )}
                {payout.instrument && (
                  <p><strong>Instrument:</strong> {payout.instrument.name}</p>
                )}
                {payout.accountNumber && (
                  <p><strong>Account No:</strong> {payout.accountNumber}</p>
                )}
                {payout.accountName && (
                  <p><strong>Account Name:</strong> {payout.accountName}</p>
                )}
                {payout.phone && payout.method.code === "WALLET" && (
                  <p><strong>Wallet Phone:</strong> {payout.phone}</p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "payout.details",
    header: "Payment Info",
    cell: ({ row }) => {
      const payout = row.original.payout;

      if (!payout || (!payout.accountNumber && !payout.accountName && !payout.instrument)) {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-gray-400 text-sm cursor-help">No details</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>No payment details available</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex flex-col gap-1 cursor-help">
                {payout.accountNumber && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">Acc:</span>
                    <span className="text-sm font-mono">
                      {payout.accountNumber.slice(-4).padStart(payout.accountNumber.length, '•')}
                    </span>
                  </div>
                )}
                {payout.accountName && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">Name:</span>
                    <span className="text-sm truncate max-w-30">{payout.accountName}</span>
                  </div>
                )}
                {payout.instrument && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">Card:</span>
                    <span className="text-sm truncate max-w-30">{payout.instrument.name}</span>
                  </div>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent className="space-y-2">
              <div>
                <p className="font-medium">Full Payment Information</p>
                <div className="h-px bg-gray-200 my-1"></div>
              </div>
              <div className="space-y-1">
                {payout.accountNumber && (
                  <p><strong>Account Number:</strong> {payout.accountNumber}</p>
                )}
                {payout.accountName && (
                  <p><strong>Account Holder:</strong> {payout.accountName}</p>
                )}
                {payout.instrument && (
                  <>
                    <p><strong>Card Type:</strong> {payout.instrument.name}</p>
                    <p><strong>Network:</strong> {payout.instrument.network}</p>
                    <p><strong>Card Type:</strong> {payout.instrument.type}</p>
                  </>
                )}
                {payout.phone && payout.method?.code === "WALLET" && (
                  <p><strong>Wallet Phone:</strong> {payout.phone}</p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "isVerified",
    header: "Verification",
    cell: ({ row }) => {
      const isVerified = row.original.isVerified;
      return (
        <div className="flex items-center gap-2">
          {isVerified ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-green-700 font-medium">Verified</span>
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Not Verified</span>
            </>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "verificationStatus",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.verificationStatus;

      const statusConfig = {
        pending: {
          label: "Pending Review",
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: "⏳",
          tooltip: "Waiting for admin approval",
        },
        approved: {
          label: "Approved",
          color: "bg-green-100 text-green-800 border-green-200",
          icon: "✓",
          tooltip: "Owner has been approved",
        },
        rejected: {
          label: "Rejected",
          color: "bg-red-100 text-red-800 border-red-200",
          icon: "✗",
          tooltip: "Owner application was rejected",
        },
      };

      const config = statusConfig[status as keyof typeof statusConfig] || {
        label: status,
        color: "bg-gray-100 text-gray-800 border-gray-200",
        icon: "?",
        tooltip: "Unknown status",
      };

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border cursor-help ${config.color}`}
              >
                <span>{config.icon}</span>
                {config.label}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{config.tooltip}</p>
              {row.original.verifiedAt && status === "approved" && (
                <>
                  <div className="h-px bg-gray-200 my-1"></div>
                  <p className="text-xs">
                    Approved on: {new Date(row.original.verifiedAt).toLocaleDateString()}
                  </p>
                </>
              )}
              {row.original.rejectionReason && status === "rejected" && (
                <>
                  <div className="h-px bg-gray-200 my-1"></div>
                  <p className="text-xs">
                    <strong>Reason:</strong> {row.original.rejectionReason}
                  </p>
                </>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "action",
    header: "Actions",
    cell: ({ row }) => {
      const owner = row.original;
      const status = owner.verificationStatus;
      const isVerified = owner.isVerified;

      // If already approved, show approved status
      if (status === "approved" || isVerified) {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 cursor-help">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 border border-green-200">
                    <CheckCircle className="h-3 w-3" />
                    <span>Approved</span>
                  </span>
                  {owner.verifiedAt && (
                    <span className="text-xs text-gray-500">
                      {new Date(owner.verifiedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent className="space-y-2">
                <p>This owner has been approved.</p>
                {owner.verifiedAt && (
                  <p className="text-sm">
                    <strong>Approved on:</strong> {new Date(owner.verifiedAt).toLocaleString()}
                  </p>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }

      // If rejected, show rejected status with option to review
      if (status === "rejected") {
        return (
          <div className="flex flex-col gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 cursor-help">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800 border border-red-200">
                      <XCircle className="h-3 w-3" />
                      <span>Rejected</span>
                    </span>
                    {owner.verifiedAt && (
                    <span className="text-xs text-gray-500">
                      {new Date(owner.verifiedAt).toLocaleDateString()}
                    </span>
                  )}
                  </div>
                </TooltipTrigger>
                <TooltipContent className="space-y-2 max-w-62.5">
                  <p>This owner application was rejected.</p>
                  {owner.rejectionReason && (
                    <div>
                      <div className="h-px bg-gray-200 my-1"></div>
                      <p className="text-sm">
                        <strong>Reason:</strong> {owner.rejectionReason}
                      </p>
                    </div>
                  )}
                </TooltipContent>
                <TooltipContent className="space-y-2">
                <p>This owner has been approved.</p>
                {owner.verifiedAt && (
                  <p className="text-sm">
                    <strong>Rejected on:</strong> {new Date(owner.verifiedAt).toLocaleString()}
                  </p>
                )}
              </TooltipContent>
              </Tooltip>
            </TooltipProvider>

{/*             <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <ApproveButton
                        apiUrl="/owner/approve"
                        queryKey="owners"
                        label="Owner"
                        id={owner._id}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Approve this rejected application</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div> */}
          </div>
        );
      }

      // If pending, show both approve/reject buttons
      return (
        <div className="flex items-center gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <ApproveButton
                    apiUrl="/owner/approve"
                    queryKey="owners"
                    label="Owner"
                    id={owner._id}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Approve this owner application</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <RejectButton
                    apiUrl="/owner/reject"
                    queryKey="owners"
                    label="Owner"
                    id={owner._id}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reject this owner application</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    },
  },
];
