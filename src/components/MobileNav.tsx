import { Home, Mic, FileText, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";

const MobileNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden">
      <div className="flex justify-around p-2">
        <NavItem
          icon={<Home className="w-6 h-6" />}
          label="Home"
          active={isActive("/")}
          onClick={() => navigate("/")}
        />
        <NavItem
          icon={<FileText className="w-6 h-6" />}
          label="Notes"
          active={isActive("/notes")}
          onClick={() => navigate("/notes")}
        />
        <NavItem
          icon={<Calendar className="w-6 h-6" />}
          label="Calendar"
          active={isActive("/calendar")}
          onClick={() => navigate("/calendar")}
        />
      </div>
    </nav>
  );
};

const NavItem = ({
  icon,
  label,
  active = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) => {
  return (
    <button
      className={cn(
        "flex flex-col items-center p-2 rounded-lg",
        active ? "text-primary" : "text-gray-600"
      )}
      onClick={onClick}
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
};

export default MobileNav;
