const fs = require('fs');
const file = 'd:/Project 5 m/Project_System_Plant/resources/js/Pages/FailureAnalysis/Create.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace all instances of the old input class with the padded, bg-white one
content = content.replace(/className="w-full text-sm border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500( mt-1)?( bg-white)?"/g, 'className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg text-sm dark:text-gray-200 focus:ring-red-500 focus:border-red-500$1"');

fs.writeFileSync(file, content);
console.log('Done replacement');
