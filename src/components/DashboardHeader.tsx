import { useNavigate } from "react-router-dom";
import EconologyLogo from "@/components/EconologyLogo";
import { NavLink } from "@/components/NavLink";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  BookOpen,
  TrendingUp,
  Newspaper,
  MessageCircle,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/learn", label: "Learn", icon: BookOpen },
  { to: "/market", label: "Market Ideas", icon: TrendingUp },
  { to: "/news", label: "Economic News", icon: Newspaper },
  { to: "/ask", label: "Ask Ekon", icon: MessageCircle },
];

interface Props {
  initials?: string;
}

export function DashboardHeader({ initials = "U" }: Props) {
  const navigate = useNavigate();
  const { signOut, isGuest } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-8 h-16">
        <div className="flex items-center gap-2.5 shrink-0 cursor-pointer" onClick={() => navigate("/dashboard")}>
          <EconologyLogo responsive />
          <span className="font-display text-lg font-bold gradient-text hidden sm:inline">
            Econology
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
              activeClassName="text-foreground bg-muted"
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => navigate("/progress")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
          >
            <BarChart3 size={16} />
            <span className="hidden sm:inline">Progress</span>
          </button>
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-full ring-2 ring-border hover:ring-primary/50 transition-all">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => navigate("/progress")}>
                <BarChart3 className="h-4 w-4 mr-2" />
                My Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/onboarding")}>
                Redo Onboarding
              </DropdownMenuItem>
              {isGuest ? (
                <DropdownMenuItem onClick={() => navigate("/login")}>
                  Sign In
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => signOut().then(() => navigate("/"))}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile nav */}
      <nav className="md:hidden flex items-center gap-1 px-4 pb-2 overflow-x-auto scrollbar-none">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground whitespace-nowrap transition-colors hover:text-foreground hover:bg-muted"
              activeClassName="text-foreground bg-muted"
            >
              <Icon size={14} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </header>
  );
}
