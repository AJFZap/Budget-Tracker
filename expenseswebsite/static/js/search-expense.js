
const SEARCHFIELD = document.getElementById('searchField');
const EXPENSESTABLE = document.getElementById('expensesTable');
const TABLEOUTPUT = document.getElementById('tableOutput');

TABLEOUTPUT.style.display = "none";

const editUrlBase = document.getElementById('url-patterns').dataset.editUrlBase;

// Function to replace the ID placeholder in the URL
function getEditUrl(id) {
    return editUrlBase.replace('0', id);
}

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

SEARCHFIELD.addEventListener('keyup', (e)=>{
    const SEARCHVALUE = e.target.value;

    if (SEARCHVALUE.trim().length > 0) { // The .trim() is to prevent searching for spaces at the start and at the end of the search value.
        
        TABLEOUTPUT.innerHTML = ""; // We clear the table output each time we search for a new thing.

        fetch('search-expense', {
            method:'POST',
            headers:{
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'), // CSRF token for security.
            },
            body:JSON.stringify({searchText: SEARCHVALUE}),
        }).then((res) => res.json()).then((data) => {

            EXPENSESTABLE.style.display = "none"; // Hide the data table with the expenses.
            TABLEOUTPUT.style.display = "block"; // Show the Output table with the search results.

            if (data.length === 0) { // When there are no results.
                TABLEOUTPUT.innerHTML =`
                <div class="container mt-5">
                <div class="row justify-content-center">
                  <div class="col-md-6">
                    <div class="alert alert-warning text-center" role="alert">
                      <strong>No results found!</strong> Your search did not match any expenses.
                    </div>
                  </div>
                </div>
              </div>
              `;
            }
            else {
                const prefCurrency = data[0].currency // Get the user prefered currency.
                data.forEach(element => {
                    TABLEOUTPUT.innerHTML += `
                    <hr class="my-2">
                <div class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${ element.category }</strong><br>
                        <strong>${ element.name }</strong><br>
                        <span class="text-muted">  ${ prefCurrency } ${ element.amount }</span><br>
                        <small>${ element.date }</small><br>
                        <span>${ element.description }</span><br>
                    </div>
                    <div class="row">
                        <div class="col-auto">
                            <a href="${getEditUrl(element.id)}" class="btn btn-primary btn-sm me-2">Edit</a>
                        </div>
                        <div id="deleteButtonContainer" class="col-auto">
                            <button class="btn btn-danger btn-sm" id="openModal" data-bs-target="#delete-modal" data-bs-toggle="modal" value="${ element.id }">Delete</button>
                        </div>
                    </div>
                </div>
            ` });
            }

        }).catch((error) => {
            console.error('Error:', error);
            EXPENSESTABLE.style.display = "none"; // Hide the data table with the expenses.
            TABLEOUTPUT.style.display = "block"; // Show the Output table with the search results.
        });
    }
    else {
        EXPENSESTABLE.style.display = "block"; // Show the data table with the expenses again.
        TABLEOUTPUT.style.display = "none"; // Hide the table output when the search bar is empty.
    }
});
