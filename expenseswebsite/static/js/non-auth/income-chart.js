$(document).ready(function(){
    const GRAPHCONTAINER = document.getElementById('GraphContainer');
    const NOGRAPHCONTAINER = document.getElementById('NoGraph');
    let chartInstance = null;
  
    // Retrieve incomes from localStorage
    const incomes = JSON.parse(localStorage.getItem('incomes')) || [];
    // console.log(incomes);
  
    // const items = { ...localStorage };
    // console.log('Data:',items);
  
    if (incomes.length > 0) {
      GRAPHCONTAINER.style.display = "block";
      NOGRAPHCONTAINER.style.display = "none";
      
      let totalAmountBySource = {};
  
      incomes.forEach(income => {
        if (!totalAmountBySource[income.source]) {
            totalAmountBySource[income.source] = 0;
        }
        totalAmountBySource[income.source] += parseFloat(income.amount);
      });
  
      // console.log(totalAmountBySource);
  
      const [SOURCE, AMOUNT] = [Object.keys(totalAmountBySource), Object.values(totalAmountBySource)];
  
      const ctx = document.getElementById('myChart').getContext('2d');
  
      chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: SOURCE,
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
              labels: SOURCE,
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
    