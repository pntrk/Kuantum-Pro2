const fs = require('fs');

global.self = {
    postMessage: (msg) => {
        console.log('Main thread received:', msg.type, msg.progress !== undefined ? msg.progress : '');
        if (msg.type === 'error') console.error('CRASH:', msg.message);
    }
};

require('./dist/assets/quantum-ChMGzQyp.js');

const mockData = {
    unplacedCourses: [
      {id: '1', teachers: ['A'], classes: ['10A'], subject: 'Math', hours: 2, fromBoard: false}
    ],
    schoolSettings: { weekDays: Array.from({length: 5}, (_, i) => ({id: i+1, active: true, periods: 8})) },
    schedules: {
        'A': [
            ...Array(7).fill(0).map(() => Array(15).fill(''))
        ]
    },
    classSchedules: {},
    roomSchedules: {},
    lockedCells: {},
    constraints: {},
    workerIndex: 0
};

self.onmessage({ data: mockData });
setTimeout(() => console.log('Done waiting.'), 1000);
