class TodoList {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.currentFilter = 'all';
        this.editingId = null;
        
        this.initializeElements();
        this.bindEvents();
        this.render();
    }
    
    initializeElements() {
        this.todoInput = document.getElementById('todoInput');
        this.addBtn = document.getElementById('addBtn');
        this.todoList = document.getElementById('todoList');
        this.itemsLeft = document.getElementById('itemsLeft');
        this.clearCompletedBtn = document.getElementById('clearCompleted');
        this.emptyState = document.getElementById('emptyState');
        this.filterBtns = document.querySelectorAll('.filter-btn');
    }
    
    bindEvents() {
        this.addBtn.addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });
        
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
        
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });
    }
    
    addTodo() {
        const text = this.todoInput.value.trim();
        if (!text) return;
        
        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        this.todos.unshift(todo);
        this.saveToStorage();
        this.render();
        
        this.todoInput.value = '';
        this.todoInput.focus();
        
        // Success animation
        this.addBtn.classList.add('success');
        setTimeout(() => this.addBtn.classList.remove('success'), 600);
    }
    
    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveToStorage();
            this.render();
        }
    }
    
    deleteTodo(id) {
        this.todos = this.todos.filter(t => t.id !== id);
        this.saveToStorage();
        this.render();
    }
    
    startEdit(id) {
        this.editingId = id;
        this.render();
        
        const editInput = document.querySelector(`[data-edit-id="${id}"]`);
        if (editInput) {
            editInput.focus();
            editInput.select();
        }
    }
    
    saveEdit(id, newText) {
        const todo = this.todos.find(t => t.id === id);
        if (todo && newText.trim()) {
            todo.text = newText.trim();
            this.saveToStorage();
        }
        this.editingId = null;
        this.render();
    }
    
    cancelEdit() {
        this.editingId = null;
        this.render();
    }
    
    clearCompleted() {
        this.todos = this.todos.filter(t => !t.completed);
        this.saveToStorage();
        this.render();
    }
    
    setFilter(filter) {
        this.currentFilter = filter;
        
        this.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        this.render();
    }
    
    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter(t => !t.completed);
            case 'completed':
                return this.todos.filter(t => t.completed);
            default:
                return this.todos;
        }
    }
    
    render() {
        const filteredTodos = this.getFilteredTodos();
        
        if (this.todos.length === 0) {
            this.todoList.style.display = 'none';
            this.emptyState.classList.add('show');
        } else {
            this.todoList.style.display = 'block';
            this.emptyState.classList.remove('show');
        }
        
        this.todoList.innerHTML = filteredTodos.map(todo => this.renderTodoItem(todo)).join('');
        
        // Update items left count
        const activeCount = this.todos.filter(t => !t.completed).length;
        this.itemsLeft.textContent = `${activeCount} item${activeCount !== 1 ? 's' : ''} left`;
        
        // Show/hide clear completed button
        const completedCount = this.todos.filter(t => t.completed).length;
        this.clearCompletedBtn.style.display = completedCount > 0 ? 'inline' : 'none';
        
        // Bind events for dynamically created elements
        this.bindTodoEvents();
    }
    
    renderTodoItem(todo) {
        const isEditing = this.editingId === todo.id;
        
        if (isEditing) {
            return `
                <div class="todo-item editing" data-id="${todo.id}">
                    <input type="text" 
                           class="edit-input" 
                           data-edit-id="${todo.id}"
                           value="${this.escapeHtml(todo.text)}"
                           maxlength="100">
                    <div class="todo-actions">
                        <button class="action-btn save-btn" data-id="${todo.id}">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="action-btn cancel-btn" data-id="${todo.id}">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
                <input type="checkbox" 
                       class="todo-checkbox" 
                       data-id="${todo.id}"
                       ${todo.completed ? 'checked' : ''}>
                <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                <div class="todo-actions">
                    <button class="action-btn edit-btn" data-id="${todo.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" data-id="${todo.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }
    
    bindTodoEvents() {
        // Checkbox events
        document.querySelectorAll('.todo-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.toggleTodo(parseInt(e.target.dataset.id));
            });
        });
        
        // Edit button events
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.startEdit(parseInt(e.target.closest('.action-btn').dataset.id));
            });
        });
        
        // Delete button events
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.deleteTodo(parseInt(e.target.closest('.action-btn').dataset.id));
            });
        });
        
        // Save edit events
        document.querySelectorAll('.save-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.closest('.action-btn').dataset.id);
                const input = document.querySelector(`[data-edit-id="${id}"]`);
                this.saveEdit(id, input.value);
            });
        });
        
        // Cancel edit events
        document.querySelectorAll('.cancel-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.cancelEdit();
            });
        });
        
        // Edit input events
        document.querySelectorAll('.edit-input').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const id = parseInt(e.target.dataset.editId);
                    this.saveEdit(id, e.target.value);
                }
            });
            
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.cancelEdit();
                }
            });
        });
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    saveToStorage() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TodoList();
});

// Add some sample todos for demonstration (remove this in production)
if (!localStorage.getItem('todos')) {
    const sampleTodos = [
        { id: 1, text: 'Welcome to your new To-Do List!', completed: false, createdAt: new Date().toISOString() },
        { id: 2, text: 'Click the checkbox to mark as complete', completed: true, createdAt: new Date().toISOString() },
        { id: 3, text: 'Use the edit button to modify tasks', completed: false, createdAt: new Date().toISOString() },
        { id: 4, text: 'Try the filters to organize your tasks', completed: false, createdAt: new Date().toISOString() }
    ];
    localStorage.setItem('todos', JSON.stringify(sampleTodos));
} 