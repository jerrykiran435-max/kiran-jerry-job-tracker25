import { useEffect, useState } from "react";
import { loadApplications, saveApplications } from "@/lib/storage";
import type { Application } from "@/lib/types";

export function useApplications() {
  const [apps, setApps] = useState<Application[]>([]);

  useEffect(() => {
    setApps(loadApplications());
    const onUpdate = () => setApps(loadApplications());
    window.addEventListener("jat:update", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("jat:update", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);

  const update = (next: Application[]) => {
    setApps(next);
    saveApplications(next);
  };

  return { apps, setApps: update };
}
