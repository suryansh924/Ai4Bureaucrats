import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useRegisterSW } from "virtual:pwa-register/react";
import { useToast } from "@/hooks/use-toast";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const { needRefresh, updateServiceWorker } = useRegisterSW();

  const [refreshAvailable] = needRefresh; // Fix: Properly destructuring

  // Notify user when a new update is available
  useEffect(() => {
    if (refreshAvailable) {
      toast({
        title: "Update Available",
        description: "A new version of BureauMate is available.",
        action: (
          <Button onClick={() => updateServiceWorker(true)}>Update</Button>
        ),
      });
    }
  }, [refreshAvailable, updateServiceWorker, toast]);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <Menu className="h-6 w-6" />
          </Button>
          <h1
            className="text-xl font-bold text-primary cursor-pointer"
            onClick={() => navigate("/")}
          >
            BureauMate AI
          </h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
