function initializeSignaturePad() {
  const openBtn = document.getElementById('openSignatureModal');
  const modal = document.getElementById('signatureModal');
  const canvas = document.getElementById('signatureCanvas');
  const saveBtn = document.getElementById('saveSignature');
  const cancelBtn = document.getElementById('cancelSignature');
  const clearBtn = document.getElementById('clearSignature');
  const previewImg = document.getElementById('signaturePreview');
  const uploadInput = document.getElementById('signatureUpload');
  const signatureField = document.getElementById('signatureData');

  if (!canvas || !modal || !openBtn || !saveBtn || !cancelBtn || !clearBtn) {
    console.warn("Signature modal elements not found.");
    return;
  }

  const ctx = canvas.getContext('2d');
  let drawing = false, lastX = 0, lastY = 0;

  function resizeCanvas() {
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const width = window.innerWidth;
    const height = window.innerHeight - 200;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(ratio, ratio);
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, width, height);
  }

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.touches?.[0]?.clientX || e.clientX) - rect.left;
    const y = (e.touches?.[0]?.clientY || e.clientY) - rect.top;
    return { x, y };
  }

  function startDraw(e) {
    drawing = true;
    const pos = getPos(e);
    lastX = pos.x;
    lastY = pos.y;
    e.preventDefault();
  }

  function draw(e) {
    if (!drawing) return;
    const pos = getPos(e);
    ctx.strokeStyle = "#222";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastX = pos.x;
    lastY = pos.y;
    e.preventDefault();
  }

  function endDraw(e) {
    drawing = false;
    e?.preventDefault();
  }

  canvas.addEventListener('mousedown', startDraw);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', endDraw);
  canvas.addEventListener('mouseleave', endDraw);
  canvas.addEventListener('touchstart', startDraw, { passive: false });
  canvas.addEventListener('touchmove', draw, { passive: false });
  canvas.addEventListener('touchend', endDraw);

  clearBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    resizeCanvas();
  });

  cancelBtn.addEventListener('click', () => {
    modal.classList.add('d-none');
    document.body.classList.remove('overflow-hidden');
  });

  saveBtn.addEventListener('click', () => {
    const dataURL = canvas.toDataURL();
    signatureField.value = dataURL;
    previewImg.src = dataURL;
    previewImg.classList.remove('d-none');
    modal.classList.add('d-none');
    document.body.classList.remove('overflow-hidden');
  });

  uploadInput?.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (evt) {
      const img = evt.target.result;
      signatureField.value = img;
      previewImg.src = img;
      previewImg.classList.remove('d-none');
    };
    reader.readAsDataURL(file);
  });

  openBtn.addEventListener('click', () => {
    modal.classList.remove('d-none');
    document.body.classList.add('overflow-hidden');
    resizeCanvas();

    // ✅ Prevent mobile keyboard from opening
    setTimeout(() => {
      if (document.activeElement && typeof document.activeElement.blur === 'function') {
        document.activeElement.blur();
      }
    }, 100);
  });

  window.addEventListener('resize', () => {
    if (!modal.classList.contains('d-none')) {
      resizeCanvas();
    }
  });
}

// Make available globally
window.initializeSignaturePad = initializeSignaturePad;
