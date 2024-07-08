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
});