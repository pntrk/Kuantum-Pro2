import fs from 'fs';

let fileContent = fs.readFileSync('src/services/googleDriveService.ts', 'utf8');

fileContent = fileContent.replace(
  /export const downloadDriveBackupFile = async.*?\{[\s\S]*?const res = await fetch\([\s\S]*?`/m,
  `export const downloadDriveBackupFile = async (token: string, fileId: string): Promise<any> => {
  try {
    const res = await fetch(
      \`https://www.googleapis.com/drive/v3/files/\${fileId}?alt=media&t=\${Date.now()}\`,`
);

fileContent = fileContent.replace(
  /headers: \{\s*Authorization: `Bearer \$\{token\}`\s*\}/m,
  `headers: {
          Authorization: \`Bearer \$\{token\}\`
        },
        cache: 'no-store'`
);

// We also need to patch uploadDriveBackupFile to use multipart/related

fs.writeFileSync('src/services/googleDriveService.ts', fileContent);
