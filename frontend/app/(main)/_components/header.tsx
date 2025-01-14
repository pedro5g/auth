import { SidebarTrigger } from "@/components/ui/sidebar";

export const Header = () => {
  return (
    <div className="w-full">
      <div className="flex h-[60px] items-center  border-b border-[#00002f26] px-2">
        <div className="flex items-center">
          <SidebarTrigger className="-ml-1" />
        </div>
      </div>
    </div>
  );
};
