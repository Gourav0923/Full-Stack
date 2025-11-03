const rl = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let emps = [];

function menu() {
  console.log('\nEmployee Management System');
  console.log('1. Add employee');
  console.log('2. List employees');
  console.log('3. Remove employee');
  console.log('4. Exit');

  rl.question('\nEnter your choice: ', c => {
    switch (c.trim()) {
      case '1':
        add();
        break;
      case '2':
        list();
        break;
      case '3':
        remove();
        break;
      case '4':
        rl.close();
        break;
      default:
        console.log('Invalid choice.');
        menu();
    }
  });
}

function add() {
  rl.question('Enter employee name: ', n => {
    rl.question('Enter employee id: ', i => {
      emps.push({ n, i });
      console.log(`Employee ${n} (id: ${i}) added successfully.`);
      menu();
    });
  });
}

function list() {
  console.log('\nEmployee List:');
  if (emps.length === 0) {
    console.log('No employees found.');
  } else {
    emps.forEach((e, idx) => {
      console.log(`${idx + 1}. Name: ${e.n}, ID: ${e.i}`);
    });
  }
  menu();
}

function remove() {
  rl.question('Enter employee id to remove: ', i => {
    const idx = emps.findIndex(e => e.i === i.trim());
    if (idx !== -1) {
      const emp = emps.splice(idx, 1)[0];
      console.log(`Employee ${emp.n} (id: ${emp.i}) removed successfully.`);
    } else {
      console.log('Employee not found.');
    }
    menu();
  });
}

menu();
