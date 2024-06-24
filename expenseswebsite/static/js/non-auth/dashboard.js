$(document).ready(function(){
    const BALANCE = document.getElementById("totalBalance");
    const EXPENSE = document.getElementById("totalExpenses");
    const INCOME = document.getElementById("totalIncome");
    const TRANSACTION_TABLE = document.getElementById("transactionTable");
    const EXPORTIMPORT = document.getElementById("exportImportContainer");
    const GRAPH = document.getElementById("graphContainer");
    const NODATA = document.getElementById("noDataCard");
    const TABLEDATA = document.getElementById("TableData");

    // Retrieve expenses and income from localStorage
    const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    const incomes = JSON.parse(localStorage.getItem('incomes')) || [];

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

    // Merge and normalize expenses and incomes
    const allEntries = [
        ...expenses.map(item => ({ ...item, db_type: 'Expense', source: item.category })),
        ...incomes.map(item => ({ ...item, db_type: 'Income', source: item.source }))
    ];

    // Sort by date (descending)
    allEntries.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Get the last five entries
    const lastFiveEntries = allEntries.slice(0, 5);

    // Populate the table
    TRANSACTION_TABLE.innerHTML = ''; // Clear previous content
    lastFiveEntries.forEach((entry, index) => {
        const amountClass = entry.db_type === 'Expense' ? 'text-danger' : 'text-success'; // If it's an expense it shows red if not it shows in green.
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
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
              labels: ['Earnings', 'Expenses'],
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