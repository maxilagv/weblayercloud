import { httpsCallable, getFunctions } from 'firebase/functions';
import app from '../lib/firebase';

const functions = getFunctions(app, 'us-central1');

interface CloudinarySignatureResult {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string | null;
}

interface UploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

/**
 * Sube un archivo de imagen a Cloudinary usando firma server-side.
 * La API secret nunca sale del servidor.
 *
 * @param file - Archivo a subir (desde <input type="file">)
 * @param folder - Carpeta en Cloudinary donde guardar (ej. "layercloud/products")
 * @returns URL segura de la imagen subida
 */
export async function uploadToCloudinary(file: File, folder?: string): Promise<string> {
  const getSignature = httpsCallable<{ folder?: string }, CloudinarySignatureResult>(
    functions,
    'getCloudinarySignature',
  );

  const { data } = await getSignature({ folder });

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', data.apiKey);
  formData.append('timestamp', String(data.timestamp));
  formData.append('signature', data.signature);
  if (data.folder) {
    formData.append('folder', data.folder);
  }

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${data.cloudName}/image/upload`,
    { method: 'POST', body: formData },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cloudinary upload failed: ${errorText}`);
  }

  const result: UploadResult = await response.json();
  return result.secure_url;
}

/**
 * Genera una URL de Cloudinary con transformaciones aplicadas.
 * Útil para resize on-the-fly sin re-subir.
 */
export function cloudinaryTransform(url: string, transforms: string): string {
  // Inserta las transformaciones en la URL de Cloudinary
  // Ej: https://res.cloudinary.com/cloud/image/upload/v123/path.jpg
  //  → https://res.cloudinary.com/cloud/image/upload/w_400,h_400,c_fill/v123/path.jpg
  return url.replace('/upload/', `/upload/${transforms}/`);
}

/**
 * Acepta múltiples archivos y los sube todos a Cloudinary en paralelo.
 */
export async function uploadMultipleToCloudinary(
  files: FileList | File[],
  folder?: string,
): Promise<string[]> {
  const fileArray = Array.from(files);
  return Promise.all(fileArray.map((file) => uploadToCloudinary(file, folder)));
}
