import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Initialize Supabase client (anon key)
const supabase = createClient(
  'https://pnurgfiznfisngfrzdux.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBudXJnZml6bmZpc25nZnJ6ZHV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5NjMyNTgsImV4cCI6MjA1NzUzOTI1OH0.k492flQe1fpLgLwADDewzl7qxA_PSZsS2O1dyMypKdQ'
);

// Collect all named form inputs from #formContainer
function collectFormData(containerId) {
  const container = document.getElementById(containerId);
  const elements = container.querySelectorAll('input, select, textarea');
  const data = {};

  elements.forEach(el => {
    if (!el.name) return;
    if ((el.type === 'radio' || el.type === 'checkbox') && !el.checked) return;
    data[el.name] = el.value;
  });

  return data;
}

// Submit to Supabase
async function submitScaffoldInspection() {
  const formData = collectFormData('formContainer');
  console.log('Submitting:', formData);

  const { data, error } = await supabase
    .from('scaffold_inspections')
    .insert([formData]);

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
