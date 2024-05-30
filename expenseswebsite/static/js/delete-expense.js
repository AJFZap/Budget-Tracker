CSRF_TOKEN = '{{ csrf_token }}'

const MODAL = document.getElementById('delete-modal');
const DELETEBUTTON = document.getElementById('deleteExpenseButton');

// select all the buttons with the parent ID of deleteButtonContainer
const buttons = document.querySelectorAll('#deleteButtonContainer > button');

// loop through each button and add a click event listener
buttons.forEach(function(button) {
  button.addEventListener("click", function() {
        
        // We pass the value of the button that it's the ID of the script that we want to delete.
        DELETEBUTTON.value= button.value;
  });
});

 // Get cookie from django:
function getCookie(name) {
  var cookieValue = null;
  if (document.cookie && document.cookie !== '') {
      var cookies = document.cookie.split(';');
      for (var i = 0; i < cookies.length; i++) {
          var cookie = jQuery.trim(cookies[i]);
          // Does this cookie string begin with the name we want?
          if (cookie.substring(0, name.length + 1) === (name + '=')) {
              cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
              break;
          }
      }
  }
  return cookieValue;
}

  // Update the action of the form to include the item ID
$('#deleteExpenseButton').click(function () {
    var itemId = parseInt(DELETEBUTTON.value);
    $.ajax({
        url: 'delete/' + itemId, // URL to your deletion view
        type: 'POST',
        data: {
            'csrfmiddlewaretoken': getCookie('csrftoken'), // CSRF token for security
            'item_id': itemId
        },
        success: function (data) {
            // Handle success response
            window.location.reload();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            // Handle error response
            console.log(xhr.status);
            console.log(thrownError);
            window.location.reload();
        }
    });
});