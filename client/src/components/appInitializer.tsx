// src/components/AppInitializer.tsx
import { ReactNode, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export const AppInitializer = ({ children }: { children: ReactNode }) => {
  const { initializeAuth, isLoading } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      await initializeAuth(); // ✅ espera a inicialização completa
      setReady(true);
    };
    init();
  }, [initializeAuth]);

  if (!ready || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
        <p className="text-xl font-semibold text-gray-600 dark:text-gray-300">
          Inicializando o aplicativo...
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
