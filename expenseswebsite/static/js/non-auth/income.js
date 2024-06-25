document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('mainContainer');

    // Retrieve incomes from localStorage
    const incomes = JSON.parse(localStorage.getItem('incomes')) || [];

    // Retrieve preferences from localStorage
    const preferences = JSON.parse(localStorage.getItem('preferences'));
    const prefCurrency = preferences.currency.substring(0, 4);

    // const items = { ...localStorage };
    // console.log('Data:',items);

    if (incomes.length > 0) {

        const itemsPerPage = 5;
        let currentPage = 1;
        const totalPages = Math.ceil(incomes.length / itemsPerPage);

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

        function renderIncomes(page) {
            currentPage = page;
            const start = (currentPage - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            const pageIncomes = incomes.slice(start, end);

            let content = `
                <div class="row">
                    <div class="col-md-8 d-flex align-items-center">
                        <h1>Income List</h1>
                    </div>
                    <div class="col-md-4 d-flex align-items-center">
                        <input id="searchField" type="text" class="form-control" placeholder="Search for income">
                    </div>
                </div>
                <br>
                <div class="container">
                    <div class="row">
                        <div class="col-md-12 d-flex justify-content-center mt-1">
                            <div class="col-md-5 d-flex justify-content-between mt-1">
                                <a class="btn btn-primary btn-lg px-7 py-2 rounded-pill mx-2" href="add-income">Add Income</a>
                                <a class="btn btn-primary btn-lg px-7 py-2 rounded-pill mx-2" id="openExportModal" data-bs-target="#data-modal" data-bs-toggle="modal">Export Data</a>
                                <a class="btn btn-primary btn-lg px-7 py-2 rounded-pill mx-2" id="openImportModal" data-bs-target="#import-modal" data-bs-toggle="modal">Import Data</a>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="tableOutput" class="container"></div>
                <div id="incomeTable">
            `;
            
            // So we can order them from last added first to show.
            const reversedIncomes = [...pageIncomes].reverse();

            if (reversedIncomes.length > 0) {
                reversedIncomes.forEach(income => {
                    
                    content += `
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
            }
            content += renderPagination();
            container.innerHTML = content;

            // Set up event listeners for delete buttons
            const deleteButtons = document.querySelectorAll('.delete-btn');
            deleteButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const incomeId = button.getAttribute('data-id');
                    const deleteIncomeButton = document.querySelector('#deleteIncomeButton');
                    deleteIncomeButton.setAttribute('data-id', incomeId);
                });
            });

            // Set up event listener for the final delete button inside the modal
            const deleteIncomeButton = document.querySelector('#deleteIncomeButton');
            deleteIncomeButton.removeEventListener('click', handleDelete); // Ensure previous listeners are removed
            deleteIncomeButton.addEventListener('click', handleDelete);

            // Set up event listeners for pagination links
            const paginationLinks = document.querySelectorAll('.page-link');
            paginationLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const page = parseInt(link.getAttribute('data-page'));
                    renderIncomes(page);
                });
            });
        }

        function handleDelete() {
            const incomeId = parseInt(this.getAttribute('data-id'));
            // console.log(`Deleting income with id: ${incomeId}`);
            
            // Find the income by ID and remove it
            const incomeIndex = incomes.findIndex(income => income.id === incomeId);

            if (incomeIndex !== -1) {
                incomes.splice(incomeIndex, 1);
            }
            
            localStorage.setItem('incomes', JSON.stringify(incomes));

            // Ensure we don't go out of bounds after deletion
            if (currentPage > Math.ceil(incomes.length / itemsPerPage)) {
                currentPage--;
            }
            renderIncomes(currentPage);
            location.reload();
        }

        renderIncomes(currentPage);
    }
});