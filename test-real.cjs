const mockData = {
    unplacedCourses: [
      {id: '1', teachers: ['A'], classes: ['10A'], subject: 'Math', hours: 2, fromBoard: false},
    ],
    schoolSettings: { weekDays: Array.from({length: 5}, (_, i) => ({id: i+1, active: true, periods: 8})) },
    schedules: {},
    classSchedules: {},
    roomSchedules: {},
    lockedCells: {},
    constraints: {},
    workerIndex: 0
};

global.self = {
    postMessage: (msg) => {
        if(msg.type === 'error') console.log('ERROR TRACE?', msg.message, new Error().stack);
        console.log('POSTMESSAGE:', msg)
    }
};
require('./quantum.cjs');
self.onmessage({ data: mockData });
