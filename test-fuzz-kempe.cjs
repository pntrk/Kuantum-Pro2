const fs = require('fs');

global.self = {
    postMessage: (msg) => {
        if(msg.type === 'error') console.log('ERROR TRACE?', msg.message);
    }
};

require('./dist/assets/quantum-2a25H3R7.js'); // Use the compiled worker

const mockData = {
    unplacedCourses: [
      {id: '1', teachers: ['A'], classes: ['10A'], subject: 'Math', hours: 2, fromBoard: false}
    ],
    schoolSettings: { weekDays: Array.from({length: 1}, (_, i) => ({id: i+1, active: true, periods: 2})) },
    schedules: {
        'A': [
            // only one day with 2 periods.
            // Let's place a card in period 0,1.
            ['{\"id\":\"2\",\"classes\":[\"10A\"],\"teachers\":[\"A\"],\"subject\":\"Sci\",\"hours\":2}', '{\"id\":\"2\",\"classes\":[\"10A\"],\"teachers\":[\"A\"],\"subject\":\"Sci\",\"hours\":2}', '', '', '', '', '', '', '', '', '', '', '', '', ''],
            ...Array(6).fill(0).map(() => Array(15).fill(''))
        ]
    },
    classSchedules: {},
    roomSchedules: {},
    lockedCells: {},
    constraints: {},
    workerIndex: 0
};

self.onmessage({ data: mockData });
