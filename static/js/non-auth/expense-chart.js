$(document).ready(function(){
  const GRAPHCONTAINER = document.getElementById('GraphContainer');
  const NOGRAPHCONTAINER = document.getElementById('NoGraph');
  let chartInstance = null;

  // Retrieve expenses from localStorage
  const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
  // console.log(expenses);

  // Get Language.
  const preferences = JSON.parse(localStorage.getItem('preferences'));
  const prefLanguage = preferences.language;

  // const items = { ...localStorage };
  // console.log('Data:',items);

  if (expenses.length > 0) {
    GRAPHCONTAINER.style.display = "block";
    NOGRAPHCONTAINER.style.display = "none";
    
    let totalAmountByCategory = {};

    expenses.forEach(expense => {
      // Nationalization.
      if (!totalAmountByCategory[expense.category] && prefLanguage == 'es') {
        totalAmountByCategory[expense.category_es] = 0;
      }
      else if (!totalAmountByCategory[expense.category] && prefLanguage == 'ja') {
        totalAmountByCategory[expense.category_ja] = 0;
      }
      else {
        totalAmountByCategory[expense.category] = 0;
      }

      if (prefLanguage == 'es') {
        totalAmountByCategory[expense.category_es] += parseFloat(expense.amount);
      }
      else if (prefLanguage == 'ja') {
        totalAmountByCategory[expense.category_ja] += parseFloat(expense.amount);
      }
      else {
        totalAmountByCategory[expense.category] += parseFloat(expense.amount);
      }
    });

    // console.log(totalAmountByCategory);

    const [CATEGORIES, AMOUNT] = [Object.keys(totalAmountByCategory), Object.values(totalAmountByCategory)];

    const ctx = document.getElementById('myChart').getContext('2d');

    chartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: CATEGORIES,
        datasets: [{
          label: 'Amount',
          data: AMOUNT,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      }
    });

    $('#graphStyle').change(function() {
      const selectedType = $(this).val();
      updateChartType(selectedType);
    });
  
    function updateChartType(type) {
      const ctx = document.getElementById('myChart').getContext('2d');

      // Destroy existing chart instance if it exists
      if (chartInstance) {
        chartInstance.destroy();
      }

      chartInstance = new Chart(ctx, {
        type: type,
        data: {
            labels: CATEGORIES,
            datasets: [{
                label: 'Amount',
                data: AMOUNT,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
        }
      });
    }
  }
});
  