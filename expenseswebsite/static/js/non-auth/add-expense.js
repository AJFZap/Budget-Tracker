document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('expenseForm');
    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent form submission

        // Get form data
        const expenseName = document.getElementById('expenseName').value;
        const datePicked = document.getElementById('expenseDate').value;
        const description = document.getElementById('expenseDescription').value || "No description provided.";
        const amount = document.getElementById('expenseAmount').value;
        const category = document.getElementById('expenseCategory').value;

        // Get the existing expenses from localStorage
        let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

        // Determine the new ID. Either it's 0 if it's the first item in localStorage or we give it the id of the latest added one plus 1.
        let newId = 0;
        if (expenses.length > 0) {
            newId = Math.max(...expenses.map(expense => expense.id)) + 1;
        }

        // Create an expense object
        const expense = {
            id: newId, 
            name: expenseName,
            date: datePicked,
            description: description,
            amount: amount,
            category: category
        };

        // Save the updated expenses list to localStorage
        expenses.push(expense); // Add the new expense
        localStorage.setItem('expenses', JSON.stringify(expenses));

        // const items = { ...localStorage };
        // console.log('Data:',items);
        
        //Finally we submit the form.
        form.submit();
    });
});