import { debounce } from "./general.js"
import { API_BASE_URL } from "./general.js";

export function initHome() {
    const searchbar = document.getElementById("main-searchbar");
    const searchResultList = document.getElementsByClassName("result-list")[0];

    const fetchUsers = async () => {
        const filter = searchbar.value;

        const response = await fetch(`${API_BASE_URL}/users?name=${filter}`, {
            method: 'GET',
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        });

        if (!response.ok) {
            throw new Error("Error al buscar usuarios.");
        }
        else
            return await response.json();
    }

    function showResults() {
        fetchUsers()
            .then(foundUsers => {
                searchResultList.innerHTML = '';

                const foundUsersContent = foundUsers.content;
                for (let i=0; i<foundUsersContent.length; i++){
                    let user = foundUsersContent[i];
                    console.log(user);
                    searchResultList.innerHTML = `${searchResultList.innerHTML}
                        <li><a href="/portfolio/u/${user.username}">${user.username}  (${user.displayName})</a></li>`;
                }
                });
    }

    const debouncedSearch = debounce(showResults, 500);

    if (searchbar)
        searchbar.addEventListener('input', () => {
            try {
                debouncedSearch();
            }
            catch(err){
                console.log(err.stack);
            }
        });
}