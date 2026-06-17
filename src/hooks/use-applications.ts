import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  bulkInsertApplications,
  createApplication,
  deleteAllApplications,
  deleteApplication,
  fetchApplications,
  updateApplication,
} from "@/lib/storage";
import type { Application } from "@/lib/types";

const KEY = ["applications"] as const;

export function useApplications() {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: KEY, queryFn: fetchApplications });

  const invalidate = () => qc.invalidateQueries({ queryKey: KEY });

  const create = useMutation({
    mutationFn: (app: Omit<Application, "id">) => createApplication(app),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: (app: Application) => updateApplication(app),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteApplication(id),
    onSuccess: invalidate,
  });

  const clearAll = useMutation({
    mutationFn: () => deleteAllApplications(),
    onSuccess: invalidate,
  });

  const bulkInsert = useMutation({
    mutationFn: (apps: Omit<Application, "id">[]) => bulkInsertApplications(apps),
    onSuccess: invalidate,
  });

  return {
    apps: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    create,
    update,
    remove,
    clearAll,
    bulkInsert,
  };
}
