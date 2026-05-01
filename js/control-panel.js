import { getJWTPayload, getCookieByName, API_BASE_URL } from "./general.js";
import { showErrorDialog } from './index.js';

export const initControlPanel = () => {
    try {
        const sessionToken = getCookieByName("sessionToken");
        const jwtPayload = getJWTPayload(sessionToken);
        const username = jwtPayload.sub;

        const hasPortfolio = async (username) => {
            const response = await fetch(`${API_BASE_URL}/portfolio/${username}/exists`);
            if (!response.ok)
                throw new Error(`${response.status == 404 ? "El usuario no existe" : response.status}`);

            return await response.json();
        }

        document.querySelector("h2").innerText = `PANEL DE CONTROL DE ${username.toUpperCase()}`;

        const editPortfolioButton = document.getElementById("edit-portfolio-button");
        const deletePortfolioButton = document.getElementById("delete-portfolio-button");


        async function deletePortfolio() {
            if (confirm("¿Estás seguro de que deseas eliminar el portfolio?")) {
                const response = await fetch(`${API_BASE_URL}/portfolio/${username}`,
                    {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            "Authorization": `Bearer ${sessionToken}`
                        }
                    }
                )
                if (!(response.status == 204))
                    throw new Error(response.status);
            }
        }

        async function createPortfolio(){
            const response = await fetch(`${API_BASE_URL}/portfolio/${username}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${sessionToken}`
                    }
                }
            );
            
            if(response.status != 201) 
                throw new Error(response.status);
        }

        hasPortfolio(username)
            .then(hasPortfolio => {
                if (hasPortfolio) {
                    deletePortfolioButton.classList.remove("hidden");
                    editPortfolioButton.classList.remove("hidden");
                    deletePortfolioButton.addEventListener('click', event => {
                        event.preventDefault();

                        deletePortfolio()
                            .then(() => location.reload())
                            .catch(err => console.log("No se pudo eliminar el portfolio... " + err.stack));
                    });

                    editPortfolioButton.href = `/portfolio/u/${username}/edit`;
                }
                else {
                    deletePortfolioButton.classList.add("hidden");
                    editPortfolioButton.classList.add("hidden");

                    const createPortfolioButton = document.getElementById("create-portfolio-button");
                    createPortfolioButton.classList.remove("hidden");
                    createPortfolioButton.addEventListener("click", event => {
                        event.preventDefault();

                        createPortfolio()
                            .then(() => location.assign(`${location.origin}/portfolio/u/${username}/edit`)) // todo: reemplazar la dirección por la de edición del portafolio
                            .catch(err => {
                                console.log(err);
                                showErrorDialog(err);
                            }
                            );
                    });
                }
            })
            .catch(err => {
                console.log(err.stack);
                showErrorDialog(err);
            });


    }
    catch (err) {
        location.assign("/login");
        console.log(err);
        showErrorDialog(err);
    }


}