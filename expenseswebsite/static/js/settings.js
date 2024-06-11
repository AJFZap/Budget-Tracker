var deleteModal = document.getElementById('delete-modal');

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