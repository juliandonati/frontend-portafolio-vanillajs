import { API_BASE_URL, timeout } from './general.js';
import { showErrorDialog } from './index.js';
export const initLogin = () => {
    const API_AUTH_URL = `${API_BASE_URL}/auth`;

    const tryToLogin = async (username, password) => {
        console.log(`${API_AUTH_URL}/login`);
        const response = await fetch(`${API_AUTH_URL}/login`, {
            method: "POST",
            body: JSON.stringify({
                usernameOrEmail: username,
                unencryptedPassword: password
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        });

        if (!response.ok) {
            if(response.status == 500)
                throw new Error("Usuario o contraseña incorrectos");
            const errorStatus = "STATUS = " + await response.status;
            throw new Error(errorStatus);
        }
        else {
            const data = await response.json();

            return data.accessToken;
        }
    }

    const addJWTCookie = (accessToken) => {

        document.cookie = `sessionToken=${accessToken}; expires=${new Date(Date.now() + 1800000).toUTCString()}; path=/`;
    }

    const loginForm = document.getElementById("loginForm");


    if (loginForm)
        loginForm.addEventListener("submit", event => {
            event.preventDefault();

            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;


            Promise.race([tryToLogin(username, password),timeout(5000)]) 
                .then(accessToken => {
                    addJWTCookie(accessToken);

                    history.back();
                })
                .catch(err => {
                    console.log(err);
                    showErrorDialog(err);
                })
        })
}
