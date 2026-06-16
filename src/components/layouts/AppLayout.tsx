import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, PenTool, Image, Grid3X3, Palette, Menu, LogOut, User, Layout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const navItems = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'Create Design', path: '/design', icon: PenTool },
  { name: 'Floor Plan', path: '/builder', icon: Layout },
  { name: 'Gallery', path: '/gallery', icon: Image },
  { name: 'Styles', path: '/styles', icon: Palette },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/auth');
  };

  const UserSection = () => (
    <div className="px-3 py-3 border-t border-border">
      {user ? (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-sidebar-foreground truncate">
              {user.email?.split('@')[0]}
            </p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-muted-foreground hover:text-foreground w-8 h-8"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <Link to="/auth">
          <Button variant="outline" size="sm" className="w-full gap-2">
            <User className="w-4 h-4" /> Sign In
          </Button>
        </Link>
      )}
    </div>
  );

  return (
    <div className="flex min-h-screen w-full">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-border bg-sidebar">
        <div className="flex items-center gap-3 px-6 h-16 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Grid3X3 className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-sidebar-foreground" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
            FutureHouse
          </span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <UserSection />
      </aside>

      {/* Mobile Header */}
      <div className="flex-1 min-w-0 overflow-x-hidden flex flex-col">
        <header className="md:hidden flex items-center gap-3 px-4 h-14 border-b border-border bg-card shrink-0">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <Menu className="w-5 h-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 bg-sidebar flex flex-col">
              <div className="flex items-center gap-3 px-6 h-14 border-b border-border">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Grid3X3 className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-lg font-semibold text-sidebar-foreground" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                  FutureHouse
                </span>
              </div>
              <nav className="flex-1 px-3 py-4 space-y-1">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
              <UserSection />
            </SheetContent>
          </Sheet>
          <span className="text-base font-semibold text-foreground flex-1 min-w-0 truncate" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
            FutureHouse AI
          </span>
          {user && (
            <Button variant="ghost" size="icon" onClick={handleSignOut} className="shrink-0">
              <LogOut className="w-4 h-4" />
            </Button>
          )}
        </header>

        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}