document.addEventListener('DOMContentLoaded', function() {
    // Get the existing preferences from localStorage or create them if they don't exist.
    if (localStorage.getItem('preferences') === null) {
        let preferences = JSON.parse(localStorage.getItem('preferences')) || {'currency': 'USD - United States Dollar', 'language': 'en'};
        // console.log(preferences);

        // console.log(preferences.currency);
        // console.log(preferences.language);

        localStorage.setItem('preferences', JSON.stringify(preferences));
        // console.log(preferences)
    }
    else {
        // Set the language of the page to the one the user has saved on localStorage.
        const preferences = JSON.parse(localStorage.getItem('preferences'));
        // Get Language.
        const prefLanguage = preferences.language;
        // console.log(prefLanguage);

        // Get currentUrl and check if it's the same language as the preferred one
        const currentUrl = window.location.href;
        // console.log(currentUrl);
        
        // Define a regular expression to match the language segment in the URL.
        const langRegex = /\/(en|es|ja)\//;
        
        // Replace the URL with the one we want.
        const newUrl = currentUrl.replace(langRegex, '/' + prefLanguage + '/');
        // console.log(newUrl);

        // If the language it's different to the saved one then we change the url.
        if (currentUrl != newUrl) {
            window.location.replace(newUrl);
        }
    }
});