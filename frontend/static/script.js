// Get CSRF token
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const csrftoken = getCookie('csrftoken');

// Build task list
function buildList() {
    const wrapper = document.getElementById('list-wrapper');
    wrapper.innerHTML = '';

    const url = 'http://127.0.0.1:8000/api/task-list/';
    fetch(url)
        .then((resp) => resp.json())
        .then((data) => {
            const list = data;
            for (const i in list) {
                try {
                    document.getElementById(`data-row-${i}`).remove();
                } catch (err) {}

                const title = list[i].completed
                    ? `<strike class="title">${list[i].title}</strike>`
                    : `<span class="title">${list[i].title}</span>`;

                const item = `
                    <div id="data-row-${i}" class="task-wrapper flex-wrapper">
                        <div style="flex:7">${title}</div>
                        <div style="flex:1">
                            <button class="btn btn-sm btn-outline-info edit">Edit</button>
                        </div>
                        <div style="flex:1">
                            <button class="btn btn-sm btn-outline-dark delete">-</button>
                        </div>
                    </div>
                `;
                wrapper.innerHTML += item;
            }

            // Remove extra items from previous list
            if (list_snapshot.length > list.length) {
                for (let i = list.length; i < list_snapshot.length; i++) {
                    document.getElementById(`data-row-${i}`).remove();
                }
            }

            list_snapshot = list;

            // Add event listeners
            for (const i in list) {
                const editBtn = document.getElementsByClassName('edit')[i];
                const deleteBtn = document.getElementsByClassName('delete')[i];
                const title = document.getElementsByClassName('title')[i];

                editBtn.addEventListener('click', () => editItem(list[i]));
                deleteBtn.addEventListener('click', () => deleteItem(list[i]));
                title.addEventListener('click', () => strikeUnstrike(list[i]));
            }
        });
}

// Form submission handler
const form = document.getElementById('form');
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = 'http://127.0.0.1:8000/api/task-create/';
    if (activeItem) {
        url = `http://127.0.0.1:8000/api/task-update/${activeItem.id}/`;
        activeItem = null;
    }

    const title = document.getElementById('title').value;

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-type': 'application/json',
            'X-CSRFToken': csrftoken,
        },
        body: JSON.stringify({ title }),
    })
        .then((response) => {
            buildList();
            document.getElementById('form').reset();
        })
        .catch((error) => console.error('Error:', error));
});

// Edit item
let activeItem = null;
function editItem(item) {
    activeItem = item;
    document.getElementById('title').value = activeItem.title;
}

// Delete item
function deleteItem(item) {
    fetch(`http://127.0.0.1:8000/api/task-delete/${item.id}/`, {
        method: 'DELETE',
        headers: {
            'Content-type': 'application/json',
            'X-CSRFToken': csrftoken,
        },
    })
        .then((response) => buildList())
        .catch((error) => console.error('Error:', error));
}

// Strike/unstrike item
function strikeUnstrike(item) {
    item.completed = !item.completed;
    fetch(`http://127.0.0.1:8000/api/task-update/${item.id}/`, {
        method: 'POST',
        headers: {
            'Content-type': 'application/json',
            'X-CSRFToken': csrftoken,
        },
        body: JSON.stringify({ title: item.title, completed: item.completed }),
    })
        .then((response) => buildList())
        .catch((error) => console.error('Error:', error));
}

let list_snapshot = [];
buildList();