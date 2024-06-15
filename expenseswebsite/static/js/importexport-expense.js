
// Handles the export.
document.addEventListener('DOMContentLoaded', (event) => {
    const checkboxes = document.querySelectorAll('input[name="filetype"]');
    const exportButton = document.getElementById('exportExpenseButton');
    const exportForm = document.getElementById('exportForm');
    

    // Ensures that only one of the checkboxes is selected at a time and enables the export button when it does.
    checkboxes.forEach((checkbox) => {
        checkbox.addEventListener('change', () => {
            // Uncheck all other checkboxes
            checkboxes.forEach((cb) => {
                if (cb !== checkbox) cb.checked = false;
            });
            // Enable or disable the export button based on if any checkbox is checked
            exportButton.disabled = !Array.from(checkboxes).some(cb => cb.checked);
        });
    });

    // Uncheck all checkboxes when the modal is closed
    document.getElementById('data-modal').addEventListener('hidden.bs.modal', () => {
        checkboxes.forEach((cb) => cb.checked = false);
        exportButton.disabled = true;
    });

    //  Sends the form to the backend.
    exportButton.addEventListener('click', () => {
        exportForm.submit();
    });
});