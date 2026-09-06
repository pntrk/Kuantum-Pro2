const fs = require('fs');

const file = fs.readFileSync('src/App.tsx', 'utf8');
if (!file.includes('motion/react')) {
    const updated = file.replace(
        "import React, { useState, useRef, useEffect } from 'react';",
        "import React, { useState, useRef, useEffect } from 'react';\nimport { motion, AnimatePresence } from 'motion/react';"
    );
    fs.writeFileSync('src/App.tsx', updated);
    console.log("Imports updated");
} else {
    console.log("Already imported");
}
