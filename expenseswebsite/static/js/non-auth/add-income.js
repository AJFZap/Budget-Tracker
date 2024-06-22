document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('incomeForm');
    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent form submission

        // Get form data
        const incomeName = document.getElementById('incomeName').value; // It's not reading their values.
        const datePicked = document.getElementById('incomeDate').value;
        const description = document.getElementById('incomeDescription').value || "No description provided.";
        const amount = document.getElementById('incomeAmount').value;
        const source = document.getElementById('incomeSource').value;

        // Get the existing incomes from localStorage
        let incomes = JSON.parse(localStorage.getItem('incomes')) || [];

        // Determine the new ID. Either it's 0 if it's the first item in localStorage or we give it the id of the latest added one plus 1.
        let newId = 0;
        if (incomes.length > 0) {
            newId = Math.max(...incomes.map(income => income.id)) + 1;
        }

        // Create an income object
        const income = {
            id: newId, 
            name: incomeName,
            date: datePicked,
            description: description,
            amount: amount,
            source: source
        };

        // Save the updated incomes list to localStorage
        incomes.push(income); // Add the new income
        localStorage.setItem('incomes', JSON.stringify(incomes));

        // const items = { ...localStorage };
        // console.log('Data:',items);
        
        //Finally we submit the form.
        form.submit();
    });
});