function initializeSignaturePad() {
  const canvas = document.getElementById('signaturePad');
  if (!canvas) {
    console.warn("Signature pad canvas not found.");
    return;
  }

  const ctx = canvas.getContext('2d');
  let drawing = false, lastX = 0, lastY = 0;

  function resizeCanvas() {
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const width = canvas.offsetWidth;
    const height = 150;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(ratio, ratio);
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, width, height);
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

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
    const signatureField = document.getElementById('signatureData');
    if (signatureField) signatureField.value = canvas.toDataURL();
    e?.preventDefault();
  }

  canvas.addEventListener('mousedown', startDraw);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', endDraw);
  canvas.addEventListener('mouseleave', endDraw);
  canvas.addEventListener('touchstart', startDraw);
  canvas.addEventListener('touchmove', draw);
  canvas.addEventListener('touchend', endDraw);

  document.getElementById('clearSignatureBtn')?.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    resizeCanvas();
    const signatureField = document.getElementById('signatureData');
    if (signatureField) signatureField.value = '';
  });

  const uploadInput = document.getElementById('signatureUpload');
  const previewImg = document.getElementById('signaturePreview');

  uploadInput?.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (evt) {
      if (previewImg) {
        previewImg.src = evt.target.result;
        previewImg.classList.remove('d-none');
      }
      const signatureField = document.getElementById('signatureData');
      if (signatureField) signatureField.value = evt.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// Make available globally
window.initializeSignaturePad = initializeSignaturePad;
