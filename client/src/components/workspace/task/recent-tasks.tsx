import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TaskPriorityEnum, TaskStatusEnum } from "@/constant";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { getAllTasksQueryFn } from "@/lib/api";
import {
  getAvatarColor,
  getAvatarFallbackText,
  normalizeTaskAssignees,
  transformStatusEnum,
} from "@/lib/helper";
import { TaskType } from "@/types/api.type";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader } from "lucide-react";

const RecentTasks = () => {
  const workspaceId = useWorkspaceId();

  const { data, isLoading } = useQuery({
    queryKey: ["all-tasks", workspaceId],
    queryFn: () =>
      getAllTasksQueryFn({
        workspaceId,
      }),
    staleTime: 0,
    enabled: !!workspaceId,
  });

  const tasks: TaskType[] = data?.tasks || [];

  return (
    <div className="flex flex-col space-y-3">
      {isLoading ? (
        <Loader
          className="w-8 h-8 
        animate-spin
        place-self-center flex
        "
        />
      ) : null}

      {tasks?.length === 0 && (
        <div
          className="font-semibold
         text-sm text-muted-foreground
          text-center py-4"
        >
          No Task created yet
        </div>
      )}

      <ul role="list" className="divide-y divide-gray-200">
        {tasks.map((task) => {
          const assignees = normalizeTaskAssignees(task.assignedTo);

          return (
            <li
              key={task._id}
              className="flex items-center justify-between gap-2 px-2 py-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-col space-y-1 flex-grow">
                <span className="text-xs capitalize text-gray-600 font-medium">
                  {task.taskCode}
                </span>
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {task.title}
                </p>
                <span className="text-xs text-gray-500">
                  Due: {task.dueDate ? format(task.dueDate, "PPP") : null}
                </span>
              </div>

              <div className="text-xs font-medium">
                <Badge
                  variant={TaskStatusEnum[task.status]}
                  className="flex w-auto gap-1 border-0 px-1.5 py-1 text-[10px] font-medium uppercase shadow-sm"
                >
                  <span>{transformStatusEnum(task.status)}</span>
                </Badge>
              </div>

              <div className="ml-1 text-xs">
                <Badge
                  variant={TaskPriorityEnum[task.priority]}
                  className="flex w-auto gap-1 border-0 px-1.5 py-1 text-[10px] font-medium uppercase shadow-sm"
                >
                  <span>{transformStatusEnum(task.priority)}</span>
                </Badge>
              </div>

              <div className="ml-1 flex items-center space-x-2">
                <div className="flex -space-x-2">
                  {assignees.slice(0, 3).map((assignee) => {
                    const initials = getAvatarFallbackText(assignee.name);
                    const avatarColor = getAvatarColor(assignee.name);

                    return (
                      <Avatar
                        key={assignee._id}
                        className="h-7 w-7 border border-white"
                      >
                        <AvatarImage
                          src={assignee.profilePicture || ""}
                          alt={assignee.name}
                        />
                        <AvatarFallback className={avatarColor}>
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    );
                  })}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default RecentTasks;

// const RecentTasks = () => {
//   const tasks = [
//     {
//       id: "Task-12",
//       title: "You can't compress the program without quanti",
//       date: "December 29, 2024",
//       assigneeTo: "EM",
//     },
//     {
//       id: "Task-13",
//       title: "You can't compress the program without quanti",
//       date: "December 29, 2024",
//       assigneeTo: "EM",
//     },
//     {
//       id: "Task-14",
//       title: "You can't compress the program without quanti",
//       date: "December 29, 2024",
//       assigneeTo: "EM",
//     },
//     {
//       id: "Task-15",
//       title: "You can't compress the program without quanti",
//       date: "December 29, 2024",
//       assigneeTo: "EM",
//     },
//     {
//       id: "Task-16",
//       title: "You can't compress the program without quanti",
//       date: "December 29, 2024",
//       assigneeTo: "EM",
//     },
//   ];
//   return (
//     <div className="flex flex-col pt-2">
//       <ul role="list" className="space-y-2">
//         {tasks.map((item, index) => (
//           <li
//             key={index}
//             role="listitem"
//             className="shadow-none border-0 py-2 hover:bg-[#fbfbfb] transition-colors ease-in-out "
//           >
//             <div className="grid grid-cols-7 gap-1 p-0">
//               <div className="shrink">
//                 <p>{item.id}</p>
//               </div>
//               <div className="col-span-2">
//                 <p className="text-sm font-medium leading-none">{item.title}</p>
//               </div>
//               <div>dueDate</div>
//               <div>Todo</div>
//               <div>High</div>
//               <div className="flex items-center gap-4 place-self-end">
//                 <span className="text-sm text-gray-500">Assigned To</span>
//                 <Avatar className="hidden h-9 w-9 sm:flex">
//                   <AvatarImage src="/avatars/01.png" alt="Avatar" />
//                   <AvatarFallback>{item.assigneeTo}</AvatarFallback>
//                 </Avatar>
//               </div>
//             </div>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default RecentTasks;
