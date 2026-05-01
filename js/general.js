// export const API_BASE_URL = "https://backend-portafolio-x5ac.onrender.com/api/v1";
export const API_BASE_URL = "http://127.0.0.1:8080/api/v1";

export const getCookieArray = () => document.cookie.split(';');
 
export const getCookieByName = cookieName => {
    const cookieArray = getCookieArray();
    const n = cookieArray.length;

    if (n > 0) {
        let i = 0;
        let actualCookie = cookieArray[0];

        while (i < n && !actualCookie.includes(cookieName)) {
            actualCookie = cookieArray[i];
            i++;
        }

        if (i < n)
            return actualCookie.substring(actualCookie.indexOf('=') + 1);

        throw new Error("No se encontró la cookie: " + cookieName);
    }
    else
        throw new Error("No hay ninguna cookie cargada actualmente.");
}

export const deleteCookieByName = cookieName =>{
    for(let cookie of getCookieArray()){
        if(cookie.includes(cookieName)){
            document.cookie = `${cookieName}=; expires="${(new Date(0)).toUTCString()}"; path="/"`;
        }
    }
}

export const debounce = (functionToRun, delay) => {
    let timer;

    return function(...args){
        clearTimeout(timer);
        timer = setTimeout(() =>{
            functionToRun.apply(this,...args);
        }, delay);
    }
}

export const getJWTPayload = (token) =>{
    try{
        const base64URI = token.split('.')[1]; // Separamos por puntos y tomamos la segunda parte (donde está el payload)
        const base64 = base64URI.replace(/-/g, '+').replace(/_/g, '/'); // Convertimos a Base64 Estándar
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(c => '%' + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        return JSON.parse(jsonPayload);
    }
    catch(err){
        console.error("No se pudo decodificar el JWT.");
        console.error(err.stack);
        return null;
    }
}

export const timeout = (ms) =>{
    return new Promise((_ , reject) => {
        setTimeout(() => reject(new Error("Tiempo de espera agotado, por favor inténtalo de vuelta más tarde.")),ms)
    });
}