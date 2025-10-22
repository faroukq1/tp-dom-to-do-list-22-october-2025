const input = document.getElementById('taskInput');
const task_list = document.querySelector('.list-container');
const error_message = document.querySelector('.errorMessage');
const add_button = document.querySelector('.add');
const save_to_local_stoage_button = document.querySelector('.save-all-elements');
let storage = [];

document.addEventListener('DOMContentLoaded', () => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
        const taskData = JSON.parse(savedTasks);
        taskData.forEach(task => {
            const newItem = create_task(task.text, task.completed);
            task_list.append(newItem);
            storage.push({ id: newItem.id, text: task.text, completed: task.completed });
        });
    }
});

const saveToLocalStorage = () => {
    const tasksToSave = storage.map(item => ({
        id: item.id,
        text: item.text,
        completed: item.completed || false
    }));
    localStorage.setItem('tasks', JSON.stringify(tasksToSave));
};


const create_task = (taskName, completed = false) => {
    const list = document.createElement('li');
    // create random id between 1 and 1e6
    list.setAttribute('id', parseInt(Math.random() * 1e6));
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = completed;
    checkbox.classList.add('task-checkbox');
    checkbox.addEventListener('change', (e) => {
        const taskId = list.id;
        const taskIndex = storage.findIndex(item => item.id === taskId);
        if (taskIndex !== -1) {
            storage[taskIndex].completed = e.target.checked;
            saveToLocalStorage();
            if (e.target.checked) {
                item_text_wrapper.style.textDecoration = 'line-through';
            } else {
                item_text_wrapper.style.textDecoration = 'none';
            }
        }
    });
    
    const item_text_wrapper = document.createElement('span');
    item_text_wrapper.innerText = taskName;
    if (completed) {
        item_text_wrapper.style.textDecoration = 'line-through';
    }
    
    const button_wrapper = document.createElement('div');
    button_wrapper.classList.add('button-container');
    const modify_button = document.createElement('button');
    modify_button.innerText = 'modify';
    modify_button.classList.add('modify');
    const delete_button = document.createElement('button');
    delete_button.innerText = 'delete';
    delete_button.classList.add('delete');

    button_wrapper.append(modify_button);
    button_wrapper.append(delete_button);

    list.append(checkbox);
    list.append(item_text_wrapper);
    list.append(button_wrapper);

    return list;

}

input.addEventListener('input', () => {
    if (input.value.trim().length > 0) {
        error_message.classList.remove('show-error-message');
    }
});

add_button.addEventListener('click', () => {
    if (input.value.trim().length === 0) {
        error_message.classList.add('show-error-message');
        return;
    }
    const input_value = input.value.trim();
    const new_item = create_task(input_value, false);
    task_list.append(new_item);
    storage.push({ id: new_item.id, text: input_value, completed: false });
    saveToLocalStorage();
    input.value = '';
    error_message.classList.remove('show-error-message');
});

task_list.addEventListener('click', (e) => {
    const item_selected = e.target
    const delete_item = item_selected.className === 'delete';
    let modify_item = item_selected.className === 'modify';
    
    
    if (delete_item) {
        const selected_item_to_remove = item_selected.parentNode.parentNode;
        const itemId = selected_item_to_remove.id;
        task_list.removeChild(selected_item_to_remove);
        storage = storage.filter(item => item.id !== itemId);
        saveToLocalStorage();
        return;
    }


    if (modify_item) {
        const selected_item_to_modify = item_selected.parentNode.parentNode;
        // the structure is: [checkbox, span, button_wrapper]
        const checkbox = selected_item_to_modify.querySelector('.task-checkbox');
        const span_node = selected_item_to_modify.querySelector('span');
        const current_text = span_node ? span_node.innerText : '';

        // Remove the span from DOM entirely
        if (span_node) selected_item_to_modify.removeChild(span_node);

        // Create input in place of the span
        const modify_input_wrapper = document.createElement('div');

        const modify_input = document.createElement('input');
        modify_input.type = 'text';
        modify_input.classList.add('modify-input');
        modify_input.id = 'modify-input-id';
        modify_input.value = current_text;

        const submit = document.createElement('button');
        submit.innerText = 'save';
        submit.classList.add('submit-button');

        modify_input_wrapper.append(modify_input);
        modify_input_wrapper.append(submit);

        // Insert wrapper after checkbox (at index 1)
        const referenceNode = checkbox ? checkbox.nextSibling : selected_item_to_modify.firstChild;
        selected_item_to_modify.insertBefore(modify_input_wrapper, referenceNode);

        error_message.classList.remove('show-error-message');

        modify_input.addEventListener('input', () => {
            if (modify_input.value.trim().length > 0) {
                error_message.classList.remove('show-error-message');
            } else {
                error_message.classList.add('show-error-message');
            }
        });

        submit.addEventListener('click', () => {
            const new_value = modify_input.value.trim();
            if (new_value.length === 0) {
                error_message.classList.add('show-error-message');
                return;
            }

            // Recreate the span with updated text
            const new_span = document.createElement('span');
            new_span.innerText = new_value;

            // Preserve visual completed state from storage
            const itemId = selected_item_to_modify.id;
            const itemIndex = storage.findIndex(item => item.id === itemId);
            const completed = itemIndex !== -1 ? !!storage[itemIndex].completed : false;
            if (completed) new_span.style.textDecoration = 'line-through';

            // Insert the new span where the input wrapper was
            selected_item_to_modify.insertBefore(new_span, modify_input_wrapper);

            // Remove the input wrapper
            selected_item_to_modify.removeChild(modify_input_wrapper);

            // Update storage and localStorage
            if (itemIndex !== -1) {
                storage[itemIndex].text = new_value;
                storage[itemIndex].completed = completed;
                saveToLocalStorage();
            }

            modify_item = false;
        });
    }
})
