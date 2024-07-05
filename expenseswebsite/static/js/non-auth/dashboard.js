$(document).ready(function(){
    const BALANCE = document.getElementById("totalBalance");
    const EXPENSE = document.getElementById("totalExpenses");
    const INCOME = document.getElementById("totalIncome");
    const TRANSACTION_TABLE = document.getElementById("transactionTable");
    const EXPORTIMPORT = document.getElementById("exportImportContainer");
    const GRAPH = document.getElementById("graphContainer");
    const NODATA = document.getElementById("noDataCard");
    const TABLEDATA = document.getElementById("TableData");
    const PREFCURRENCY = document.querySelectorAll('p.displayCurrency');

    // Retrieve expenses and income from localStorage
    const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    const incomes = JSON.parse(localStorage.getItem('incomes')) || [];
    const preferences = JSON.parse(localStorage.getItem('preferences'));
    // Get Language.
    const prefLanguage = preferences.language;

    PREFCURRENCY.forEach(element => {
        element.innerHTML = preferences.currency.substring(0, 4); // Shows the preferred currency.
    });

    let expenseValue = 0.00;
    let incomeValue = 0.00;
    let balance = 0.00;

    expenses.forEach(expense => {
        expenseValue += parseFloat(expense.amount);
    });

    incomes.forEach(income => {
        incomeValue += parseFloat(income.amount)
    });

    balance = incomeValue - expenseValue;

    if (balance > 0.00) {
        BALANCE.classList.add('text-success');
    }
    else if (balance < 0.00) {
        BALANCE.classList.add('text-danger');
    }
    if (expenseValue > 0.00) {
        EXPENSE.classList.add('text-danger');
    }

    if (incomeValue > 0.00) {
        INCOME.classList.add('text-success');
    }

    BALANCE.innerHTML = balance.toFixed(2);
    EXPENSE.innerHTML = expenseValue.toFixed(2);
    INCOME.innerHTML = incomeValue.toFixed(2);

    // Merge and normalize expenses and incomes in all languages.
    let allEntries = [];
    let langLabels = [];

    if (prefLanguage == 'es'){
        langLabels = ['Ingresos', 'Gastos']
        allEntries = [
            ...expenses.map(item => ({ ...item, db_type: 'Gasto', source: item.category_es })),
            ...incomes.map(item => ({ ...item, db_type: 'Ingreso', source: item.source_es }))
        ];
    }
    else if (prefLanguage == 'ja'){
        langLabels = ['収入', '経費']
        allEntries = [
            ...expenses.map(item => ({ ...item, db_type: '経費', source: item.category_ja })),
            ...incomes.map(item => ({ ...item, db_type: '収入', source: item.source_ja }))
        ];
    }
    else {
        langLabels = ['Earnings', 'Expenses']
        allEntries = [
            ...expenses.map(item => ({ ...item, db_type: 'Expense', source: item.category })),
            ...incomes.map(item => ({ ...item, db_type: 'Income', source: item.source }))
        ];
    }

    // Sort by date (descending)
    allEntries.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Get the last five entries
    const lastFiveEntries = allEntries.slice(0, 5);

    // Populate the table
    TRANSACTION_TABLE.innerHTML = ''; // Clear previous content
    lastFiveEntries.forEach((entry, index) => {
        const amountClass = (entry.db_type === 'Expense' || entry.db_type === 'Gasto' || entry.db_type === '経費') ? 'text-danger' : 'text-success'; // If it's an expense it shows red if not it shows in green.
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${entry.name}</td>
            <td>${entry.date}</td>
            <td>${entry.description}</td>
            <td class=${amountClass}>${entry.amount}</td>
            <td>${entry.db_type}</td>
        `;
        TRANSACTION_TABLE.appendChild(row);
    });

    // In case we got data to show
    if (expenses.length > 0 || incomes.length > 0 ) {
        NODATA.style.display = "none";
        TABLEDATA.style.display = "block";
        EXPORTIMPORT.style.display = "block";
        GRAPH.style.display = "block";

        const ctx = document.getElementById('myChart').getContext('2d');

        new Chart(ctx, {
            type: 'doughnut',
            data: {
              labels: langLabels,
              datasets: [{
                label: 'Amount',
                data: [incomeValue, expenseValue],
                borderWidth: 1,
                backgroundColor: ["green", "red"],
              }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
            }
          });
    }
});