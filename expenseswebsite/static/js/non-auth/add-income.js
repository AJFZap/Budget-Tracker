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

        fetch('sources/')
            
            .then(response => response.json())
            .then(data => {
                // console.log(data); // Access your sources here
                
                // Function to find the object with the source name in any language.
                const findItemByName = (list, value) => {
                    return list.find(item => 
                        item.name_en === value || 
                        item.name_es === value || 
                        item.name_ja === value
                    );
                };

                // Get the object with the name source name.
                const sourceItem = findItemByName(data, source);
                // console.log(sourceItem)

                // Create an income object
                const income = {
                    id: newId, 
                    name: incomeName,
                    date: datePicked,
                    description: description,
                    amount: amount,
                    source: sourceItem.name_en,
                    source_en: sourceItem.name_en,
                    source_es: sourceItem.name_es,
                    source_ja: sourceItem.name_ja,
                };

                // Save the updated incomes list to localStorage
                incomes.push(income); // Add the new income
                localStorage.setItem('incomes', JSON.stringify(incomes));

                // const items = { ...localStorage };
                // console.log('Data:',items);
                
                //Finally we submit the form.
                form.submit();
            })
            .catch(error => console.error('Error fetching categories:', error));
    });
});