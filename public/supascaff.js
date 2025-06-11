import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import imageCompression from 'https://cdn.jsdelivr.net/npm/browser-image-compression/+esm';

// Initialize Supabase client (anon key)
const supabase = createClient(
  'https://pnurgfiznfisngfrzdux.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBudXJnZml6bmZpc25nZnJ6ZHV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5NjMyNTgsImV4cCI6MjA1NzUzOTI1OH0.k492flQe1fpLgLwADDewzl7qxA_PSZsS2O1dyMypKdQ'
);

// ✅ Updated: skip file inputs entirely
function collectFormData(containerId) {
  const container = document.getElementById(containerId);
  const elements = container.querySelectorAll('input, select, textarea');
  const data = {};

  elements.forEach(el => {
    if (!el.name) return;
    if (el.type === 'file') return; // 🚫 Don't include raw file inputs
    if ((el.type === 'radio' || el.type === 'checkbox') && !el.checked) return;
    data[el.name] = el.value;
  });

  return data;
}

// Compress and upload all file inputs, return { inputNameUrl: path }
async function processAndUploadImages(containerId, folder = 'uploads/') {
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

    // Upload to Supabase Storage
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
      uploadedPaths[`${input.name}Url`] = filename; // e.g. photofirmFootingsUrl
    }
  }

  return uploadedPaths;
}

// Submit to Supabase
async function submitScaffoldInspection() {
  const formData = collectFormData('formContainer');
  const imagePaths = await processAndUploadImages('formContainer');

  const finalData = {
    ...formData,
    ...imagePaths
  };

  console.log('Submitting:', finalData);

  const { data, error } = await supabase
    .from('scaffold_inspections')
    .insert([finalData]);

  if (error) {
    console.error('Insert failed:', error.message);
    alert('Error submitting inspection. Please try again.');
  } else {
    console.log('Insert succeeded:', data);
    document.getElementById("successMessageContent").style.display = "block";
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// Bind to your actual submit button
document.addEventListener('DOMContentLoaded', () => {
  const submitBtn = document.getElementById('scaffCheckFinishBtn');
  if (submitBtn) {
    submitBtn.addEventListener('click', submitScaffoldInspection);
  } else {
    console.error('Submit button #scaffCheckFinishBtn not found!');
  }
});

export { supabase, submitScaffoldInspection };
