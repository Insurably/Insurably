document.addEventListener("DOMContentLoaded", function () {  
    // Dynamically load Header
    fetch("header.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("header-placeholder").innerHTML = data;
            initializePageComponents();
        })
        .catch(error => console.error("Error loading header:", error));

    // Dynamically load Footer
    fetch("footer.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("footer-placeholder").innerHTML = data;
        })
        .catch(error => console.error("Error loading footer:", error));

    function initializePageComponents() {
        // INITIALIZATION OF MEGA MENU
        new HSMegaMenu('.js-mega-menu', {
            desktop: { position: 'left' }
        });

        // INITIALIZATION OF SHOW ANIMATIONS
        new HSShowAnimation('.js-animation-link');

        // INITIALIZATION OF BOOTSTRAP DROPDOWN
        HSBsDropdown.init();

        // INITIALIZATION OF GO TO
        new HSGoTo('.js-go-to');

        // INITIALIZATION OF STICKY BLOCKS
        new HSStickyBlock('.js-sticky-block', {
            targetSelector: (document.getElementById('header') &&
                document.getElementById('header').classList.contains('navbar-fixed'))
                ? '#header'
                : null
        });

        // INITIALIZATION OF STEP FORM (Ensuring Proper Execution Order)
        setTimeout(() => {
            const stepForm = new HSStepForm('.js-step-form', {
                onNextStep: () => {
                    setTimeout(updateProgress, 100); // Delay update to ensure transition completes
                },
                onPrevStep: () => {
                    setTimeout(updateProgress, 100);
                },
                finish: () => {
                    console.log("Form finished, displaying success message."); // Debugging log
                
                    // Hide all step cards
                    document.querySelectorAll('#quoteStepFormContent .card').forEach(card => {
                        card.style.display = 'none';
                    });
                
                    // Hide the left column with the step progress (Large Screens Only)
                    const stepProgressColumn = document.querySelector('.col-lg-4.d-none.d-lg-block');
                    if (stepProgressColumn) {
                        stepProgressColumn.style.display = 'none';
                    }
                
                    // Hide the step index (progress list)
                    const stepIndex = document.getElementById("quoteStepFormProgress");
                    if (stepIndex) {
                        stepIndex.style.display = 'none';
                    }
                
                    // Hide the progress bar (Small Screens) - COMPLETELY REMOVE SPACE
                    const progressBarContainer = document.querySelector('.progress');
                    if (progressBarContainer) {
                        progressBarContainer.style.display = 'none'; // Ensures no space is left
                    }
                
                    // Ensure the form container takes the full width
                    const formContainer = document.getElementById('formContainer');
                    if (formContainer) {
                        formContainer.classList.remove('col-lg-8');
                        formContainer.classList.add('col-lg-12');
                    }
                
                    // Show the success message
                    const successMessage = document.getElementById("successMessageContent");
                    if (successMessage) {
                        successMessage.style.display = 'block';
                    } else {
                        console.error("Success message content not found!"); // Debugging log
                    }
                
                    // Scroll to top to ensure success message is visible
                    setTimeout(() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }, 300);
                }                              
                
                                             
            });

            setTimeout(updateProgress, 300); // Final delay to ensure step detection works
        }, 500); // Allow step form to fully initialize

        // Auto-advance when selecting an insurance type and update both Step 2 and Step 3 question containers
        const insuranceRadios = document.querySelectorAll('input[name="insuranceType"]');
        insuranceRadios.forEach(function (radio) {
            radio.addEventListener('change', function (e) {
                // Update Step 2 question containers
                const businessQuestions = document.getElementById("BusinessQuestions");
                const landlordQuestions = document.getElementById("LandlordQuestions");
                const homeQuestions = document.getElementById("HomeQuestions");

                // Hide all Step 2 question containers first
                if (businessQuestions) businessQuestions.style.display = "none";
                if (landlordQuestions) landlordQuestions.style.display = "none";
                if (homeQuestions) homeQuestions.style.display = "none";

                // Get the selected insurance type (e.g., "Business", "Landlord", or "Home")
                const selectedType = e.target.value;
                // Show only the corresponding container for Step 2
                if (selectedType === "Business" && businessQuestions) {
                    businessQuestions.style.display = "block";  // Change to "flex" if your layout requires it
                } else if (selectedType === "Landlord" && landlordQuestions) {
                    landlordQuestions.style.display = "block";
                } else if (selectedType === "Home" && homeQuestions) {
                    homeQuestions.style.display = "block";
                }

                // Update Step 3 question containers
                const businessQuestions2 = document.getElementById("BusinessQuestions2");
                const landlordQuestions2 = document.getElementById("LandlordQuestions2");
                const homeQuestions2 = document.getElementById("HomeQuestions2");

                // Hide all Step 3 question containers first
                if (businessQuestions2) businessQuestions2.style.display = "none";
                if (landlordQuestions2) landlordQuestions2.style.display = "none";
                if (homeQuestions2) homeQuestions2.style.display = "none";

                // Show only the corresponding container for Step 3
                if (selectedType === "Business" && businessQuestions2) {
                    businessQuestions2.style.display = "block";  // Use "flex" if needed
                } else if (selectedType === "Landlord" && landlordQuestions2) {
                    landlordQuestions2.style.display = "block";
                } else if (selectedType === "Home" && homeQuestions2) {
                    homeQuestions2.style.display = "block";
                }

                // Auto-advance to the next step
                const autoNextButton = document.getElementById('autoStepNext');
                if (autoNextButton) {
                    autoNextButton.click();
                    setTimeout(updateProgress, 500); // Delay to ensure step transition
                }
            });
        });

        // Function to update the progress bar based on the active step
        function updateProgress(forcedValue = null) {
            const progressBar = document.getElementById('quoteProgressBar');
        
            let progressPercentage = 0;
            if (forcedValue !== null) {
                progressPercentage = forcedValue;
            } else {
                const stepElements = document.querySelectorAll('#quoteStepFormContent > div');
                let currentStepIndex = 0;
        
                stepElements.forEach((step, index) => {
                    if (window.getComputedStyle(step).display !== 'none') {
                        currentStepIndex = index + 1;
                    }
                });
        
                // Set progress percentage based on the step number
                if (currentStepIndex === 1) {
                    progressPercentage = 33;
                } else if (currentStepIndex === 2) {
                    progressPercentage = 75;
                } else if (currentStepIndex === 3) {
                    progressPercentage = 95;
                }
            }
        
            // Check if success message is visible and set progress to 100%
            const successMessage = document.getElementById("successMessageContent");
            if (successMessage && successMessage.style.display === "block") {
                progressPercentage = 100;
            }
        
            console.log(`Updating progress: ${progressPercentage}%`);
        
            if (progressBar) {
                progressBar.style.width = `${progressPercentage}%`;
                progressBar.setAttribute('aria-valuenow', progressPercentage);
            }
        }                

        // Scroll to top when navigating between steps
        function scrollToTop(el = '.js-step-form') {
            const element = document.querySelector(el);
            if (element) {
                window.scrollTo({
                    top: (element.getBoundingClientRect().top + window.scrollY) - 30,
                    left: 0,
                    behavior: 'smooth'
                });
            }
        }

        // Ensure progress bar updates initially
        setTimeout(updateProgress, 1000); // Wait for step detection
    }
});
