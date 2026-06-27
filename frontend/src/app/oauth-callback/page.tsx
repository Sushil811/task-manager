"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      localStorage.setItem("token", token);
      // Give a brief moment for the user to see the success state
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } else {
      router.push("/login?error=true");
    }
  }, [router, searchParams]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-4"
    >
      <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
        <CheckCircle className="w-8 h-8 text-green-500" />
      </div>
      <h1 className="text-2xl font-bold">Authentication Successful!</h1>
      <p className="text-muted-foreground">Redirecting to your workspace...</p>
    </motion.div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <Suspense fallback={
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-muted-foreground">Verifying authentication...</p>
        </div>
      }>
        <OAuthCallbackContent />
      </Suspense>
    </div>
  );
}
