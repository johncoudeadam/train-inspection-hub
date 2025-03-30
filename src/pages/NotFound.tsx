
import React from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md px-4">
        <h1 className="text-6xl font-bold text-primary mb-6">404</h1>
        <p className="text-xl text-foreground mb-4">
          Oops! We couldn't find the page you're looking for.
        </p>
        <p className="text-muted-foreground mb-8">
          The page at <code className="bg-muted px-1 py-0.5 rounded">{location.pathname}</code> doesn't exist.
        </p>
        <Button asChild size="lg">
          <Link to="/">
            <Home className="mr-2 h-5 w-5" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
