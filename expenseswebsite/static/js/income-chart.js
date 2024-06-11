$(document).ready(function(){
    const GRAPHCONTAINER = document.getElementById('GraphContainer');
    let chartInstance = null;
  
    fetch('income_data').then(res => res.json()).then(total => {
  
      if(total){
        // console.log("data", total);
        // console.log(total.income_data);
  
        const [CATEGORIES, AMOUNT] = [Object.keys(total.income_data), Object.values(total.income_data)]
  
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
      }
      else {
        GRAPHCONTAINER.innerHTML =`
                  <div class="row justify-content-center">
                    <div class="col-md-6">
                      <div class="text-center">
                        <h3><strong>No summary to show!</strong></h3><br><h4 class="text-muted">You have no income yet.</h4><br>
                        <a href="{% url 'income' %}" class="d-inline-flex align-items-center btn btn-primary btn-lg px-4 rounded-pill">Create some Income</a>
                      </div>
                    </div>
                  </div>
                `;
      }
    }).catch((error) => {
      // console.error('Error:', error);
      GRAPHCONTAINER.innerHTML =`
                  <div class="row justify-content-center">
                    <div class="col-md-6">
                      <div class="text-center">
                        <h3><strong>No summary to show!</strong></h3><br><h4 class="text-muted">You have no income yet.</h4><br>
                        <a href="{% url 'income' %}" class="d-inline-flex align-items-center btn btn-primary btn-lg px-4 rounded-pill">Create some Income</a>
                      </div>
                    </div>
                  </div>
                `;
  });
    
    $('#graphStyle').change(function() {
      const selectedType = $(this).val();
      updateChartType(selectedType);
    });
  
    function updateChartType(type) {
      const ctx = document.getElementById('myChart').getContext('2d');
      fetch('income_data').then(res => res.json()).then(total => {
          if (total) {
              const [CATEGORIES, AMOUNT] = [Object.keys(total.income_data), Object.values(total.income_data)];
              
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
      });
    }
  });