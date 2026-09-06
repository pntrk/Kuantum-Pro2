const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `
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
        }
`;

const replaceStr = `
    const getSignatureHtml = (rowKey = null) => {
        let teacherHtml = '';
        if (isTeacher && !isGenel && rowKey) {
            teacherHtml = \`
               <td border="0" style="border: none !important; text-align: left; vertical-align: top; width: 33%;">
                 <strong>Aslını elden teslim aldım.</strong><br/>
                 Tarih: ...../...../20....<br/><br/><br/>
                 \${rowKey}
               </td>
            \`;
        } else {
            teacherHtml = \`<td border="0" style="border: none !important; width: 33%;"></td>\`;
        }

        if (forExcel) {
            return \`
            <table border="0" style="border: none !important; width: 100%;">
              <tr style="border: none !important;">
                 \${teacherHtml}
                 <td border="0" style="border: none !important; text-align: center; vertical-align: top; width: 33%;">
                    <strong>Müdür Yardımcısı</strong><br/><br/><br/>\${schoolInfo.vicePrincipal || '...........................'}
                 </td>
                 <td border="0" style="border: none !important; text-align: center; vertical-align: top; width: 33%;">
                    <strong>Okul Müdürü</strong><br/><br/><br/>\${schoolInfo.principal || '...........................'}
                 </td>
              </tr>
            </table>
            \`;
        }
`;

code = code.replace(targetStr.trim(), replaceStr.trim());
fs.writeFileSync('src/App.tsx', code);
console.log('patched excel signature HTML');
