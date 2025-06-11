import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import imageCompression from 'https://cdn.jsdelivr.net/npm/browser-image-compression/+esm';

// ✅ Initialize Supabase client
const supabase = createClient(
  'https://pnurgfiznfisngfrzdux.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBudXJnZml6bmZpc25nZnJ6ZHV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5NjMyNTgsImV4cCI6MjA1NzUzOTI1OH0.k492flQe1fpLgLwADDewzl7qxA_PSZsS2O1dyMypKdQ'
);

// ✅ Utility: checks if the canvas is blank
function isCanvasBlank(canvas) {
  const ctx = canvas.getContext('2d');
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  return !Array.from(pixels).some(channel => channel !== 0);
}

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

// ✅ Compress and upload images including signature canvas
async function processAndUploadImages(containerId, folder = 'uploads/') {
  const container = document.getElementById(containerId);
  const fileInputs = container.querySelectorAll('input[type="file"]');
  const uploadedPaths = {};

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

  // ✅ Upload signature canvas if it's not blank
  const signatureCanvas = document.getElementById('signature-pad');
  if (signatureCanvas && !isCanvasBlank(signatureCanvas)) {
    const dataUrl = signatureCanvas.toDataURL('image/png');
    const blob = await (await fetch(dataUrl)).blob();
    const filename = `${folder}${crypto.randomUUID()}_signatureCanvas.png`;

    const { error } = await supabase.storage
      .from('scaffold-inspections')
      .upload(filename, blob, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error(`❌ Upload failed for signatureCanvas:`, error.message);
    } else {
      uploadedPaths['signatureImageInputUrl'] = filename;
    }
  }

  return uploadedPaths;
}

// ✅ Final-step validation with separate canvas check
function validateFinalStep() {
  const currentStep = document.querySelector('#scaffCheckStepFormContent .card.active');
  let isValid = true;
  let firstInvalid = null;

  currentStep.querySelectorAll('.question-container').forEach(container => {
    container.classList.remove('is-invalid');
    const label = container.querySelector('label.form-label');
    if (label) label.classList.remove('text-danger');
    const existingError = container.querySelector('.invalid-feedback');
    if (existingError) existingError.remove();

    let containerValid = true;

    // ✅ Standard field validation
    container.querySelectorAll('input, select, textarea').forEach(input => {
      if (!input.checkValidity()) {
        containerValid = false;
        if (!firstInvalid) firstInvalid = input;
      }
    });

    if (!containerValid) {
      container.classList.add('is-invalid');
      if (label) label.classList.add('text-danger');
      const error = document.createElement('div');
      error.className = 'invalid-feedback d-block';
      error.textContent = 'This question is required.';
      container.appendChild(error);
      isValid = false;
    }
  });

  // ✅ Dedicated check for signature canvas
  const canvas = document.getElementById('signature-pad');
  if (canvas && isCanvasBlank(canvas)) {
    const sigContainer = document.querySelector('#signaturePreview')?.closest('.question-container');
    if (sigContainer) {
      sigContainer.classList.add('is-invalid');
      const label = sigContainer.querySelector('label.form-label');
      if (label) label.classList.add('text-danger');
      const error = document.createElement('div');
      error.className = 'invalid-feedback d-block';
      error.textContent = 'This question is required.';
      sigContainer.appendChild(error);
    }

    const modalEl = document.getElementById('signatureModal');
    if (modalEl) {
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.show();
    }

    if (!firstInvalid) firstInvalid = canvas;
    isValid = false;
  }

  if (!isValid && firstInvalid) {
    firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
    firstInvalid.focus({ preventScroll: true });
    return false;
  }

  return true;
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

// ✅ Attach validation + submission to submit button
document.addEventListener('DOMContentLoaded', () => {
  const submitBtn = document.getElementById('scaffCheckFinishBtn');
  if (submitBtn) {
    submitBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const valid = validateFinalStep();
      if (valid) {
        await submitScaffoldInspection();
      }
    });
  } else {
    console.error('❌ Submit button #scaffCheckFinishBtn not found!');
  }
});

export { supabase, submitScaffoldInspection };
