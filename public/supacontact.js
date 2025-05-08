
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient('https://isgkixzpsjvofwcujgkg.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzZ2tpeHpwc2p2b2Z3Y3VqZ2tnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5NjMyNzgsImV4cCI6MjA1NzUzOTI3OH0.2poprXvbJ44LJI1EXwUPYIMA7lvcCVRSJiPyh19poms');

document.getElementById('contactForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const issue = document.getElementById('contactUsFormBudget').value;
  const firstName = document.getElementById('contactUsFormFirstName').value;
  const lastName = document.getElementById('contactUsFormLasttName').value;
  const email = document.getElementById('contactUsFormWorkEmail').value;
  const policyNumber = document.getElementById('contactUsFormPolicyNumber').value;
  const details = document.getElementById('contactUsFormDetails').value;

  const { data, error } = await supabase
    .from('web-queries')
    .insert([{ issue, first_name: firstName, last_name: lastName, email, policy_number: policyNumber, details }]);

  if (error) {
    alert('There was an error submitting your message.');
    console.error(error);
  } else {
    alert('Thanks for your message! We will get back to you soon.');
    document.getElementById('contactForm').reset();
  }
});
