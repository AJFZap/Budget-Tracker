$(document).ready(function(){
    const form = document.getElementById('preferencesForm');
    
    // Get form elements
    const currency = document.getElementById('currencySelect');
    const language = document.getElementById('languageSelect');
    const currentCurrency = document.getElementById('currentCurrency');
    const currentLanguage = document.getElementById('currentLanguage');
    
    // const items = { ...localStorage };
    // console.log('Data:',items);

    // Get the existing preferences from localStorage or create them if they don't exist.
    let preferences = JSON.parse(localStorage.getItem('preferences')) || {'currency': 'USD - United States Dollar', 'language': 'English'};
    // console.log(preferences);

    currency.value = preferences.currency;
    language.value = preferences.language;
    currentCurrency.innerHTML = "Current: " + preferences.currency;
    currentLanguage.innerHTML = "Current: " + preferences.language;
    
    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent form submission

        preferences.currency = currency.value;
        preferences.language = language.value;

        // console.log(preferences.currency);
        // console.log(preferences.language);

        localStorage.setItem('preferences', JSON.stringify(preferences));

        // console.log(preferences);
        
        //Finally we submit the form.
        form.submit();
    });
});