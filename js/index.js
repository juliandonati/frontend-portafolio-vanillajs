import { initLogin } from "./login-script.js";
import { initPortfolio } from "./portfolio-script.js";
import { initPortfolioEdit } from "./portfolio-script.js"
import { initHome } from "./home.js";
import { initControlPanel } from "./control-panel.js";

import { getCookieByName, deleteCookieByName } from "./general.js";


const initLogout = () => {
    deleteCookieByName("sessionToken");
    history.back();
}

const routes = [
    { pathname: "/home", view: "/home.html", js: initHome },
    { pathname: "/login", view: "/auth/login-form.html", js: initLogin },
    { pathname: "/logout", js: initLogout },
    { pathname: "/control-panel", view: "/auth/control-panel.html", js: initControlPanel },
    { pathname: "/portfolio/u/:username", view: "/portafolio.html", js: initPortfolio },
    { pathname: "/portfolio/u/:username/edit", view: "/portafolio-edit.html", js: initPortfolioEdit },
    { pathname: "/not-found", view: "/not-found.html" },
];

const pathToRegex = (path) => new RegExp("^" + path.replace(/\//g, "\\/").replace(/:([^/]+)/g, "([^/]+)") + '$');

const route = async () => {
    const possiblePaths = routes.map(route => {
        return {
            pathname: route.pathname,
            match: location.pathname.match(pathToRegex(route.pathname))
        }
    });


    const possiblePathMatch = possiblePaths.find(possiblePath => possiblePath.match !== null);

    if (possiblePathMatch) {
        return possiblePathMatch;
    }
    else
        throw new Error("La ruta especificada no existe.");
}

export async function loadView(route) {
    if (route.view) {
        let htmlViewText;

        const htmlUrl = "/templates" + route.view;
        const htmlViewResponse = await fetch(htmlUrl);

        if (!htmlViewResponse.ok)
            throw new Error(err.stack);

        htmlViewText = await htmlViewResponse.text()
            .catch(err => htmlViewText = `<p class="error">${err}</p>`);

        appDiv.innerHTML = htmlViewText;
    }

}

async function loadPath(pathMatch) {
    const matchDataArray = pathMatch.match;
    const baseRoute = routes.find(route => route.pathname == pathMatch.pathname);

    await loadView(baseRoute);
    if (baseRoute.js) {
        const pathVariableArray = [];
        for (let i = 1; i < matchDataArray.length; i++)
            pathVariableArray.push(matchDataArray[i]);

        baseRoute.js(...pathVariableArray);
    }
}

const handleRoute = () => {
    if (location.pathname != "" && location.pathname != "/")
        route()
            .then(pathMatch => {
                try {
                    loadPath(pathMatch);
                }
                catch (err) {
                    console.log("No se pudo cargar la ruta especificada.");
                    console.log(err.stack);
                }
            })
            .catch(err => {
                console.error(err);
                appDiv.innerHTML = `<p class="error">${err}</p>`
            });
    else {
        try {
            const homePathMatch = {
                match: {
                    0: "",
                    length: 1
                },
                pathname: "/home"
            }
            loadPath(homePathMatch);
        }
        catch (err) {
            console.log("No se pudo cargar la ruta especificada.");
            console.log(err.stack);
        }
    }
}
const appDiv = document.getElementById("app");
window.addEventListener("popstate", handleRoute)

window.addEventListener("DOMContentLoaded", handleRoute);

try {
    const sessionToken = getCookieByName("sessionToken");

    document.getElementById("login-option").classList.add("hidden");
    document.getElementById("logout-option").classList.remove("hidden");
    document.getElementById("control-panel-option").classList.remove("hidden");
}
catch (err) {
    console.log(err);
}


export function showErrorDialog(error, ...functions) {
    const errorDialog = document.querySelector("dialog");

    errorDialog.querySelector("p").innerText = error;
    const closeButton = document.getElementById("close-dialog-btn");
    closeButton.addEventListener("click", () => {
        errorDialog.requestClose();
        for (let f of functions)
            f();
    });

    errorDialog.style =
        "background: radial-gradient( " +
        "circle at center, " +
        "rgba(255,255,255,.7) 10%," +
        "red 80%, " +
        "transparent 90%" +
        "); " +
        "border: none;" +
        "border-radius: 10%;" +
        "width: 50%;" +
        "text-align: center;" +
        "font-size: 2rem;";
    errorDialog.showModal();
}

export function showSuccessDialog(message, ...functions) {
    const successDialog = document.querySelector("dialog");

    successDialog.querySelector("p").innerText = message;
    const closeButton = document.getElementById("close-dialog-btn");
    closeButton.addEventListener("click", () => {
        successDialog.requestClose();
        for (let f of functions)
            f();
    });

    successDialog.style =
        "background: radial-gradient( " +
        "circle at center, " +
        "rgba(255,255,255,.7) 10%," +
        "green 80%, " +
        "transparent 90%" +
        "); " +
        "border: none;" +
        "border-radius: 10%;" +
        "width: 50%;" +
        "text-align: center;" +
        "font-size: 2rem;";
    successDialog.showModal();
}
