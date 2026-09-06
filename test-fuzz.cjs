const fs = require('fs');

global.self = {
    postMessage: (msg) => {
        if(msg.type === 'error') console.log('ERROR TRACE?', msg.message);
    }
};

require('./quantum.cjs');

const mockData = {
    unplacedCourses: [
      {id: '1', teachers: ['A'], classes: ['10A'], subject: 'Math', hours: 2, fromBoard: false}
    ],
    schoolSettings: { weekDays: Array.from({length: 5}, (_, i) => ({id: i+1, active: true, periods: 8})) },
    schedules: {
        'A': [
            // d=0 to 6
            ...Array(7).fill(0).map(() => Array(15).fill(''))
        ]
    },
    classSchedules: {},
    roomSchedules: {},
    lockedCells: {},
    constraints: {},
    workerIndex: 0
};

// Add a corrupt schedule cell
mockData.schedules['A'][0][0] = JSON.stringify({id: '2', classes: ['10A'], teachers: ['A'], subject: 'Math', hours: 2, d: undefined});

self.onmessage({ data: mockData });
