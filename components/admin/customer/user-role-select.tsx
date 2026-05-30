"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { USER_ROLE } from "@/prisma/generated/prisma";
import { updateUserRole } from "@/actions/admin/user.actions";
import { toast } from "sonner";
import { Shield, User, Edit } from "lucide-react";

interface UserRoleSelectProps {
  userId: string;
  currentRole: USER_ROLE;
  userName: string;
}

export function UserRoleSelect({ userId, currentRole, userName }: UserRoleSelectProps) {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState(currentRole);
  const [selectedRole, setSelectedRole] = useState(currentRole);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    if (selectedRole === role) {
      setOpen(false);
      return;
    }

    startTransition(async () => {
      try {
        const result = await updateUserRole(userId, selectedRole);

        if (result.success) {
          setRole(selectedRole);
          toast.success(`User role updated to ${selectedRole.toLowerCase()}`);
          setOpen(false);
        } else {
          toast.error(result.error || "Failed to update role");
        }
      } catch (error) {
        toast.error("An error occurred while updating the role");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="flex items-center gap-2">
        <Badge variant={role === USER_ROLE.ADMIN ? "default" : "secondary"} className="capitalize">
          {role === USER_ROLE.ADMIN ? (
            <>
              <Shield className="h-3 w-3 mr-1" /> Admin
            </>
          ) : (
            <>
              <User className="h-3 w-3 mr-1" /> User
            </>
          )}
        </Badge>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Edit className="h-3.5 w-3.5" />
          </Button>
        </DialogTrigger>
      </div>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change User Role</DialogTitle>
          <DialogDescription>
            Update the role for <span className="font-semibold">{userName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <RadioGroup
            value={selectedRole}
            onValueChange={(value) => setSelectedRole(value as USER_ROLE)}
          >
            <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent cursor-pointer">
              <RadioGroupItem value={USER_ROLE.USER} id="user" />
              <Label htmlFor="user" className="flex items-center gap-2 cursor-pointer flex-1">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">User</div>
                  <div className="text-sm text-muted-foreground">Regular customer access</div>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent cursor-pointer mt-3">
              <RadioGroupItem value={USER_ROLE.ADMIN} id="admin" />
              <Label htmlFor="admin" className="flex items-center gap-2 cursor-pointer flex-1">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Admin</div>
                  <div className="text-sm text-muted-foreground">Full admin panel access</div>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPending || selectedRole === role}>
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
