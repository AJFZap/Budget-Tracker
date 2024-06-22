document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('expenseForm');

    // Retrieve expenses from localStorage
    const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    // const items = { ...localStorage };

    // Get the Index of the expense to edit
    const expenseId = parseInt(document.getElementById('ElementId').value);
    // console.log('id', expenseId)
    const expenseIndex = expenses.findIndex(expense => expense.id === expenseId);
    // console.log('Index', expenseIndex);

    // Display the data from the expense to edit.
    document.getElementById('expenseName').value = expenses[expenseIndex].name;
    document.getElementById('expenseDate').value = expenses[expenseIndex].date;
    document.getElementById('expenseDescription').value = expenses[expenseIndex].description;
    document.getElementById('expenseAmount').value = expenses[expenseIndex].amount;
    document.getElementById('expenseCategory').value = expenses[expenseIndex].category;

    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent form submission

        // Get form data
        const expenseName = document.getElementById('expenseName').value;
        const datePicked = document.getElementById('expenseDate').value;
        const description = document.getElementById('expenseDescription').value || "No description provided.";
        const amount = document.getElementById('expenseAmount').value;
        const category = document.getElementById('expenseCategory').value;

        // Change the expense accordingly to the changes the user made.
        expenses[expenseIndex].name = expenseName
        expenses[expenseIndex].date = datePicked
        expenses[expenseIndex].description = description
        expenses[expenseIndex].amount = amount
        expenses[expenseIndex].category = category
        
        localStorage.setItem('expenses', JSON.stringify(expenses));
        
        //Finally we submit the form.
        form.submit();
    });
});