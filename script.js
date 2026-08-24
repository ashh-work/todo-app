(function () {
  "use strict";

  const STORAGE_KEY = "plainTodoApp.tasks";

  const form = document.querySelector("#todo-form");
  const input = document.querySelector("#todo-input");
  const list = document.querySelector("#todo-list");
  const template = document.querySelector("#todo-template");
  const count = document.querySelector("#task-count");
  const filterButtons = document.querySelectorAll(".filter-button");
  const clearCompleted = document.querySelector("#clear-completed");

  let tasks = loadTasks();
  let currentFilter = "all";

  form.addEventListener("submit", handleCreateTask);
  list.addEventListener("click", handleListClick);
  list.addEventListener("change", handleListChange);
  list.addEventListener("submit", handleEditSubmit);
  list.addEventListener("focusout", handleEditBlur);
  list.addEventListener("keydown", handleEditKeys);
  clearCompleted.addEventListener("click", handleClearCompleted);

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      currentFilter = button.dataset.filter;
      render();
    });
  });

  render();

  function handleCreateTask(event) {
    event.preventDefault();

    const title = input.value.trim();
    if (!title) return;

    tasks = [
      {
        id: createTaskId(),
        title,
        completed: false,
        createdAt: Date.now(),
      },
      ...tasks,
    ];

    input.value = "";
    saveAndRender();
  }

  function handleListClick(event) {
    const item = event.target.closest(".todo-item");
    if (!item) return;

    const id = item.dataset.id;

    if (event.target.closest(".delete-button")) {
      tasks = tasks.filter((task) => task.id !== id);
      saveAndRender();
      return;
    }

    if (event.target.closest(".edit-button")) {
      startEditing(item);
    }
  }

  function handleListChange(event) {
    if (!event.target.matches(".todo-toggle")) return;

    const item = event.target.closest(".todo-item");
    const id = item.dataset.id;

    tasks = tasks.map((task) =>
      task.id === id ? { ...task, completed: event.target.checked } : task,
    );
    saveAndRender();
  }

  function handleEditSubmit(event) {
    if (!event.target.matches(".edit-form")) return;
    event.preventDefault();
    commitEdit(event.target.closest(".todo-item"));
  }

  function handleEditBlur(event) {
    const editForm = event.target.closest(".edit-form");
    if (!editForm) return;

    window.setTimeout(() => {
      const item = editForm.closest(".todo-item");
      if (item && item.classList.contains("editing")) {
        commitEdit(item);
      }
    }, 0);
  }

  function handleEditKeys(event) {
    if (!event.target.matches(".edit-input") || event.key !== "Escape") return;
    stopEditing(event.target.closest(".todo-item"));
  }

  function handleClearCompleted() {
    tasks = tasks.filter((task) => !task.completed);
    saveAndRender();
  }

  function startEditing(item) {
    document.querySelectorAll(".todo-item.editing").forEach(stopEditing);

    const title = item.querySelector(".todo-title");
    const editForm = item.querySelector(".edit-form");
    const editInput = item.querySelector(".edit-input");

    item.classList.add("editing");
    title.hidden = true;
    editForm.hidden = false;
    editInput.value = title.textContent;
    editInput.focus();
    editInput.select();
  }

  function stopEditing(item) {
    if (!item) return;

    item.classList.remove("editing");
    item.querySelector(".todo-title").hidden = false;
    item.querySelector(".edit-form").hidden = true;
  }

  function commitEdit(item) {
    if (!item) return;

    const id = item.dataset.id;
    const editInput = item.querySelector(".edit-input");
    const nextTitle = editInput.value.trim();

    if (!nextTitle) {
      tasks = tasks.filter((task) => task.id !== id);
    } else {
      tasks = tasks.map((task) =>
        task.id === id ? { ...task, title: nextTitle } : task,
      );
    }

    saveAndRender();
  }

  function render() {
    const visibleTasks = getVisibleTasks();
    const activeCount = tasks.filter((task) => !task.completed).length;
    const completedCount = tasks.length - activeCount;

    list.replaceChildren();

    if (visibleTasks.length === 0) {
      const empty = document.createElement("li");
      empty.className = "empty-state";
      empty.textContent = getEmptyMessage();
      list.append(empty);
    } else {
      visibleTasks.forEach((task) => {
        const node = template.content.firstElementChild.cloneNode(true);
        node.dataset.id = task.id;
        node.classList.toggle("completed", task.completed);
        node.querySelector(".todo-title").textContent = task.title;
        node.querySelector(".todo-toggle").checked = task.completed;
        list.append(node);
      });
    }

    count.textContent = `${activeCount} active`;
    clearCompleted.disabled = completedCount === 0;

    filterButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.filter === currentFilter);
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.filter === currentFilter),
      );
    });
  }

  function getVisibleTasks() {
    if (currentFilter === "active") {
      return tasks.filter((task) => !task.completed);
    }

    if (currentFilter === "completed") {
      return tasks.filter((task) => task.completed);
    }

    return tasks;
  }

  function getEmptyMessage() {
    if (currentFilter === "active") return "No active tasks";
    if (currentFilter === "completed") return "No completed tasks";
    return "No tasks yet";
  }

  function saveAndRender() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    render();
  }

  function createTaskId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function loadTasks() {
    try {
      const storedTasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (!Array.isArray(storedTasks)) return [];

      return storedTasks.filter(
        (task) =>
          task &&
          typeof task.id === "string" &&
          typeof task.title === "string" &&
          typeof task.completed === "boolean",
      );
    } catch {
      return [];
    }
  }
})();
