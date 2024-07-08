document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('incomeForm');

    // Retrieve incomes from localStorage
    const incomes = JSON.parse(localStorage.getItem('incomes')) || [];
    // const items = { ...localStorage };
    // console.log(items)

    // Get Language.
    const preferences = JSON.parse(localStorage.getItem('preferences'));
    const prefLanguage = preferences.language;

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
    if (prefLanguage == 'es'){
        document.getElementById('incomeSource').value = incomes[incomeIndex].source_es;
    }
    else if (prefLanguage == 'ja'){
        document.getElementById('incomeSource').value = incomes[incomeIndex].source_ja;
    }
    else {
        document.getElementById('incomeSource').value = incomes[incomeIndex].source;
    }

    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent form submission

        // Get form data
        const incomeName = document.getElementById('incomeName').value;
        const datePicked = document.getElementById('incomeDate').value;
        const description = document.getElementById('incomeDescription').value || "No description provided.";
        const amount = document.getElementById('incomeAmount').value;
        const source = document.getElementById('incomeSource').value;

        fetch(sourcesUrl)
            
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
                
                // Change the income accordingly to the changes the user made.
                incomes[incomeIndex].name = incomeName
                incomes[incomeIndex].date = datePicked
                incomes[incomeIndex].description = description
                incomes[incomeIndex].amount = amount
                incomes[incomeIndex].source = sourceItem.name_en
                incomes[incomeIndex].source_en = sourceItem.name_en
                incomes[incomeIndex].source_es = sourceItem.name_es
                incomes[incomeIndex].source_ja = sourceItem.name_ja

                // Save the updated incomes list to localStorage
                localStorage.setItem('incomes', JSON.stringify(incomes));

                // const items = { ...localStorage };
                // console.log('Data:',items);
                
                //Finally we submit the form.
                form.submit();
            })
            .catch(error => console.error('Error fetching categories:', error));
    });
});