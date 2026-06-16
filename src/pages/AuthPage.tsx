import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid3X3, Mail, Lock, Loader2, Eye, EyeOff, Home, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const FEATURES = [
  '7 views per design — exterior & interior',
  'Real house photos by style & location',
  'Interactive floor plan builder',
  'Save & compare designs',
];

export default function AuthPage() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) { toast.error('Please fill in all fields'); return; }
    setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast.success('Welcome back!');
        navigate('/');
      } else {
        const { error } = await signUp(email, password);
        if (error) throw error;
        toast.success('Account created! You can now sign in.');
        setMode('login');
      }
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">

      {/* Left panel — branding (hidden on small mobile, shown on md+) */}
      <div className="hidden md:flex flex-col justify-between w-2/5 bg-gradient-to-br from-primary to-primary/70 p-10 text-primary-foreground">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <Grid3X3 className="w-5 h-5" />
          </div>
          <span className="text-xl font-semibold" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
            FutureHouse AI
          </span>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-normal mb-3 leading-tight" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
              Visualize your dream home before it's built
            </h2>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              AI-powered house visualization with real photos from around the world.
            </p>
          </div>
          <div className="space-y-3">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3 h-3" />
                </div>
                <span className="text-sm text-primary-foreground/90">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-primary-foreground/50">© 2026 FutureHouse AI</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10 bg-background">

        {/* Mobile logo */}
        <div className="flex flex-col items-center mb-8 md:hidden">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-3 shadow-lg">
            <Grid3X3 className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
            FutureHouse AI
          </h1>
          <p className="text-sm text-muted-foreground mt-1">AI-powered home visualization</p>
        </div>

        <div className="w-full max-w-sm">
          {/* Mode tabs */}
          <div className="flex bg-muted rounded-xl p-1 mb-6">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'login' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'signup' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Mail className="w-3.5 h-3.5 text-primary" /> Email
              </Label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Lock className="w-3.5 h-3.5 text-primary" /> Password
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  className="pr-10 h-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button className="w-full h-11 gap-2 text-base" onClick={handleSubmit} disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>

            <button
              onClick={() => navigate('/')}
              className="w-full flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Home className="w-4 h-4" /> Continue without account
            </button>
          </div>

          {/* Mobile features */}
          <div className="mt-8 md:hidden space-y-2">
            <p className="text-xs text-muted-foreground text-center mb-3">What you get with FutureHouse AI</p>
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="text-xs text-muted-foreground">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}