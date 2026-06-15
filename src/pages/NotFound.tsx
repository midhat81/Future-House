import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h1 className="text-6xl md:text-8xl font-normal text-foreground mb-4" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
        404
      </h1>
      <p className="text-lg text-muted-foreground mb-8 text-pretty max-w-md">
        The page you are looking for does not exist. It might have been moved or deleted.
      </p>
      <Link to="/">
        <Button className="gap-2">
          <Home className="w-4 h-4" /> Back to Home
        </Button>
      </Link>
    </div>
  );
}
