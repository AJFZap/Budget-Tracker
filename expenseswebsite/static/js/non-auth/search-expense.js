
document.addEventListener('DOMContentLoaded', () => {
    // Retrieve expenses from localStorage
    const expenses = JSON.parse(localStorage.getItem('expenses')) || [];

    // Retrieve preferences from localStorage
    const preferences = JSON.parse(localStorage.getItem('preferences'));
    const prefCurrency = preferences.currency.substring(0, 4);
    const prefLanguage = preferences.language;
    
    const SEARCHFIELD = document.getElementById('searchField');
    const EXPENSESTABLE = document.getElementById('expensesTable');
    const TABLEOUTPUT = document.getElementById('tableOutput');

    TABLEOUTPUT.style.display = "none";

    // Function to render expenses
    function renderExpenses(expenses) {
        TABLEOUTPUT.innerHTML = ""; // Clear previous results
        if (expenses.length === 0) {
            // Nationalization.
            if (prefLanguage == 'es') {
                TABLEOUTPUT.innerHTML = `
                <div class="container mt-5">
                    <div class="row justify-content-center">
                        <div class="col-md-6">
                            <div class="alert alert-warning text-center" role="alert">
                                <strong>¡No se han encontrado resultados!</strong> Su búsqueda no coincide con ningún gasto.
                            </div>
                        </div>
                    </div>
                </div>
            `;
            }
            else if (prefLanguage == 'ja') {
                TABLEOUTPUT.innerHTML = `
                <div class="container mt-5">
                    <div class="row justify-content-center">
                        <div class="col-md-6">
                            <div class="alert alert-warning text-center" role="alert">
                                <strong>結果が見つかりません！</strong> 検索に一致する費用が見つかりませんでした。
                            </div>
                        </div>
                    </div>
                </div>
            `;
            }
            else {
                TABLEOUTPUT.innerHTML = `
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
        } else {
            expenses.forEach(expense => {
                // Nationalization.
                if (prefLanguage == 'es') {
                    TABLEOUTPUT.innerHTML += `
                    <hr class="my-2">
                    <div class="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <strong>${expense.category_es}</strong><br>
                            <strong>${expense.name}</strong><br>
                            <span class="text-muted">${prefCurrency} ${expense.amount}</span><br>
                            <small>${expense.date}</small><br>
                            <span>${expense.description}</span><br>
                        </div>
                        <div class="row">
                            <div class="col-auto">
                                <a href="edit-expense/${expense.id}" class="btn btn-primary btn-sm me-2">Editar</a>
                            </div>
                            <div id="deleteButtonContainer" class="col-auto">
                                <button class="btn btn-danger btn-sm delete-btn" data-id="${expense.id}" data-bs-target="#delete-modal" data-bs-toggle="modal">Eliminar</button>
                            </div>
                        </div>
                    </div>
                `;
                }
                else if (prefLanguage == 'ja'){
                    TABLEOUTPUT.innerHTML += `
                    <hr class="my-2">
                    <div class="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <strong>${expense.category_ja}</strong><br>
                            <strong>${expense.name}</strong><br>
                            <span class="text-muted">${prefCurrency} ${expense.amount}</span><br>
                            <small>${expense.date}</small><br>
                            <span>${expense.description}</span><br>
                        </div>
                        <div class="row">
                            <div class="col-auto">
                                <a href="edit-expense/${expense.id}" class="btn btn-primary btn-sm me-2">編集</a>
                            </div>
                            <div id="deleteButtonContainer" class="col-auto">
                                <button class="btn btn-danger btn-sm delete-btn" data-id="${expense.id}" data-bs-target="#delete-modal" data-bs-toggle="modal">削除</button>
                            </div>
                        </div>
                    </div>
                `;
                }
                else {
                    TABLEOUTPUT.innerHTML += `
                    <hr class="my-2">
                    <div class="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <strong>${expense.category}</strong><br>
                            <strong>${expense.name}</strong><br>
                            <span class="text-muted">${prefCurrency} ${expense.amount}</span><br>
                            <small>${expense.date}</small><br>
                            <span>${expense.description}</span><br>
                        </div>
                        <div class="row">
                            <div class="col-auto">
                                <a href="edit-expense/${expense.id}" class="btn btn-primary btn-sm me-2">Edit</a>
                            </div>
                            <div id="deleteButtonContainer" class="col-auto">
                                <button class="btn btn-danger btn-sm delete-btn" data-id="${expense.id}" data-bs-target="#delete-modal" data-bs-toggle="modal">Delete</button>
                            </div>
                        </div>
                    </div>
                `;
                }
            });
            // Attach event listeners to the new buttons
            document.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', function () {
                    const expenseId = button.getAttribute('data-id');
                    const deleteExpenseButton = document.querySelector('#deleteExpenseButton');
                    deleteExpenseButton.setAttribute('data-id', expenseId);
                });
            });

            // Set up event listener for the final delete button inside the modal
            const deleteExpenseButton = document.querySelector('#deleteExpenseButton');
            deleteExpenseButton.removeEventListener('click', searchDelete); // Ensure previous listeners are removed
            deleteExpenseButton.addEventListener('click', searchDelete);
        }
    }
    // Add event listener for the search field
    SEARCHFIELD.addEventListener('keyup', (e) => {
        const SEARCHVALUE = e.target.value.trim().toLowerCase();
        const expenses = JSON.parse(localStorage.getItem('expenses')) || [];

        if (SEARCHVALUE.length > 0) {
            const filteredExpenses = expenses.filter(expense =>
                expense.amount.toString().startsWith(SEARCHVALUE) ||
                expense.date.toLowerCase().startsWith(SEARCHVALUE) ||
                expense.description.toLowerCase().includes(SEARCHVALUE) ||
                expense.name.toLowerCase().includes(SEARCHVALUE) ||
                expense.category.toLowerCase().startsWith(SEARCHVALUE) ||
                expense.category_es.toLowerCase().startsWith(SEARCHVALUE) ||
                expense.category_ja.toLowerCase().startsWith(SEARCHVALUE)
            );

            EXPENSESTABLE.style.display = "none"; // Hide the original expenses table
            TABLEOUTPUT.style.display = "block"; // Show the search results table
            renderExpenses(filteredExpenses); // Render the filtered results
        } else {
            EXPENSESTABLE.style.display = "block"; // Show the original expenses table
            TABLEOUTPUT.style.display = "none"; // Hide the search results table
        }
    });

    // Handle the case where the delete button is clicked
    function searchDelete() {
        const expenseId = parseInt(this.getAttribute('data-id'));
        // console.log(`Deleting expense with id: ${expenseId}`);
        
        // Find the expense by ID and remove it
        const expenseIndex = expenses.findIndex(expense => expense.id === expenseId);

        if (expenseIndex !== -1) {
            expenses.splice(expenseIndex, 1);
            localStorage.setItem('expenses', JSON.stringify(expenses));
            location.reload(); // Reload the page to update the expenses list
        }
    }
});