$(document).ready(function(){
    const GRAPHCONTAINER = document.getElementById('GraphContainer');
    const NOGRAPHCONTAINER = document.getElementById('NoGraph');
    let chartInstance = null;
  
    // Retrieve incomes from localStorage
    const incomes = JSON.parse(localStorage.getItem('incomes')) || [];
    // console.log(incomes);

    // Get Language.
    const preferences = JSON.parse(localStorage.getItem('preferences'));
    const prefLanguage = preferences.language;

    // const items = { ...localStorage };
    // console.log('Data:',items);
  
    if (incomes.length > 0) {
      GRAPHCONTAINER.style.display = "block";
      NOGRAPHCONTAINER.style.display = "none";
      
      let totalAmountBySource = {};
  
      incomes.forEach(income => {
        // Nationalization.
        if (!totalAmountBySource[income.source] && prefLanguage == 'es') {
            totalAmountBySource[income.source_es] = 0;
        }
        else if (!totalAmountBySource[income.source] && prefLanguage == 'ja') {
          totalAmountBySource[income.source_ja] = 0;
        }
        else {
          totalAmountBySource[income.source] = 0;
        }
        
        if (prefLanguage == 'es') {
          totalAmountBySource[income.source_es] += parseFloat(income.amount);
        }
        else if (prefLanguage == 'ja') {
          totalAmountBySource[income.source_ja] += parseFloat(income.amount);
        }
        else {
          totalAmountBySource[income.source] += parseFloat(income.amount);
        }
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
    