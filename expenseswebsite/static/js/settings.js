var deleteModal = document.getElementById('delete-modal');
var DELETEBUTTON = document.getElementById('deleteButton');

if (document.getElementById('SettingsExist') !== null){

    // When the modal is dismissed then the checkbox will be unchecked if it was previously clicked.
    deleteModal.addEventListener('hidden.bs.modal', function () {
        var confirmCheckbox = document.getElementById('confirmCheckbox');
        confirmCheckbox.checked = false;
        document.getElementById('deleteAccountButton').disabled = true;
    });

    // Checkbox needs to be checked to enable the delete account button.
    document.getElementById('confirmCheckbox').addEventListener('change', function() {
        document.getElementById('deleteAccountButton').disabled = !this.checked;
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
    
    // Update the action of the form to include the item ID
    $('#deleteAccountButton').click(function () {
        var itemId = parseInt(DELETEBUTTON.value);
        $.ajax({
            url: 'delete_user/' + itemId, // URL to the deletion view
            type: 'POST',
            data: {
                'csrfmiddlewaretoken': getCookie('csrftoken'), // CSRF token for security
                'item_id': itemId
            },
            success: function (data) {
                // Handle success response
                window.location = window.location.protocol + "//" + window.location.host + "/authentication/login"
            },
            error: function (xhr, ajaxOptions, thrownError) {
                // Handle error response
                console.log(xhr.status);
                console.log(thrownError);
                window.location.reload();
            }
        });
    });
    }