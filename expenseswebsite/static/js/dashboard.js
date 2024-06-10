const BALANCE = document.getElementById('totalBalance');
const EXPENSE = document.getElementById('totalExpenses');
const INCOME = document.getElementById('totalIncome');

$(document).ready(function(){
    let balanceValue = parseFloat(BALANCE.innerHTML)
    let expenseValue = parseFloat(EXPENSE.innerHTML)
    let incomeValue = parseFloat(INCOME.innerHTML)

    if (balanceValue > 0.00) {
        BALANCE.classList.add('text-success');
    }
    else if (balanceValue < 0.00) {
        BALANCE.classList.add('text-danger');
    }
    if (expenseValue > 0.00) {
        EXPENSE.classList.add('text-danger');
    }

    if (incomeValue > 0.00) {
        INCOME.classList.add('text-success');
    }

    if (document.getElementById('myChart') !== null){
        
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
    })