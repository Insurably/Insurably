import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import imageCompression from 'https://cdn.jsdelivr.net/npm/browser-image-compression/+esm';

// ✅ Initialize Supabase client
const supabase = createClient(
  'https://pnurgfiznfisngfrzdux.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBudXJnZml6bmZpc25nZnJ6ZHV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5NjMyNTgsImV4cCI6MjA1NzUzOTI1OH0.k492flQe1fpLgLwADDewzl7qxA_PSZsS2O1dyMypKdQ'
);

// ✅ Gather all inputs except raw files
function collectFormData(containerId) {
  const container = document.getElementById(containerId);
  const elements = container.querySelectorAll('input, select, textarea');
  const data = {};

  elements.forEach(el => {
    if (!el.name) return;
    if (el.type === 'file') return;
    if ((el.type === 'radio' || el.type === 'checkbox') && !el.checked) return;
    data[el.name] = el.value;
  });

  return data;
}

// ✅ Compress, upload images, and capture signature canvas
async function processAndUploadImages(containerId, folder = 'uploads/') {
  const container = document.getElementById(containerId);
  const fileInputs = container.querySelectorAll('input[type="file"]');
  const uploadedPaths = {};

  // 🔹 Upload file inputs
  for (const input of fileInputs) {
    const file = input.files[0];
    if (!file) continue;

    const compressedFile = await imageCompression(file, {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1600,
      useWebWorker: true
    });

    const filename = `${folder}${crypto.randomUUID()}_${input.name}.jpg`;
    const { error } = await supabase.storage
      .from('scaffold-inspections')
      .upload(filename, compressedFile, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error(`❌ Upload failed for ${input.name}:`, error.message);
    } else {
      uploadedPaths[`${input.name}Url`] = filename;
    }
  }

// 🔹 Upload canvas signature
const signatureCanvas = document.getElementById('signature-pad');
if (signatureCanvas) {
  const dataUrl = signatureCanvas.toDataURL('image/png'); // ✅ PNG format
  const blob = await (await fetch(dataUrl)).blob();

  const signatureFilename = `${folder}${crypto.randomUUID()}_signatureImageInput.png`; // ✅ .png extension
  const { error } = await supabase.storage
    .from('scaffold-inspections')
    .upload(signatureFilename, blob, {
      contentType: 'image/png', // ✅ PNG MIME type
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error(`❌ Upload failed for signatureImageInput:`, error.message);
  } else {
    uploadedPaths['signatureImageInputUrl'] = signatureFilename;
  }
}
}


// ✅ Form submission handler
async function submitScaffoldInspection() {
  const formData = collectFormData('formContainer');
  const imagePaths = await processAndUploadImages('formContainer');

  const finalData = {
    ...formData,
    ...imagePaths
  };

  console.log('📤 Submitting to Supabase:', finalData);

  const { data, error } = await supabase
    .from('scaffold_inspections')
    .insert([finalData]);

  if (error) {
    console.error('❌ Insert failed:', error.message);
    alert('Error submitting inspection. Please try again.');
  } else {
    console.log('✅ Insert succeeded:', data);
    document.getElementById("successMessageContent").style.display = "block";
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// ✅ Attach submit handler to button
document.addEventListener('DOMContentLoaded', () => {
  const submitBtn = document.getElementById('scaffCheckFinishBtn');
  if (submitBtn) {
    submitBtn.addEventListener('click', submitScaffoldInspection);
  } else {
    console.error('❌ Submit button #scaffCheckFinishBtn not found!');
  }
});

export { supabase, submitScaffoldInspection };
