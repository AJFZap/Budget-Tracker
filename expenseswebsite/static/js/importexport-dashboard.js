document.addEventListener('DOMContentLoaded', (event) => {
    // Handles the export.
    // Export Modal and Export implementation
    const checkboxes = document.querySelectorAll('input[name="filetype"]');
    const exportButton = document.getElementById('exportButton');
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

    // Get cookie from django:
    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // If the cookie string begins with the name we want.
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    // Import Modal and Import implementation
    $('#importIncomeButton').on('click', function() {
        var formData = new FormData();
        var file = $('#fileInput')[0].files[0];
        var deletePrevious = $('#confirmCheckbox').is(':checked');
        
        // If no file has been selected.
        if (!file) {
            alert("Please select a file to upload.");
            return;
        }

        // console.log(file);
        // console.log(deletePrevious);

        formData.append('file', file);
        formData.append('delete_previous', deletePrevious);

        $.ajax({
            url: 'import_everything',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            headers: {
                'X-CSRFToken': getCookie('csrftoken'), // CSRF token for security
            },
            success: function(response) {
                // alert("Expenses imported successfully!");
                $('#import-modal').modal('hide');
                window.location.reload();
            },
            error: function(response) {
                // alert("An error occurred while importing expenses.");
                window.location.reload();
            }
        });
    });

    // When the modal is closed the checkbox is unchecked and the file select is back to being empty.
    $('#import-modal').on('hidden.bs.modal', function () {
        $('#confirmCheckbox').prop('checked', false);
        $('#fileInput').val('');
    });
});