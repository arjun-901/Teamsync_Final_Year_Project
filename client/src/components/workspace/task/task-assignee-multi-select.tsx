import { Check, ChevronDown } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getAvatarColor, getAvatarFallbackText } from "@/lib/helper";
import { cn } from "@/lib/utils";

type AssigneeOption = {
  value: string;
  name: string;
  profilePicture: string | null;
};

type TaskAssigneeMultiSelectProps = {
  options: AssigneeOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  emptyMessage?: string;
};

export default function TaskAssigneeMultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select assignees",
  disabled = false,
  emptyMessage = "No members have been added to this project yet.",
}: TaskAssigneeMultiSelectProps) {
  const selectedOptions = options.filter((option) => value.includes(option.value));

  const toggleValue = (memberId: string) => {
    if (value.includes(memberId)) {
      onChange(value.filter((id) => id !== memberId));
      return;
    }

    onChange([...value, memberId]);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          disabled={disabled}
          className="h-auto min-h-[48px] w-full justify-between px-3 py-2"
        >
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5 text-left">
            {selectedOptions.length > 0 ? (
              selectedOptions.map((option) => (
                <Badge
                  key={option.value}
                  variant="secondary"
                  className="max-w-full gap-1 rounded-sm px-2 py-1 font-normal"
                >
                  <span className="truncate">{option.name}</span>
                </Badge>
              ))
            ) : (
              <span className="text-sm font-normal text-muted-foreground">
                {placeholder}
              </span>
            )}
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search members..." />
          <CommandList>
            <CommandEmpty>No members found.</CommandEmpty>
            <CommandGroup>
              {options.length === 0 ? (
                <div className="px-2 py-3 text-sm text-muted-foreground">
                  {emptyMessage}
                </div>
              ) : null}
              {options.map((option) => {
                const isSelected = value.includes(option.value);
                const initials = getAvatarFallbackText(option.name);
                const avatarColor = getAvatarColor(option.name);

                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => toggleValue(option.value)}
                    className="cursor-pointer"
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <Check className="h-4 w-4" />
                    </div>
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={option.profilePicture || ""} alt={option.name} />
                      <AvatarFallback className={avatarColor}>
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate">{option.name}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedOptions.length > 0 ? (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => onChange([])}
                    className="cursor-pointer justify-center text-center"
                  >
                    Clear selection
                  </CommandItem>
                </CommandGroup>
              </>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
