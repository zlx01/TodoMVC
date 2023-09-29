import './App.css';
import { useEffect, useRef, useState } from "react";

function App() {
  const STORAGE_KEY = 'react-todomvc'
  const filters = {
    all: (todos) => todos,
    active: (todos) => todos.filter((todo) => !todo.completed),
    completed: (todos) => todos.filter((todo) => todo.completed)
  }

  const [todos, setTodos] = useState(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'))
  const [visibility, setVisibility] = useState('all')
  const [editedTodo, setEditedTodo] = useState(null)

  // 获取的状态
  const filteredTodos = filters[visibility](todos)
  const remaining = filters.active(todos).length
  const beforeEditCache = useRef('');

  // 处理路由
  useEffect(() => {
    window.addEventListener('hashchange', onHashChange)
    onHashChange()
  }, [])

  // 状态持久化
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  }, [todos])

  function toggleAll(e) {
    const newTodos = todos.map((todo) => {
      return {
        ...todo,
        completed: e.target.checked
      }
    })
    setTodos(newTodos)
  }

  function addTodo(e) {
    if (e.code !== 'Enter') {
      return
    }

    const value = e.target.value.trim()
    if (value) {
      const newTodo = {
        id: Date.now(),
        title: value,
        completed: false
      }
      setTodos([...todos, newTodo])
      e.target.value = ''
    }
  }

  function removeTodo(todo) {
    const newTodos = todos.filter((item) => item.id !== todo.id)
    setTodos(newTodos)
  }

  function editTodo(todo) {
    beforeEditCache.current = todo.title
    setEditedTodo(todo)
  }

  function cancelEdit(todo) {
    setEditedTodo(null)
    const newTodos = todos.map((item) => {
      if (item.id === todo.id) {
        return {
          ...item,
          title: beforeEditCache.current,
        }
      }
      return item
    })
    setTodos(newTodos)
  }

  function doneEdit(todo) {
    if (editedTodo) {
      setEditedTodo(null)
      const title = todo.title.trim()
      const newTodos = todos.map((item) => {
        if (item.id === todo.id) {
          return {
            ...item,
            title,
          }
        }
        return item
      })
      setTodos(newTodos)
      if (!title) removeTodo(todo)
    }
  }

  function keyupWhenEditing(todo, event) {
    if (event.code === 'Enter') {
      doneEdit(todo)
    } else if (event.code === 'Escape') {
      cancelEdit(todo)
    }
  }

  function removeCompleted() {
    setTodos(filters.active(todos))
  }

  function onHashChange() {
    const route = window.location.hash.replace(/#\/?/, '')
    if (filters[route]) {
      setVisibility(route)
    } else {
      window.location.hash = ''
      setVisibility('all')
    }
  }

  function onTodoChecked(todo, e) {
    const newTodos= todos.map((item) => {
      if (item.id === todo.id) {
        return {
          ...item,
          completed: e.target.checked,
        }
      }
      return item
    })
    setTodos(newTodos)
  }

  function onTodoChange(todo, e) {
    const newTodos= todos.map((item) => {
      if (item.id === todo.id) {
        return {
          ...item,
          title: e.target.value,
        }
      }
      return item
    })
    setTodos(newTodos)
  }

  return (
    <section className="todoapp">
      <header className="header">
        <h1>todos</h1>
        <input
          className="new-todo"
          autoFocus
          placeholder="What needs to be done?"
          onKeyUp={addTodo}
        />
      </header>
      {
        (todos.length > 0) &&
        <section className="main">
          <input
            id="toggle-all"
            className="toggle-all"
            type="checkbox"
            checked={remaining === 0}
            onChange={toggleAll}
          />
          <label htmlFor="toggle-all">Mark all as complete</label>
          <ul className="todo-list">
            {
              filteredTodos.map((todo) =>
                // 注意这里 todo.id === editedTodo?.id 要比对 id，不能直接比对 todo 和 editedTodo
                <li
                  key={todo.id}
                  className={`todo ${todo.completed ? 'completed' : ''} ${todo.id === editedTodo?.id ? 'editing' : ''}`}
                >
                  <div className="view">
                    <input className="toggle" type="checkbox" checked={todo.completed}
                           onChange={e => onTodoChecked(todo, e)}
                    />
                    <label onDoubleClick={() => editTodo(todo)}>{todo.title}</label>
                    <button className="destroy" onClick={() => removeTodo(todo)}></button>
                  </div>
                  {
                    todo.id === editedTodo?.id &&
                    <input
                      className="edit"
                      type="text"
                      value={todo.title}
                      onChange={(e) => onTodoChange(todo, e)}
                      onBlur={() => doneEdit(todo)}
                      onKeyUp={(e) => keyupWhenEditing(todo, e)}
                    />
                  }
                </li>
              )
            }
          </ul>
        </section>
      }
      {
        // https://zh-hans.react.dev/learn/conditional-rendering#logical-and-operator-
        // 注意这里要用 todos.length > 0，不能用 todos.length，要不然会渲染出一个0
        (todos.length > 0) &&
        <footer className="footer">
            <span className="todo-count">
              <strong>{remaining}</strong>
              <span>{remaining === 1 ? ' item' : ' items'} left</span>
            </span>
          <ul className="filters">
            <li>
              <a href="#/all" className={visibility === 'all' ? 'selected' : ''}>All</a>
            </li>
            <li>
              <a href="#/active" className={visibility === 'all' ? 'active' : ''}>Active</a>
            </li>
            <li>
              <a href="#/completed" className={visibility === 'completed' ? 'completed' : ''}>Completed</a>
            </li>
          </ul>
          {
            (todos.length > remaining) &&
            <button className="clear-completed" onClick={removeCompleted}>
              Clear completed
            </button>
          }
        </footer>
      }
    </section>
  );
}

export default App;
