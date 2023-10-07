document.addEventListener('DOMContentLoaded', function() {
    const taskList = document.getElementById('taskList');

    function addTask() {
        const taskName = document.getElementById('taskName').value;
        const assignee = document.getElementById('assignee').value;
        const deadline = document.getElementById('deadline').value;
        const priority = document.getElementById('priority').value;

        if (taskName.trim() === '') {
            alert('Task name cannot be empty.');
            return;
        }

        const taskItem = document.createElement('li');
        taskItem.classList.add('task');
        taskItem.innerHTML = `
            <input type="checkbox" onchange="toggleTaskStatus(this)">
            <span>${taskName}</span>
            <span>Assignee: ${assignee}</span>
            <span>Deadline: ${deadline}</span>
            <span class="priority ${priority}">Priority: ${priority}</span>
        `;

        taskList.appendChild(taskItem);

        // Clear input fields after adding a task
        document.getElementById('taskName').value = '';
        document.getElementById('assignee').value = '';
        document.getElementById('deadline').value = '';
    }

    function toggleTaskStatus(checkbox) {
        const taskItem = checkbox.parentElement;
        if (checkbox.checked) {
            taskItem.classList.add('completed');
        } else {
            taskItem.classList.remove('completed');
        }
    }

    document.getElementById('addTaskButton').addEventListener('click', addTask);
});

app.all(/api/, function(req, res, next){
    console.log(`\n${req.method} ${req.url} --> ${JSON.stringify(req.body, '\t', 2)}`);
    res.status(200).end();
  })

  