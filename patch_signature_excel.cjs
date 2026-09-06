const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace how getSignatureHtml is called in BOTH places (Genel and El Programi)
// First, find the getSignatureHtml function.
const sigFuncStr = `
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

const newSigFuncStr = `
    const getSignatureHtml = (rowKey = null) => {
        let teacherHtml = '';
        if (isTeacher && !isGenel && rowKey) {
            teacherHtml = \`
               <td colspan="2" style="border: none; text-align: left; vertical-align: bottom;">
                 <strong>Aslını elden teslim aldım.</strong><br/>
                 Tarih: ...../...../20....<br/><br/><br/>
                 \${rowKey}
               </td>
            \`;
        } else {
            teacherHtml = \`<td colspan="2" style="border: none;"></td>\`;
        }

        if (forExcel) {
            // How many columns total? 1 for SAAT + activeDays.length
            const totalCols = activeDays.length + 1;
            // Distribute across totalCols. Let's say we have 6 columns.
            // teacherHtml can take 2, vice takes 2, principal takes 2.
            // We just use colspan.
            const col1 = Math.floor(totalCols / 3) || 1;
            const col2 = Math.floor(totalCols / 3) || 1;
            const col3 = totalCols - col1 - col2;
            
            let tHtml = '';
            if (isTeacher && !isGenel && rowKey) {
                tHtml = \`
                   <td colspan="\${col1}" style="border: none; text-align: left; vertical-align: bottom; font-size: 14px;">
                     <br/><br/>
                     <strong>Aslını elden teslim aldım.</strong><br/>
                     Tarih: ...../...../20....<br/><br/><br/><br/>
                     <strong>\${rowKey}</strong>
                   </td>
                \`;
            } else {
                tHtml = \`<td colspan="\${col1}" style="border: none;"></td>\`;
            }

            return \`
              <tr style="border: none;">
                 \${tHtml}
                 <td colspan="\${col2}" style="border: none; text-align: center; vertical-align: bottom; font-size: 14px;">
                    <br/><br/>
                    <strong>Müdür Yardımcısı</strong><br/><br/><br/><br/><strong>\${schoolInfo.vicePrincipal || '...........................'}</strong>
                 </td>
                 <td colspan="\${col3}" style="border: none; text-align: center; vertical-align: bottom; font-size: 14px;">
                    <br/><br/>
                    <strong>Okul Müdürü</strong><br/><br/><br/><br/><strong>\${schoolInfo.principal || '...........................'}</strong>
                 </td>
              </tr>
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

code = code.replace(sigFuncStr.trim(), newSigFuncStr.trim());

// Now fix the calls to put it inside the tbody if forExcel.
code = code.replace(/htmlContent \+= \`<\/tbody><\/table>\`;\s*htmlContent \+= getSignatureHtml\(\);\s*htmlContent \+= \`<\/div>\`;/g, 
`
       if (forExcel) {
           htmlContent += getSignatureHtml();
           htmlContent += \`</tbody></table></div>\`;
       } else {
           htmlContent += \`</tbody></table>\`;
           htmlContent += getSignatureHtml();
           htmlContent += \`</div>\`;
       }
`);

code = code.replace(/htmlContent \+= \`<\/tbody><\/table>\`;\s*htmlContent \+= getSignatureHtml\(key\);\s*htmlContent \+= \`<\/div>\`;/g, 
`
         if (forExcel) {
             htmlContent += getSignatureHtml(key);
             htmlContent += \`</tbody></table></div>\`;
         } else {
             htmlContent += \`</tbody></table>\`;
             htmlContent += getSignatureHtml(key);
             htmlContent += \`</div>\`;
         }
`);

fs.writeFileSync('src/App.tsx', code);
console.log('patched signature excel inner table');
