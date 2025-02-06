    import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

    const supabaseUrl = 'https://pnurgfiznfisngfrzdux.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBudXJnZml6bmZpc25nZnJ6ZHV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIzNTI1MDAsImV4cCI6MjA0NzkyODUwMH0.ZW2CeMYcM-Zq2byRGlZ3cfhDaSdGss5WFBXq86ymM6Y';
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const dropzones = [
      { elementId: 'resumeAttach', bucketFolder: 'photos', bucketName: 'showcase' },
      { elementId: 'businessLogoAttach', bucketFolder: 'logo', bucketName: 'showcase' },
      { elementId: 'policyScheduleAttach', bucketFolder: 'schedules', bucketName: 'schedules' }
    ];

    const filesToUpload = { resumeAttach: [], businessLogoAttach: [], policyScheduleAttach: [] };

    // Global variables for URLs
    let logoUrl = "";
    let scheduleUrl = "";
    let photoUrls = []; // Array to store URLs of all uploaded photos

    async function getNextCustomerId() {
      // Get the latest customer ID and increment it for the next record
      const { data, error } = await supabase
        .from('SureLocal')
        .select('id')
        .order('id', { ascending: false })
        .limit(1);

      if (error || !data || data.length === 0) {
        console.error("Failed to fetch customer ID:", error);
        alert("Unable to fetch customer ID. Please try again.");
        return null;
      }

      // Increment the ID to get the next one
      return data[0].id + 1;
    }

    async function initializeDropzone({ elementId, bucketFolder, bucketName }) {
      const customerId = await getNextCustomerId();

      if (!customerId) {
        console.error("Customer ID is missing.");
        return;
      }

      const dropzone = new Dropzone(`#${elementId}`, {
        url: '#', // Not used but required by Dropzone
        maxFilesize: elementId === 'policyScheduleAttach' ? 5 : 2,
        acceptedFiles: elementId === 'policyScheduleAttach' ? 'application/pdf' : 'image/jpeg, image/png, image/gif',
        maxFiles: elementId === 'policyScheduleAttach' ? 1 : elementId === 'resumeAttach' ? 10 : 1,
        autoProcessQueue: false,
        thumbnailWidth: 120,
        thumbnailHeight: 120,
        init: function () {
          this.on('addedfile', async function (file) {
            const allowedTypes = elementId === 'policyScheduleAttach' ? ['application/pdf'] : ['image/jpeg', 'image/png', 'image/gif'];

            if (!allowedTypes.includes(file.type)) {
              this.removeFile(file);
              return;
            }

            if ((elementId === 'businessLogoAttach' || elementId === 'policyScheduleAttach') && this.files.length > 1) {
              this.removeFile(file);
              return;
            }

            const removeButton = Dropzone.createElement('<button class="dz-remove">&times;</button>');
            removeButton.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              this.removeFile(file);
              filesToUpload[elementId] = filesToUpload[elementId].filter(f => f.file !== file);
            });

            file.previewElement.style.position = 'relative';
            file.previewElement.style.width = '120px';
            file.previewElement.style.height = '120px';
            file.previewElement.style.overflow = 'hidden';
            file.previewElement.style.boxSizing = 'border-box';
            file.previewElement.appendChild(removeButton);

            filesToUpload[elementId].push({ file, bucketFolder });

            // Upload files to the appropriate folder in the specified bucket
            const timestamp = Date.now();
            const uniqueFileName = `${bucketFolder}/${customerId}/item-${timestamp}-${file.name}`;

            const { data, error } = await supabase.storage
              .from(bucketName)
              .upload(uniqueFileName, file, {
                cacheControl: '3600',
                upsert: false
              });

            if (error) {
              console.error(`Error uploading file to ${bucketFolder}:`, error.message);
              alert(`Failed to upload ${file.name}.`);
            } else {
              console.log(`File uploaded to ${bucketFolder}:`, uniqueFileName);

              if (elementId === 'businessLogoAttach') {
                logoUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${uniqueFileName}`;
                console.log("Logo URL:", logoUrl);
              } else if (elementId === 'policyScheduleAttach') {
                scheduleUrl = uniqueFileName; // Capturing only the relative file path
                console.log("Schedule Path:", scheduleUrl);
              } else if (elementId === 'resumeAttach') {
                const photoUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${uniqueFileName}`;
                photoUrls.push(photoUrl); // Add the photo URL to the array
                console.log("Photo URL added:", photoUrl);
              }
            }
          });
        }
      });
    }

    dropzones.forEach(initializeDropzone);

    async function getCoordinatesFromPostcode(postcode) {
      try {
        const response = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`);
        const data = await response.json();

        if (data.status === 200) {
          return {
            longitude: data.result.longitude,
            latitude: data.result.latitude
          };
        } else {
          console.error(`Failed to fetch coordinates for postcode ${postcode}:`, data.error);
          alert(`Failed to fetch coordinates for postcode ${postcode}.`);
          return null;
        }
      } catch (error) {
        console.error("Error fetching postcode coordinates:", error);
        alert("An error occurred while fetching postcode coordinates. Please try again.");
        return null;
      }
    }

    document.addEventListener("DOMContentLoaded", function () {
      const submitButton = document.getElementById("uploadResumeFinishBtn");

      if (!submitButton) {
        console.error("Submit button not found on the page.");
        return;
      }

      submitButton.addEventListener("click", async function (event) {
        event.preventDefault();

        // Capture all links into an array
        const website_links = [];
        const linkFields = document.querySelectorAll('[data-name="links"]');
        linkFields.forEach((field) => {
          if (field.value.trim()) {
            const sanitizedValue = field.value.trim().replace(/<[^>]*>?/gm, "");
            website_links.push(sanitizedValue);
          }
        });

        // Capture all selected trades and qualifications
        const tradeSelect = document.querySelector(".js-select-trades");
        const qualificationSelect = document.querySelector(
          ".js-select-qualifications"
        );

        const selectedTrades = tradeSelect
          ? Array.from(tradeSelect.selectedOptions).map((option) => option.text)
          : [];
        const selectedQualifications = qualificationSelect
          ? Array.from(qualificationSelect.selectedOptions).map(
              (option) => option.text
            )
          : [];

        // Capture the description from the Quill editor
        const quillElement = document.querySelector(".js-quill .ql-editor");
        const description = quillElement ? quillElement.innerHTML : "";

        // Get coordinates from postcode
        const postcode = document.getElementById('postcode').value;
        const coordinates = await getCoordinatesFromPostcode(postcode);

        if (!coordinates) {
          console.error("Coordinates not found for postcode:", postcode);
          return;
        }

        // Collect form data
        const formData = {
          first_name: document.getElementById('firstNameLabel').value,
          last_name: document.getElementById('lastNameLabel').value,
          business_name: document.getElementById('businessNameLabel').value,
          year_established: document.getElementById('yearEst').value,
          postcode: postcode,
          legal_status: document.querySelector('input[name="statusRadioName"]:checked')?.value || '',
          email: document.getElementById('contactInformationLabel').value,
          phone_number: document.getElementById('phoneLabel').value,
          phone_type: document.querySelector('select[name="phoneSelect"]').value,
          number_display: document.getElementById('callPermissionCheckbox').checked,
          links: website_links,
          trades: selectedTrades,
          qualifications: selectedQualifications,
          years_of_experience: document.getElementById('yearsOfExperienceLabel').value,
          description: description,
          quote: document.getElementById("quotePermissionCheckbox").checked,
          public_liability: document.getElementById("publicLiabilityLabel").value,
          product_liability: document.getElementById("productLiabilityLabel").value,
          professional_indemnity: document.getElementById("professionalIndemnityLabel").value,
          logo: logoUrl,
          insurance_schedule: scheduleUrl,
          photos: photoUrls, // Store the photo URLs array
          longitude: coordinates.longitude, // Add longitude to form data
          latitude: coordinates.latitude // Add latitude to form data
        };

        console.log("Form Data:", formData);

        try {
          const { data, error } = await supabase
            .from("SureLocal") // Replace with your table name
            .insert([formData]);

          if (error) {
            console.error("Database error:", error.message);
            alert(`Failed to save data: ${error.message}`);
          } else {
            alert("File uploaded and data saved successfully!");
            document.querySelector("form")?.reset(); // Reset the form after success
          }
        } catch (error) {
          console.error("Unexpected error:", error);
          alert("An unexpected error occurred. Please try again.");
        }
      });
    });