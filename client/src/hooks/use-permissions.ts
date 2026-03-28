import { PermissionType } from "@/constant";
import { UserType, WorkspaceWithMembersType } from "@/types/api.type";
import { useEffect, useMemo, useState } from "react";
import { Permissions } from "@/constant";

const usePermissions = (
  user: UserType | undefined,
  workspace: WorkspaceWithMembersType | undefined
) => {
  const [permissions, setPermissions] = useState<PermissionType[]>([]);

  useEffect(() => {
    if (user && workspace) {
      const member = workspace.members.find(
        (member) => member.userId === user._id
      );
      if (member) {
        if (member.role.name === "MEMBER") {
          setPermissions([Permissions.VIEW_ONLY]);
          return;
        }

        const rolePermissions = member.role.permissions || [];

        // Backward-compatible fallback: ensure admin can change member roles
        // even if older seeded role documents do not include this permission yet.
        if (member.role.name === "ADMIN") {
          setPermissions([
            ...new Set([
              ...rolePermissions,
              Permissions.CHANGE_MEMBER_ROLE,
            ]),
          ]);
          return;
        }

        setPermissions(rolePermissions);
      }
    }
  }, [user, workspace]);

  return useMemo(() => permissions, [permissions]);
};

export default usePermissions;
