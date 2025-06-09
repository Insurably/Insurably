// photoPreview.js

export function initializeAllPhotoPreviews() {
  const photoInputs = document.querySelectorAll('input[type="file"][name^="photo"]');

  photoInputs.forEach(input => {
    const inputId = input.id;
    const previewId = inputId.replace("photo", "photoPreview");
    const preview = document.getElementById(previewId);

    if (!preview) return;

    input.addEventListener('change', function () {
      const file = this.files[0];
      if (!file || !file.type.startsWith("image/")) {
        preview.classList.add("d-none");
        preview.src = "";
        return;
      }

      const reader = new FileReader();
      reader.onload = function (e) {
        preview.src = e.target.result;
        preview.classList.remove("d-none");
      };
      reader.readAsDataURL(file);
    });
  });
}
