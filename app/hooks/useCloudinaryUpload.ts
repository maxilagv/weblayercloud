import { useState, useCallback } from 'react';
import { uploadToCloudinary, uploadMultipleToCloudinary } from '../utils/cloudinaryUpload';

interface UseCloudinaryUploadReturn {
  uploading: boolean;
  error: string | null;
  upload: (file: File, folder?: string) => Promise<string | null>;
  uploadMultiple: (files: FileList | File[], folder?: string) => Promise<string[]>;
}

/**
 * Hook para subir imágenes a Cloudinary desde cualquier componente admin.
 *
 * Uso:
 *   const { uploading, upload } = useCloudinaryUpload();
 *   const url = await upload(file, 'layercloud/products');
 */
export function useCloudinaryUpload(): UseCloudinaryUploadReturn {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (file: File, folder?: string): Promise<string | null> => {
    setUploading(true);
    setError(null);
    try {
      const url = await uploadToCloudinary(file, folder);
      return url;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al subir imagen';
      setError(message);
      return null;
    } finally {
      setUploading(false);
    }
  }, []);

  const uploadMultiple = useCallback(
    async (files: FileList | File[], folder?: string): Promise<string[]> => {
      setUploading(true);
      setError(null);
      try {
        const urls = await uploadMultipleToCloudinary(files, folder);
        return urls;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al subir imágenes';
        setError(message);
        return [];
      } finally {
        setUploading(false);
      }
    },
    [],
  );

  return { uploading, error, upload, uploadMultiple };
}
