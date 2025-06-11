import imageCompression from 'https://cdn.jsdelivr.net/npm/browser-image-compression/+esm';
import { supabase } from './supascaff.js';

export async function processAndUploadImages(containerId, folder = 'uploads/') {
  const container = document.getElementById(containerId);
  const fileInputs = container.querySelectorAll('input[type="file"]');
  const uploadedPaths = {};

  for (const input of fileInputs) {
    const file = input.files[0];
    if (!file) continue;

    // Compress image
    const compressedFile = await imageCompression(file, {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1600,
      useWebWorker: true
    });

    // Upload to Supabase
    const filename = `${folder}${crypto.randomUUID()}_${input.name}.jpg`;
    const { error } = await supabase.storage
      .from('scaffold-inspections')
      .upload(filename, compressedFile, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error(`Error uploading ${input.name}:`, error.message);
    } else {
      uploadedPaths[`${input.name}Url`] = filename; // Use fieldName + "Url" for DB column
    }
  }

  return uploadedPaths;
}
