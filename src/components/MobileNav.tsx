import { Home, Mic, FileText, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const MobileNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden">
      <div className="flex justify-around p-2">
        <NavItem icon={<Home className="w-6 h-6" />} label="Home" active />
        <NavItem icon={<Mic className="w-6 h-6" />} label="Voice" />
        <NavItem icon={<FileText className="w-6 h-6" />} label="Files" />
        <NavItem icon={<Calendar className="w-6 h-6" />} label="Tasks" />
      </div>
    </nav>
  );
};

const NavItem = ({ 
  icon, 
  label, 
  active = false 
}: { 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean;
}) => {
  return (
    <button
      className={cn(
        "flex flex-col items-center p-2 rounded-lg",
        active ? "text-primary" : "text-gray-600"
      )}
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
};

export default MobileNav;