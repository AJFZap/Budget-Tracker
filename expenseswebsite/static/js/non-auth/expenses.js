document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('mainContainer');

    // Retrieve expenses from localStorage
    const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    // Retrieve preferences from localStorage
    const preferences = JSON.parse(localStorage.getItem('preferences'));
    const prefCurrency = preferences.currency.substring(0, 4);

    // const items = { ...localStorage };
    // console.log('Data:',items);

    if (expenses.length > 0) {

        const itemsPerPage = 5;
        let currentPage = 1;
        const totalPages = Math.ceil(expenses.length / itemsPerPage);

        function renderPagination() {
            let paginationContent = `
                <nav aria-label="Page navigation">
                    <ul class="pagination justify-content-center">
            `;

            if (currentPage > 1) {
                paginationContent += `
                    <li class="page-item">
                        <a class="page-link" href="#" data-page="1" aria-label="First">
                            <span aria-hidden="true">&laquo;&laquo;</span>
                        </a>
                    </li>
                    <li class="page-item">
                        <a class="page-link" href="#" data-page="${currentPage - 1}" aria-label="Previous">
                            <span aria-hidden="true">&laquo;</span>
                        </a>
                    </li>
                `;
            }

            for (let page = 1; page <= totalPages; page++) {
                paginationContent += `
                    <li class="page-item ${page === currentPage ? 'active' : ''}">
                        <a class="page-link" href="#" data-page="${page}">${page}</a>
                    </li>
                `;
            }

            if (currentPage < totalPages) {
                paginationContent += `
                    <li class="page-item">
                        <a class="page-link" href="#" data-page="${currentPage + 1}" aria-label="Next">
                            <span aria-hidden="true">&raquo;</span>
                        </a>
                    </li>
                    <li class="page-item">
                        <a class="page-link" href="#" data-page="${totalPages}" aria-label="Last">
                            <span aria-hidden="true">&raquo;&raquo;</span>
                        </a>
                    </li>
                `;
            }

            paginationContent += `
                    </ul>
                </nav>
            `;

            return paginationContent;
        }

        function renderExpenses(page) {
            currentPage = page;
            const start = (currentPage - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            const pageExpenses = expenses.slice(start, end);

            let content = `
                <div class="row">
                    <div class="col-md-8 d-flex align-items-center">
                        <h1>Expenses List</h1>
                    </div>
                    <div class="col-md-4 d-flex align-items-center">
                        <input id="searchField" type="text" class="form-control" placeholder="Search for expenses">
                    </div>
                </div>
                <br>
                <div class="container">
                    <div class="row">
                        <div class="col-md-12 d-flex justify-content-center mt-1">
                            <div class="col-md-5 d-flex justify-content-between mt-1">
                                <a class="btn btn-primary btn-lg px-7 py-2 rounded-pill mx-2" href="add-expense">Add Expense</a>
                                <a class="btn btn-primary btn-lg px-7 py-2 rounded-pill mx-2" id="openExportModal" data-bs-target="#data-modal" data-bs-toggle="modal">Export Data</a>
                                <a class="btn btn-primary btn-lg px-7 py-2 rounded-pill mx-2" id="openImportModal" data-bs-target="#import-modal" data-bs-toggle="modal">Import Data</a>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="tableOutput" class="container"></div>
                <div id="expensesTable">
            `;
            
            // So we can order them from last added first to show.
            const reversedExpenses = [...pageExpenses].reverse();

            if (reversedExpenses.length > 0) {
                reversedExpenses.forEach(expense => {
                    content += `
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
                });
            }
            content += renderPagination();
            container.innerHTML = content;

            // Set up event listeners for delete buttons
            const deleteButtons = document.querySelectorAll('.delete-btn');
            deleteButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const expenseId = button.getAttribute('data-id');
                    const deleteExpenseButton = document.querySelector('#deleteExpenseButton');
                    deleteExpenseButton.setAttribute('data-id', expenseId);
                });
            });

            // Set up event listener for the final delete button inside the modal
            const deleteExpenseButton = document.querySelector('#deleteExpenseButton');
            deleteExpenseButton.removeEventListener('click', handleDelete); // Ensure previous listeners are removed
            deleteExpenseButton.addEventListener('click', handleDelete);

            // Set up event listeners for pagination links
            const paginationLinks = document.querySelectorAll('.page-link');
            paginationLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const page = parseInt(link.getAttribute('data-page'));
                    renderExpenses(page);
                });
            });
        }

        function handleDelete() {
            const expenseId = parseInt(this.getAttribute('data-id'));
            // console.log(`Deleting expense with id: ${expenseId}`);
            
            // Find the expense by ID and remove it
            const expenseIndex = expenses.findIndex(expense => expense.id === expenseId);
            // console.log(expenseIndex)

            if (expenseIndex !== -1) {
                expenses.splice(expenseIndex, 1);
            }
            
            localStorage.setItem('expenses', JSON.stringify(expenses));

            // Ensure we don't go out of bounds after deletion
            if (currentPage > Math.ceil(expenses.length / itemsPerPage)) {
                currentPage--;
            }
            renderExpenses(currentPage);
            location.reload();
        }

        renderExpenses(currentPage);
    }
});