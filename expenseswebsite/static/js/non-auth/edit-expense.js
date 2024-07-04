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

        fetch(categoriesUrl)

            .then(response => response.json())
            .then(data => {
                // console.log(data); // Access your categories here
                
                // Function to find the object with the category name in any language.
                const findItemByName = (list, value) => {
                    return list.find(item => 
                        item.name_en === value || 
                        item.name_es === value || 
                        item.name_ja === value
                    );
                };

                // Get the object with the name category name.
                const categoryItem = findItemByName(data, category);
                // console.log(categoryItem)

                // Change the expense accordingly to the changes the user made.
                expenses[expenseIndex].name = expenseName
                expenses[expenseIndex].date = datePicked
                expenses[expenseIndex].description = description
                expenses[expenseIndex].amount = amount
                expenses[expenseIndex].category = categoryItem.name_en
                expenses[expenseIndex].category_en = categoryItem.name_en
                expenses[expenseIndex].category_es = categoryItem.name_es
                expenses[expenseIndex].category_ja = categoryItem.name_ja

                // Save the updated expenses list to localStorage
                localStorage.setItem('expenses', JSON.stringify(expenses));

                // const items = { ...localStorage };
                // console.log('Data:',items);
                
                //Finally we submit the form.
                form.submit();
            })
            .catch(error => console.error('Error fetching categories:', error));
    });
});