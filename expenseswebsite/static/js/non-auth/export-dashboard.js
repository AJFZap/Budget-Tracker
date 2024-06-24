
document.addEventListener('DOMContentLoaded', (event) => {
    // Handles the export.
    // Retrieve the data from localStorage
    const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    const incomes = JSON.parse(localStorage.getItem('incomes')) || [];

    // Merge and normalize expenses and incomes
    const allEntries = [
        ...expenses.map(item => ({ ...item, db_type: 'Expense', source: item.category })),
        ...incomes.map(item => ({ ...item, db_type: 'Income', source: item.source }))
    ];

    // Sort by date (descending)
    allEntries.sort((a, b) => new Date(b.date) - new Date(a.date));

    console.log(allEntries);

    // Export Modal and Export implementation
    const checkboxes = document.querySelectorAll('input[name="filetype"]');
    const exportButton = document.getElementById('exportButton');

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
         // Get the selected file format
         const selectedFormat = Array.from(checkboxes).find(cb => cb.checked)?.value;

        fetch('export_everything', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'), // CSRF token for security.
            },
            body: JSON.stringify({ allEntries, format: selectedFormat }),
            })
            .then(response => response.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                let date = new Date().toISOString().split('T')[0]
                a.style.display = 'none';
                a.href = url;
                a.download = `BudgetTracker-${date}.${selectedFormat}`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            })
            .catch(error => console.error('Error exporting data:', error));
        });
    
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});