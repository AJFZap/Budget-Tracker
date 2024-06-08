const BALANCE = document.getElementById('totalBalance');
const EXPENSE = document.getElementById('totalExpenses');
const INCOME = document.getElementById('totalIncome');

$(document).ready(function(){
    let balanceValue = parseFloat(BALANCE.innerHTML)
    let expenseValue = parseFloat(EXPENSE.innerHTML)
    let incomeValue = parseFloat(INCOME.innerHTML)

    if (balanceValue > 0.00) {
        console.log("HIGHER");
        BALANCE.classList.add('text-success');
    }
    else if (balanceValue < 0.00) {
        console.log("LOWER");
        BALANCE.classList.add('text-danger');
    }
    if (expenseValue > 0.00) {
        console.log("LOWER");
        EXPENSE.classList.add('text-danger');
    }

    if (incomeValue > 0.00) {
        console.log("HIGHER");
        INCOME.classList.add('text-success');
    }
})