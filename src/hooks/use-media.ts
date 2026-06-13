import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { toMediaItem } from "@/lib/api/mappers";
import { mediaService, type UploadProgressHandler } from "@/services/media.service";

export function useMediaQuery() {
  return useQuery({
    queryKey: queryKeys.media.list(),
    queryFn: async () => {
      const response = await mediaService.list();
      return response.data.map(toMediaItem);
    },
  });
}

export function useUploadMediaMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      altText,
      onProgress,
    }: {
      file: File;
      altText?: string;
      onProgress?: UploadProgressHandler;
    }) => mediaService.upload(file, { altText, onProgress }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.media.all });
    },
  });
}

export function useDeleteMediaMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, force }: { id: string; force?: boolean }) => mediaService.delete(id, force),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.media.all });
    },
  });
}

export function useDeleteUnusedMediaMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => mediaService.deleteUnused(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.media.all });
    },
  });
}
