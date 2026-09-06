const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

// Remove the previous block if exists
css = css.replace(/\/\* Touch Target Accessibility for Mobile \*\/[\s\S]*?(?=\n\n|$)/, '').trim();

css += `\n\n/* Touch Target Accessibility for Mobile */
@media (max-width: 767px) {
  button, 
  [role="button"] {
    min-height: 44px;
    min-width: 44px;
    /* Ensure content is centered if button expands */
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  /* Don't override buttons that explicitly need flex-start (if any) */
  button.justify-start {
    justify-content: flex-start;
  }

  button.justify-between {
    justify-content: space-between;
  }

  input[type="checkbox"],
  input[type="radio"] {
    min-height: 44px;
    min-width: 44px;
    /* Reset margins/paddings if any to prevent overflow */
    margin: 0;
  }
}
`;

fs.writeFileSync('src/index.css', css);
console.log("CSS patched successfully.");
