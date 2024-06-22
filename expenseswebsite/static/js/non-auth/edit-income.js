document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('incomeForm');

    // Retrieve incomes from localStorage
    const incomes = JSON.parse(localStorage.getItem('incomes')) || [];
    // const items = { ...localStorage };
    // console.log(items)

    // Get the Index of the income to edit
    const incomeId = parseInt(document.getElementById('ElementId').value);
    // console.log('id', incomeId)
    const incomeIndex = incomes.findIndex(income => income.id === incomeId);
    // console.log('Index', incomeIndex);

    // Display the data from the income to edit.
    document.getElementById('incomeName').value = incomes[incomeIndex].name;
    document.getElementById('incomeDate').value = incomes[incomeIndex].date;
    document.getElementById('incomeDescription').value = incomes[incomeIndex].description;
    document.getElementById('incomeAmount').value = incomes[incomeIndex].amount;
    document.getElementById('incomeSource').value = incomes[incomeIndex].source;

    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent form submission

        // Get form data
        const incomeName = document.getElementById('incomeName').value;
        const datePicked = document.getElementById('incomeDate').value;
        const description = document.getElementById('incomeDescription').value || "No description provided.";
        const amount = document.getElementById('incomeAmount').value;
        const source = document.getElementById('incomeSource').value;

        // Change the income accordingly to the changes the user made.
        incomes[incomeIndex].name = incomeName
        incomes[incomeIndex].date = datePicked
        incomes[incomeIndex].description = description
        incomes[incomeIndex].amount = amount
        incomes[incomeIndex].source = source
        
        localStorage.setItem('incomes', JSON.stringify(incomes));
        
        //Finally we submit the form.
        form.submit();
    });
});