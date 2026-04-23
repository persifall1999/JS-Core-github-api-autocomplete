const wrapperContainer = document.createElement('div');
wrapperContainer.classList.add('wrapper-container');

const repoContainer = document.createElement('div');
repoContainer.classList.add('container');

const searchWrapper = document.createElement('div');
searchWrapper.classList.add('search-wrapper');

const searchInput = document.createElement('input');
searchInput.type = 'text';
searchInput.id = 'search-input';
searchInput.classList.add('search-input');
searchInput.placeholder = 'Название репозитория';
searchInput.setAttribute('autocomplete', 'off');

const autocompleteList = document.createElement('ul');
autocompleteList.classList.add('autocomplete-list');

const repoList = document.createElement('ul');
repoList.classList.add('repo-list');

document.body.append(wrapperContainer);
wrapperContainer.append(repoContainer)
repoContainer.append(searchWrapper, repoList);
searchWrapper.append(searchInput, autocompleteList);

function debounce(fn, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(this, args), delay)
    };
}

function clearAutocomplete() {
    autocompleteList.textContent = '';
}

async function fetchRepositories(query) {
    if (!query) {
        clearAutocomplete();
        return;
    }

    try {
    const response = await fetch(`https://api.github.com/search/repositories?q=${query}&per_page=5`);
    if (response.ok) {
        const data = await response.json();
        renderAutocomplete(data.items);
    }
    } catch (err) {
        console.error('Ошибка при поиске:', err)
    }
}

function renderAutocomplete(repos) {
    clearAutocomplete();
    if (!repos || repos.length === 0) {
        return;
    }

    repos.forEach(repo => {
        const li = document.createElement('li');
        li.classList.add('autocomplete-item');
        li.textContent = repo.name;

        const onRequest = () => {
            addRepoCard(repo);
            searchInput.value = '';
            clearAutocomplete();
            li.removeEventListener('click', onRequest);
        };
        
        li.addEventListener('click', onRequest);
        autocompleteList.append(li);
    });
}

function addRepoCard(repo) {
    const card = document.createElement('li');
    card.classList.add('repo-card');

    const repoContent = `
        <div class="repo-info">
            <p>Name: ${repo.name}</p>
            <p>Owner: ${repo.owner.login}</p>
            <p>Stars: ${repo.stargazers_count}</p>
        </div>
        <button class="remove-btn"></button>
    `;

    card.insertAdjacentHTML('afterbegin', repoContent);

    const removeBtn = card.querySelector('.remove-btn')

    const onRemove = () => {
        removeBtn.removeEventListener('click', onRemove)
        card.remove()
    }

    removeBtn.addEventListener('click', onRemove);
    repoList.append(card);
}

const onSearchInputEvent = (e) => {
    const value = e.target.value.trim();
    debouncedFetch(value);
}

const debouncedFetch = debounce(fetchRepositories, 400)

searchInput.addEventListener('input', onSearchInputEvent);










