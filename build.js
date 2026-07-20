const fs = require('fs');
let html = fs.readFileSync('template.html', 'utf8');
const panels = [
  '3c-rec','3c-single','3c-versus','3c-guide',
  'beauty-rec','beauty-single','beauty-versus','beauty-guide',
  'outdoor-rec','outdoor-single','outdoor-versus','outdoor-guide'
];
for (const p of panels) {
  const content = fs.readFileSync(`content/${p}.html`, 'utf8').trimEnd();
  html = html.replace(`{{${p}}}`, content);
}
fs.writeFileSync('answer-showcase.html', html);
console.log('✅ answer-showcase.html 已生成');
