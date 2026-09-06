const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `
    const getSignatureHtml = (rowKey = null) => {
        let teacherHtml = '';
        if (isTeacher && !isGenel && rowKey) {
            teacherHtml = \`
               <td style="border: none; text-align: left; vertical-align: top; width: 33%;">
                 <strong>Aslını elden teslim aldım.</strong><br/><br/><br/>
                 \${rowKey}
               </td>
            \`;
        } else {
            teacherHtml = \`<td style="border: none; width: 33%;"></td>\`;
        }

        if (forExcel) {
            return \`
            <br/>
            <table style="border: none; width: 100%;">
              <tr style="border: none;">
                 \${teacherHtml}
                 <td style="border: none; text-align: center; vertical-align: top; width: 33%;">
                    <strong>Müdür Yardımcısı</strong><br/><br/><br/>\${schoolInfo.vicePrincipal || '...........................'}
                 </td>
                 <td style="border: none; text-align: center; vertical-align: top; width: 33%;">
                    <strong>Okul Müdürü</strong><br/><br/><br/>\${schoolInfo.principal || '...........................'}
                 </td>
              </tr>
            </table>
            \`;
        } else {
            return \`
            <div class="signature-area" style="display: flex; justify-content: space-between; margin-top: 40px; text-align: center;">
               \${isTeacher && !isGenel && rowKey ? \`<div style="text-align: left; flex: 1;"><strong>Aslını elden teslim aldım.</strong><br/><br/><br/>\${rowKey}</div>\` : \`<div style="flex: 1;"></div>\`}
               <div style="text-align: center; flex: 1;"><strong>Müdür Yardımcısı</strong><br/><br/><br/>\${schoolInfo.vicePrincipal || '...........................'}</div>
               <div style="text-align: right; flex: 1;"><strong>Okul Müdürü</strong><br/><br/><br/>\${schoolInfo.principal || '...........................'}</div>
            </div>
            \`;
        }
    };
`;

const replaceStr = `
    const getSignatureHtml = (rowKey = null) => {
        let teacherHtml = '';
        if (isTeacher && !isGenel && rowKey) {
            teacherHtml = \`
               <td style="border: none; text-align: left; vertical-align: top; width: 33%;">
                 <strong>Aslını elden teslim aldım.</strong><br/>
                 Tarih: ...../...../20....<br/><br/><br/>
                 \${rowKey}
               </td>
            \`;
        } else {
            teacherHtml = \`<td style="border: none; width: 33%;"></td>\`;
        }

        if (forExcel) {
            return \`
            <br/>
            <table style="border: none; width: 100%;">
              <tr style="border: none;">
                 \${teacherHtml}
                 <td style="border: none; text-align: center; vertical-align: top; width: 33%;">
                    <strong>Müdür Yardımcısı</strong><br/><br/><br/>\${schoolInfo.vicePrincipal || '...........................'}
                 </td>
                 <td style="border: none; text-align: center; vertical-align: top; width: 33%;">
                    <strong>Okul Müdürü</strong><br/><br/><br/>\${schoolInfo.principal || '...........................'}
                 </td>
              </tr>
            </table>
            \`;
        } else {
            return \`
            <div class="signature-area" style="display: flex; justify-content: space-between; margin-top: 40px; text-align: center;">
               \${isTeacher && !isGenel && rowKey ? \`<div style="text-align: left; flex: 1;"><strong>Aslını elden teslim aldım.</strong><br/>Tarih: ...../...../20....<br/><br/><br/>\${rowKey}</div>\` : \`<div style="flex: 1;"></div>\`}
               <div style="text-align: center; flex: 1;"><strong>Müdür Yardımcısı</strong><br/><br/><br/>\${schoolInfo.vicePrincipal || '...........................'}</div>
               <div style="text-align: right; flex: 1;"><strong>Okul Müdürü</strong><br/><br/><br/>\${schoolInfo.principal || '...........................'}</div>
            </div>
            \`;
        }
    };
`;

code = code.replace(targetStr.trim(), replaceStr.trim());
fs.writeFileSync('src/App.tsx', code);
console.log('patched signature date');
