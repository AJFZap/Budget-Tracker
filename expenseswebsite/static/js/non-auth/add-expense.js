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

        fetch('categories/')

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

                // Create an expense object
                const expense = {
                    id: newId, 
                    name: expenseName,
                    date: datePicked,
                    description: description,
                    amount: amount,
                    category: categoryItem.name_en,
                    category_en: categoryItem.name_en,
                    category_es: categoryItem.name_es,
                    category_ja: categoryItem.name_ja,
                };

                // Save the updated expenses list to localStorage
                expenses.push(expense); // Add the new expense
                localStorage.setItem('expenses', JSON.stringify(expenses));

                // const items = { ...localStorage };
                // console.log('Data:',items);
                
                //Finally we submit the form.
                form.submit();
            })
            .catch(error => console.error('Error fetching categories:', error));
    });
});