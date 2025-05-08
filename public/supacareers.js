
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient('https://isgkixzpsjvofwcujgkg.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzZ2tpeHpwc2p2b2Z3Y3VqZ2tnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5NjMyNzgsImV4cCI6MjA1NzUzOTI3OH0.2poprXvbJ44LJI1EXwUPYIMA7lvcCVRSJiPyh19poms');

document.getElementById('careersForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const fullName = document.getElementById('fullNameCareersForm').value;
  const email = document.getElementById('emailCareersForm').value;
  const phone = document.getElementById('phoneCareersForm').value;
  const company = document.getElementById('currentCompanyCareersForm').value;
  const linkedin = document.getElementById('linkedinURLCareersForm').value;
  const twitter = document.getElementById('twitterURLCareersForm').value;
  const github = document.getElementById('githubURLCareersForm').value;
  const portfolio = document.getElementById('portfolioURLCareersForm').value;
  const otherWebsite = document.getElementById('otherWebsiteCareersForm').value;
  const salary = document.getElementById('desiredSalaryCareersForm').value;
  const startDate = document.getElementById('availableStartDateCareersForm').value;
  const additional = document.getElementById('additionalInfoCareersForm').value;
  const resumeFile = document.getElementById('resumeCVCareersForm').files[0];

  if (!resumeFile || !resumeFile.name.toLowerCase().endsWith('.pdf')) {
    alert('Please upload a PDF file only.');
    return;
  }

  // Clean file path
  const filePath = `${Date.now()}_${resumeFile.name}`;

  const { error: uploadError } = await supabase
    .storage
    .from('cv-uploads')
    .upload(filePath, resumeFile, {
      cacheControl: '3600',
      upsert: false,
      contentType: 'application/pdf'
    });

  if (uploadError) {
    console.error(uploadError);
    alert('File upload failed.');
    return;
  }

  const { data, error } = await supabase
    .from('careers')
    .insert([{ 
      full_name: fullName,
      email,
      phone,
      current_company: company,
      linkedin_url: linkedin,
      twitter_url: twitter,
      github_url: github,
      portfolio_url: portfolio,
      other_website: otherWebsite,
      desired_salary: salary,
      available_start_date: startDate,
      additional_info: additional,
      resume_path: filePath
    }]);

  if (error) {
    console.error(error);
    alert('Submission failed.');
  } else {
    alert('Application submitted successfully.');
    document.getElementById('careersForm').reset();
  }
});
