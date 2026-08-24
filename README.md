# Todo List

A simple client-side Todo List application built with plain HTML, CSS, and JavaScript.

## Features

- Add new tasks
- View all saved tasks
- Mark tasks as completed or active
- Edit existing tasks
- Delete tasks
- Clear all completed tasks
- Filter tasks by All, Active, and Completed
- Save tasks automatically with `window.localStorage`
- Keep data after refreshing or reopening the browser

## Project Structure

```text
todo-app/
├── index.html
├── styles.css
├── script.js
└── README.md
```

## How To Run

Open `index.html` directly in your browser.

No installation, build step, libraries, or frameworks are required.

## How It Works

The app keeps all tasks in a JavaScript state array. Whenever a task is created, edited, completed, or deleted, the state is saved to `localStorage` and the task list is re-rendered in the DOM.

Event delegation is used on the task list so dynamically created task elements can handle edit, delete, and completion actions without attaching separate listeners to every item.
