"use client";
import { Loader, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { parseUserAgent } from "@/lib/parse-user-agent";

interface SessionItemProps {
  loading?: boolean;
  userAgent: string;
  date: string;
  expiresAt: string;
  isCurrent?: boolean;
  onRemove?: () => void;
}

export const SessionItem = ({
  userAgent,
  loading,
  date,
  isCurrent = false,
  onRemove,
}: SessionItemProps) => {
  const { os, browser, timeAgo, icon: Icon } = parseUserAgent(userAgent, date);

  const handleRemove = () => {
    if (onRemove) {
      onRemove();
    }
  };
  return (
    <div className="w-full flex items-center ">
      <div
        className="shrink-0 mr-[16px] flex items-center justify-center
       w-[48px] h-[48px] rounded-full border border-[#eee] dark:border-[rgb(42,45,48)]">
        <Icon />
      </div>
      <div className="flex-1 flex items-center justify-between">
        <div className="flex-1">
          <h5 className="text-sm font-medium leading-1">
            {os} / {browser}
          </h5>
          <div className="flex items-center">
            {isCurrent ? (
              <div
                className="bg-green-500/80 h-[20px] px-2 w-[81px] 
              flex items-center justify-center text-xs text-white rounded-lg">
                Active now
              </div>
            ) : (
              <span
                className="mr-[16px] text-[12px]
              text-muted-foreground font-normal
                              ">
                {timeAgo}
              </span>
            )}
          </div>
        </div>

        {!isCurrent && (
          <Button
            disabled={loading}
            variant="ghost"
            size="icon"
            onClick={handleRemove}>
            {loading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 size="29px" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
};
