import { useState } from "react";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import CreateTaskForm from "./create-task-form";
import PermissionsGuard from "@/components/resuable/permission-guard";
import { Permissions } from "@/constant";

const CreateTaskDialog = (props: { projectId?: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  const onClose = () => {
    setIsOpen(false);
  };
  return (
    <PermissionsGuard requiredPermission={Permissions.CREATE_TASK}>
      <div>
        <Dialog modal={true} open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus />
              New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-auto my-5 border-0">
            <CreateTaskForm projectId={props.projectId} onClose={onClose} />
          </DialogContent>
        </Dialog>
      </div>
    </PermissionsGuard>
  );
};

export default CreateTaskDialog;
