const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `
        } else {
            return \`
            <div class="signature-area" style="display: flex; justify-content: space-between; margin-top: 40px; text-align: center;">
               \${\isTeacher && !isGenel && rowKey ? \`<div style="text-align: left; flex: 1;"><strong>Aslını elden teslim aldım.</strong><br/>Tarih: ...../...../20....<br/><br/><br/>\${rowKey}</div>\` : \`<div style="flex: 1;"></div>\`}
               <div style="text-align: center; flex: 1;"><strong>Müdür Yardımcısı</strong><br/><br/><br/>\${schoolInfo.vicePrincipal || '...........................'}</div>
               <div style="text-align: right; flex: 1;"><strong>Okul Müdürü</strong><br/><br/><br/>\${schoolInfo.principal || '...........................'}</div>
            </div>
            \`;
        }
`;

const replaceStr = `
        } else {
            return \`
            <table style="width: 100%; border: none; margin-top: auto; page-break-inside: avoid; font-size: 13px;">
               <tr style="border: none;">
                  <td style="border: none; width: 33%; text-align: left; vertical-align: bottom;">
                     \${isTeacher && !isGenel && rowKey ? \`<strong>Aslını elden teslim aldım.</strong><br/><br/>Tarih: ...../...../20....<br/><br/><br/><strong>\${rowKey}</strong>\` : ''}
                  </td>
                  <td style="border: none; width: 33%; text-align: center; vertical-align: bottom;">
                     <strong>Müdür Yardımcısı</strong><br/><br/><br/><br/><strong>\${schoolInfo.vicePrincipal || '...........................'}</strong>
                  </td>
                  <td style="border: none; width: 33%; text-align: right; vertical-align: bottom;">
                     <strong>Okul Müdürü</strong><br/><br/><br/><br/><strong>\${schoolInfo.principal || '...........................'}</strong>
                  </td>
               </tr>
            </table>
            \`;
        }
`;

code = code.replace(targetStr.trim(), replaceStr.trim());
fs.writeFileSync('src/App.tsx', code);
console.log('patched PDF signature');
