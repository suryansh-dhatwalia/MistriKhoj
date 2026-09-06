const fs = require('fs');
let content = fs.readFileSync('src/data/translations.ts', 'utf8');

const replacements = {
  hi: "nav_register_mistri: 'मिस्त्री रजिस्टर',",
  en: "nav_register_mistri: 'Register Mistri',",
  bn: "nav_register_mistri: 'মিস্ত্রি নিবন্ধন',",
  mr: "nav_register_mistri: 'मिस्त्री रजिस्टर',",
  as: "nav_register_mistri: 'মিস্ত্ৰী পঞ্জীয়ন',",
  gu: "nav_register_mistri: 'મિસ્ત્રી રજીસ્ટર',",
  ta: "nav_register_mistri: 'மிஸ்திரி பதிவு',",
  te: "nav_register_mistri: 'మిస్త్రీ రిజిస్టర్',",
  kn: "nav_register_mistri: 'ಮಿಸ್ತ್ರಿ ರಿಜಿಸ್ಟರ್',"
};

let lines = content.split('\n');
let currentLang = '';

for (let i = 0; i < lines.length; i++) {
  const langMatch = lines[i].match(/^  ([a-z]{2}): \{/);
  if (langMatch) {
    currentLang = langMatch[1];
  }
  if (lines[i].includes('nav_register_mistri:')) {
    if (replacements[currentLang]) {
      lines[i] = lines[i].replace(/nav_register_mistri: '.*'/, replacements[currentLang]);
    }
  }
}

fs.writeFileSync('src/data/translations.ts', lines.join('\n'));
console.log('Translations updated!');
