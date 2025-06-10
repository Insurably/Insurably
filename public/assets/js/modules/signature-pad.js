// signature-pad.js
export function initializeSignaturePad() {
  let canvas, ctx, drawing = false, lastPoint = null;

  // Function to resize canvas for landscape aspect ratio
  function resizeCanvasLandscape() {
    if (!canvas) return; // Ensure canvas exists
    const modalBody = document.querySelector('#signatureModal .modal-body');
    if (!modalBody) {
        console.warn("Modal body for signature pad not found for resizing.");
        return;
    }
    // Set canvas dimensions explicitly for drawing area
    // Using explicit width/height on canvas element, but ensuring JS also knows
    canvas.width = 600; // Match the width from your HTML
    canvas.height = 250; // Match the height from your HTML

    // When resizing, the canvas content is cleared.
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  // Helper to get point coordinates relative to the canvas
  function getPoint(e) {
    if (!canvas) return { x: NaN, y: NaN }; // Return invalid coordinates if canvas is null
    const rect = canvas.getBoundingClientRect();
    let x, y;

    if (e.touches) {
      // For touch events
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      // For mouse events
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }
    return { x, y };
  }

  // Drawing functions
  function startDrawing(e) {
    if (!ctx) { // Ensure context exists
        console.error("Canvas context is null when starting drawing.");
        return;
    }
    drawing = true;
    lastPoint = getPoint(e);
    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
  }

  function stopDrawing() {
    drawing = false;
    lastPoint = null;
    if (ctx) { // Ensure context exists
      ctx.closePath();
    }
  }

  function draw(e) {
    if (!drawing || !ctx) return; // Ensure drawing is active and context exists
    const point = getPoint(e);
    // Check if coordinates are finite numbers before drawing
    if (Number.isFinite(point.x) && Number.isFinite(point.y) &&
        (lastPoint && Number.isFinite(lastPoint.x) && Number.isFinite(lastPoint.y))) { // Added check for lastPoint existence
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
        lastPoint = point; // Update lastPoint only if drawing occurred successfully
    } else {
        console.warn("Invalid coordinates detected, stopping drawing.", point, lastPoint);
        stopDrawing(); // Stop drawing if coordinates are invalid
    }
  }

  // Get references to HTML elements (outside the shown.bs.modal listener for buttons that are always present)
  const signatureModalElement = document.getElementById('signatureModal');
  const clearBtn = document.getElementById('clearSignatureBtn');
  const saveBtn = document.getElementById('saveSignatureBtn');
  const uploadBtn = document.getElementById('uploadSignatureBtn');
  const signatureImageInput = document.getElementById('signatureImageInput');
  const signaturePreview = document.getElementById('signaturePreview');


  if (signatureModalElement) {
    signatureModalElement.addEventListener('shown.bs.modal', function () {
      // CRITICAL FIX: Changed 'signatureCanvas' to 'signaturePadCanvas' to match your HTML
      canvas = document.getElementById('signaturePadCanvas');
      if (!canvas) {
        console.error("Signature canvas not found inside the modal! Check HTML ID.");
        return; // Exit if canvas is not found
      }
      ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error("Failed to get 2D context for canvas!");
        return; // Exit if context cannot be obtained
      }

      // Set canvas drawing properties
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#000';

      resizeCanvasLandscape(); // Set initial size

      // Clear the canvas when the modal is shown
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Event Listeners for drawing
      canvas.addEventListener('mousedown', startDrawing);
      canvas.addEventListener('mouseup', stopDrawing);
      canvas.addEventListener('mousemove', draw);
      canvas.addEventListener('mouseleave', stopDrawing);

      // Touch events for mobile
      canvas.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Prevent scrolling
        startDrawing(e.touches[0]);
      }, { passive: false });
      canvas.addEventListener('touchend', stopDrawing);
      canvas.addEventListener('touchmove', (e) => {
        e.preventDefault(); // Prevent scrolling
        draw(e.touches[0]);
      }, { passive: false });

      // Handle canvas resizing (consider debouncing for performance)
      window.addEventListener('resize', resizeCanvasLandscape);
    });

    // Event listener for when the modal is hidden
    signatureModalElement.addEventListener('hidden.bs.modal', function () {
      // Remove event listeners to prevent memory leaks or multiple bindings
      if (canvas) {
        canvas.removeEventListener('mousedown', startDrawing);
        canvas.removeEventListener('mouseup', stopDrawing);
        canvas.removeEventListener('mousemove', draw);
        canvas.removeEventListener('mouseleave', stopDrawing);
        canvas.removeEventListener('touchstart', startDrawing);
        canvas.removeEventListener('touchend', stopDrawing);
        canvas.removeEventListener('touchmove', draw);
      }
      window.removeEventListener('resize', resizeCanvasLandscape);
      // Clear canvas and context references to avoid stale states
      canvas = null;
      ctx = null;
    });
  } else {
    console.error("Signature modal element with ID 'signatureModal' not found! Signature pad cannot be initialized.");
  }


  // Clear button logic
  if (clearBtn) {
    clearBtn.onclick = function() {
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      if (signaturePreview) {
        signaturePreview.innerHTML = ''; // Clear preview if drawn
      }
      const hiddenInput = document.getElementById('signatureDataInput');
      if (hiddenInput) hiddenInput.value = ''; // Clear hidden input
    };
  } else {
    console.warn("Clear signature button not found!");
  }

  // Save button logic
  if (saveBtn) {
    saveBtn.onclick = function() {
      if (!canvas || !ctx || isCanvasBlank(canvas)) {
        alert('Please draw a signature before saving.');
        return;
      }
      const dataURL = canvas.toDataURL('image/png');
      if (signaturePreview) {
        // Corrected: Removed fixed max-width, relying on img-fluid.
        signaturePreview.innerHTML =
          `<img src="${dataURL}" alt="Signature" class="img-fluid rounded border" style="background: #fff;">`;
      }

      // Set hidden input for form submission
      let hidden = document.getElementById('signatureDataInput');
      if (!hidden) {
        hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.name = 'signatureData';
        hidden.id = 'signatureDataInput';
        document.querySelector('form').appendChild(hidden); // Append to the main form
      }
      hidden.value = dataURL;

      // Optionally close modal
      const modal = bootstrap.Modal.getInstance(signatureModalElement);
      if (modal) modal.hide();
    };
  } else {
    console.warn("Save signature button not found!");
  }

  // Check if canvas is blank
  function isCanvasBlank(canvas) {
    if (!canvas || !ctx) return true;
    const blank = document.createElement('canvas');
    blank.width = canvas.width;
    blank.height = canvas.height;
    // Check if the canvas is empty by comparing its data URL to a blank canvas's data URL
    return canvas.toDataURL() === blank.toDataURL();
  }

  // Upload signature image logic
  if (uploadBtn) {
    uploadBtn.onclick = function() {
      if (signatureImageInput) {
        signatureImageInput.click();
      } else {
        console.warn("Signature image input element not found for upload button click.");
      }
    };
  } else {
    console.warn("Upload signature button not found!");
  }

  if (signatureImageInput) {
    signatureImageInput.onchange = function(e) {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(evt) {
        if (signaturePreview) {
            // Corrected: Removed fixed max-width, relying on img-fluid.
            signaturePreview.innerHTML =
              `<img src="${evt.target.result}" alt="Signature" class="img-fluid rounded border" style="background: #fff;">`;
        }
        let hidden = document.getElementById('signatureDataInput');
        if (!hidden) {
          hidden = document.createElement('input');
          hidden.type = 'hidden';
          hidden.name = 'signatureData';
          hidden.id = 'signatureDataInput';
          document.querySelector('form').appendChild(hidden);
        }
        hidden.value = evt.target.result;
        // Optionally close modal
        const modal = bootstrap.Modal.getInstance(signatureModalElement);
        if (modal) modal.hide();
      };
      reader.readAsDataURL(file);
    };
  } else {
    console.warn("Signature image input element not found!");
  }
}