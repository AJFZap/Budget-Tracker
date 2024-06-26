
document.addEventListener('DOMContentLoaded', () => {
    // Retrieve incomes from localStorage
    const incomes = JSON.parse(localStorage.getItem('incomes')) || [];

    // Retrieve preferences from localStorage
    const preferences = JSON.parse(localStorage.getItem('preferences'));
    const prefCurrency = preferences.currency.substring(0, 4);
    
    const SEARCHFIELD = document.getElementById('searchField');
    const INCOMESTABLE = document.getElementById('incomeTable');
    const TABLEOUTPUT = document.getElementById('tableOutput');

    TABLEOUTPUT.style.display = "none";

    // Function to render incomes
    function renderIncomes(incomes) {
        TABLEOUTPUT.innerHTML = ""; // Clear previous results
        if (incomes.length === 0) {
            TABLEOUTPUT.innerHTML = `
                <div class="container mt-5">
                    <div class="row justify-content-center">
                        <div class="col-md-6">
                            <div class="alert alert-warning text-center" role="alert">
                                <strong>No results found!</strong> Your search did not match any income.
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            incomes.forEach(income => {
                TABLEOUTPUT.innerHTML += `
                    <hr class="my-2">
                    <div class="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <strong>${income.source}</strong><br>
                            <strong>${income.name}</strong><br>
                            <span class="text-muted">${prefCurrency} ${income.amount}</span><br>
                            <small>${income.date}</small><br>
                            <span>${income.description}</span><br>
                        </div>
                        <div class="row">
                            <div class="col-auto">
                                <a href="edit-income/${income.id}" class="btn btn-primary btn-sm me-2">Edit</a>
                            </div>
                            <div id="deleteButtonContainer" class="col-auto">
                                <button class="btn btn-danger btn-sm delete-btn" data-id="${income.id}" data-bs-target="#delete-modal" data-bs-toggle="modal">Delete</button>
                            </div>
                        </div>
                    </div>
                `;
            });
            // Attach event listeners to the new buttons
            document.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', function () {
                    const incomeId = button.getAttribute('data-id');
                    const deleteIncomeButton = document.querySelector('#deleteIncomeButton');
                    deleteIncomeButton.setAttribute('data-id', incomeId);
                });
            });

            // Set up event listener for the final delete button inside the modal
            const deleteIncomeButton = document.querySelector('#deleteIncomeButton');
            deleteIncomeButton.removeEventListener('click', searchDelete); // Ensure previous listeners are removed
            deleteIncomeButton.addEventListener('click', searchDelete);
        }
    }
    // Add event listener for the search field
    SEARCHFIELD.addEventListener('keyup', (e) => {
        const SEARCHVALUE = e.target.value.trim().toLowerCase();
        const incomes = JSON.parse(localStorage.getItem('incomes')) || [];

        if (SEARCHVALUE.length > 0) {
            const filteredIncomes = incomes.filter(income =>
                income.amount.toString().startsWith(SEARCHVALUE) ||
                income.date.toLowerCase().startsWith(SEARCHVALUE) ||
                income.description.toLowerCase().includes(SEARCHVALUE) ||
                income.name.toLowerCase().includes(SEARCHVALUE) ||
                income.source.toLowerCase().startsWith(SEARCHVALUE)
            );

            INCOMESTABLE.style.display = "none"; // Hide the original income table
            TABLEOUTPUT.style.display = "block"; // Show the search results table
            renderIncomes(filteredIncomes); // Render the filtered results
        } else {
            INCOMESTABLE.style.display = "block"; // Show the original income table
            TABLEOUTPUT.style.display = "none"; // Hide the search results table
        }
    });

    // Handle the case where the delete button is clicked
    function searchDelete() {
        const incomeId = parseInt(this.getAttribute('data-id'));
        // console.log(`Deleting income with id: ${incomeId}`);
        
        // Find the income by ID and remove it
        const incomeIndex = incomes.findIndex(income => income.id === incomeId);

        if (incomeIndex !== -1) {
            incomes.splice(incomeIndex, 1);
            localStorage.setItem('incomes', JSON.stringify(incomes));
            location.reload(); // Reload the page to update the incomes list
        }
    }
});