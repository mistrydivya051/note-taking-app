document.addEventListener('DOMContentLoaded', () => {
  const spinner = document.getElementById('spinnerOverlay');
  const content = document.getElementById('appContent');

  // Show loader only on home page
  if (window.location.pathname === '/' || window.location.pathname === '/home') {
    setTimeout(() => {
      if (spinner && content) {
        spinner.style.display = 'none';
        content.style.display = 'block';
      }
    }, 1200);
  } else {
    if (content) content.style.display = 'block';
    if (spinner) spinner.style.display = 'none';
  }

  console.log('NoteApp loaded');

  // Delete Confirmation Modal
  let deleteForm;
  document.querySelectorAll('.delete-note-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      e.stopPropagation(); 
      deleteForm = form;

      const deleteModalEl = document.getElementById('deleteModal');
      const deleteModal = bootstrap.Modal.getOrCreateInstance(deleteModalEl);
      deleteModal.show();
    });
  });

  document.getElementById('confirmDeleteBtn')?.addEventListener('click', () => {
    if (deleteForm) deleteForm.submit();
  });

  // card click on edit/delete buttons
  document.querySelectorAll('.note-card .btn, .note-card form').forEach(el => {
    el.addEventListener('click', (e) => e.stopPropagation());
  });


  // Add Quill Text Editor
  const quill = new Quill('#editor', {
    theme: 'snow',
    placeholder: 'Write your note here...',
    modules: {
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['blockquote', 'code-block'],
        ['link', 'image'],
        ['clean']
      ]
    }
  });

  // Form submission
  const form = document.querySelector('form');
  form.addEventListener('submit', function () {
    document.getElementById('hiddenContent').value = quill.root.innerHTML;
  });

  // View Note Modal
  const noteModalEl = document.getElementById('noteModal');
  const noteModal = new bootstrap.Modal(noteModalEl);

  document.querySelectorAll('.note-card').forEach(card => {
    card.addEventListener('click', () => {
      document.getElementById('modalTitle').textContent = card.dataset.title;
      document.getElementById('modalContent').innerHTML = card.dataset.content;
      document.getElementById('modalUpdated').textContent = "Last updated: " + card.dataset.updated;
      noteModal.show();
    });
  });

});
