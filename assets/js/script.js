// Retrieve tasks and nextId from localStorage
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let nextId = JSON.parse(localStorage.getItem('nextId')) || 1;

// Todo: create a function to generate a unique task id
function generateTaskId() {
  return nextId++;
}
// Todo: create a function to create a task card
function createTaskCard(task) {
  // Calculate the difference between the due date and today's date
  const today = new Date();
  const dueDate = new Date(task.dueDate);
  const timeDifference = dueDate.getTime() - today.getTime();
  const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));
  // Define background color and font color based on the difference in days
  let backgroundColorClass = '';
  let fontColorClass = '';
  let deleteBoxColorClass = ''; // Color class for delete box border
  let titleBackgroundColorClass = ''; // Color class for title background box
  let titleHeaderClass = ''; // Class to style title as a header
  if (daysDifference < 0) {
    backgroundColorClass = 'bg-danger'; // past due (red background)
    fontColorClass = 'text-white'; // white font color for past due
    deleteBoxColorClass = 'border border-white'; // white border around delete box for past due
    titleBackgroundColorClass = 'bg-dark-red'; // darker red background for title
    titleHeaderClass = 'fs-5 fw-bold'; // Font weight bold for past due title
  } else if (daysDifference === 0) {
    backgroundColorClass = 'bg-warning'; // due today (yellow background)
    fontColorClass = 'text-white'; // white font color for due today
    titleBackgroundColorClass = 'bg-dark-yellow'; // darker yellow background for title
    titleHeaderClass = 'fs-5 fw-bold'; // Font weight bold for due today title
  } else {
    fontColorClass = 'text-black'; // future due (black font color)
    titleBackgroundColorClass = 'bg-gray'; // gray background for title
    titleHeaderClass = 'fs-5'; // Default font size for future due title
  }
  // Create task card HTML dynamically
  const card = `
    <div class="card task-card mb-3 ${backgroundColorClass}" data-id="${task.id}">
      <div class="card-body ${fontColorClass}">
        <div class="title-container ${titleBackgroundColorClass} mb-2 p-1 rounded"> <!-- Add different background color for title container -->
          <h5 class="card-title ${fontColorClass} ${titleHeaderClass} m-0">${task.title}</h5>
        </div>
        <p class="card-text mb-1">${task.description}</p>
        <p class="card-text">Due: ${task.dueDate}</p>
        <button type="button" class="btn btn-danger btn-sm delete-task ${deleteBoxColorClass}">Delete</button>
      </div>
    </div>
  `;
  return card;
}
// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
  // Clear existing task cards
  $('#todo-cards, #in-progress-cards, #done-cards').empty();
  // Loop through tasks and append cards to respective lanes
  tasks.forEach(task => {
    const card = createTaskCard(task);
    $(`#${task.status}-cards`).append(card);
  });
  // Make task cards draggable
  $('.task-card').draggable({
    revert: true,
    revertDuration: 0
  });
}
// Todo: create a function to handle adding a new task
function handleAddTask(event) {
  event.preventDefault();
  const title = $('#task-title').val().trim();
  const description = $('#task-description').val().trim();
  const dueDate = $('#datepicker').val();
  if (!title || !dueDate) return;
  const newTask = {
    id: generateTaskId(),
    title: title,
    description: description,
    dueDate: dueDate,
    status: 'todo'
  };
  tasks.push(newTask);
  localStorage.setItem('tasks', JSON.stringify(tasks));
  localStorage.setItem('nextId', nextId);
  renderTaskList();
  // Clear input fields and close modal
  $('#task-title, #task-description, #datepicker').val('');
  $('#formModal').modal('hide');
}
// Todo: create a function to handle deleting a task
function handleDeleteTask(event) {
  const taskId = $(event.target).closest('.task-card').data('id');
  tasks = tasks.filter(task => task.id !== taskId);
  localStorage.setItem('tasks', JSON.stringify(tasks));
  renderTaskList();
}
// Todo: create a function to handle starting to drag a task
function handleDragStart(event, ui) {
  ui.helper.css('z-index', '1000'); // Set a high z-index to ensure the dragged task card stays above other elements
}
// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
  const taskId = ui.draggable.data('id'); // Get the id of the dropped task
  const newStatus = $(this).attr('id'); // Get the id of the status lane where the task was dropped
  // Find the task in the tasks array and update its status
  const taskIndex = tasks.findIndex(task => task.id === taskId);
  if (taskIndex !== -1) {
    tasks[taskIndex].status = newStatus;
    localStorage.setItem('tasks', JSON.stringify(tasks)); // Update tasks in localStorage
    renderTaskList(); // Re-render the task list
  }
  ui.helper.css('z-index', 'auto');
}
// Event listeners
$(document).ready(function () {
  // Initialize datepicker
  $("#datepicker").datepicker({
    changeMonth: true,
    changeYear: true
  });
  // Render task list and make lanes droppable
  renderTaskList();
  $('.lane').droppable({
    accept: '.task-card',
    drop: handleDrop
  });
  // Add task event listener
  $('#add-task').on('click', handleAddTask);
  // Delete task event listener
  $(document).on('click', '.delete-task', handleDeleteTask);
  // Make task cards draggable
  $('.task-card').draggable({
    revert: 'invalid', // Snap back if not dropped in a droppable area
    start: handleDragStart // Call handleDragStart function when drag starts
  });
});