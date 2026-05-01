import { getJWTPayload, getCookieByName, API_BASE_URL } from "./general.js";
import { showErrorDialog, showSuccessDialog } from './index.js'
const API_PORTAFOLIO_URL = `${API_BASE_URL}/portfolio`
export const initPortfolio = (username) => {

    const fetchPortafolioByUsername = async (username) => {
        const response = await fetch(`${API_PORTAFOLIO_URL}/${username}`, {
            method: 'GET',
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        })

        if (!response.ok)
            throw new Error(await response.text());
        else {
            const data = await response.json();
            return data;
        }
    }

    function loadPresentation(hero, presentationData) {
        const titulo = hero.querySelector("h2");
        const tituloAcademico = hero.querySelector("h3");
        const imagen = hero.querySelector("img");
        const descripcion = hero.querySelector("p");

        titulo.innerText = presentationData.name;
        tituloAcademico.innerText = presentationData.title;
        imagen.src = presentationData.imgUrl;
        imagen.alt = presentationData.name;
        descripcion.innerText = presentationData.description;
    }

    function loadAboutMe(aboutMe, aboutMeData) {
        const titulo = aboutMe.querySelector("h2");
        const descripcion = aboutMe.querySelector("p");

        titulo.innerText = aboutMeData.title;
        descripcion.innerText = aboutMeData.description;
    }

    function loadSkills(skillSection, skills) {
        for (let skill of skills) {
            skillSection.innerHTML = `${skillSection.innerHTML}                 
         <article class="skill-card">
            <div class="card-important-info">
                <h3>${skill.name}</h3>
                <strong>${skill.level}</strong>
                <strong>${skill.category}</strong>
            </div>
            <div class="card-info">
                <div class="img-container">
                    <img src="${skill.imgUrl}" alt="Imagen habilidad">
                </div>
                <div class="text-container">
                    <p>${skill.description}</p>
                </div>
            </div>
        </article>`
        }

    }

    function loadPortfolio(username) {
        fetchPortafolioByUsername(username)
            .then(portafolioData => {
                const hero = document.getElementById("hero");
                const aboutMe = document.getElementById("about-me");
                const skillSection = document.getElementById("skill-section");

                hero.classList.remove("hidden");





                if (portafolioData.presentation) {
                    loadPresentation(hero, portafolioData.presentation);
                }

                if (portafolioData.aboutMe) {
                    aboutMe.classList.remove("hidden");
                    loadAboutMe(aboutMe, portafolioData.aboutMe);
                }

                if (portafolioData.skills && portafolioData.skills.length != 0) {
                    document.getElementById("skills").classList.remove("hidden");
                    loadSkills(skillSection, portafolioData.skills);
                }

            })
            .catch(err => {
                location.assign(`${location.origin}/not-found`);
                console.log(err.stack);
            })
    }

    loadPortfolio(username);
}








export const initPortfolioEdit = (username) => {
    const viewContainer = document.getElementById("portafolio-selected-edit");
    async function loadEditView(htmlPath) {
        if (htmlPath) {
            let htmlViewText;

            const htmlUrl = "/templates" + htmlPath;
            const htmlViewResponse = await fetch(htmlUrl);

            if (!htmlViewResponse.ok)
                throw new Error(err.stack);

            htmlViewText = await htmlViewResponse.text()
                .catch(err => htmlViewText = `<p class="error">${err}</p>`);

            viewContainer.innerHTML = htmlViewText;
        }
    }

    function loadPresentation(presentationData) {
        const titulo = document.getElementById("hero-title");
        const tituloAcademico = document.getElementById("hero-degree");
        const descripcion = document.getElementById("hero-description");
        const imagenActual = document.getElementById("actual-img-hero");

        titulo.value = presentationData.name;
        tituloAcademico.value = presentationData.title;
        descripcion.value = presentationData.description;
        if (presentationData.imgUrl)
            imagenActual.src = presentationData.imgUrl;
    }

    async function savePresentation() {
        const imgFile = document.getElementById("img-hero").files;
        const formData = new FormData();
        const presentationPayload = {
            name: document.getElementById("hero-title").value,
            title: document.getElementById("hero-degree").value,
            description: document.getElementById("hero-description").value
        };

        formData.append(
            "presentation",
            new Blob([JSON.stringify(presentationPayload)], { type: "application/json" })
        );

        if (imgFile != null && imgFile.length > 0) {
            formData.append("img-file", imgFile[0]);
        }

        const response = await fetch(`${API_BASE_URL}/presentation/${username}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${jwtToken}`
            },
            body: formData
        });

        if (response.status != 201)
            throw new Error("STATUS: " + response.status);
    }

    async function updatePresentation() {

        const formData = new FormData();

        const presentationBody = {
            name: document.getElementById("hero-title").value,
            title: document.getElementById("hero-degree").value,
            description: document.getElementById("hero-description").value
        };
        formData.append("presentation", new Blob([JSON.stringify(presentationBody)], {
            type: "application/json"
        }));

        const imgFile = document.getElementById("img-hero").files;
        if (imgFile != null && imgFile.length > 0)
            formData.append("img-file", imgFile[0]);

        const response = await fetch(`${API_BASE_URL}/presentation/${username}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${jwtToken}`
            },
            body: formData
        });

        if (response.status != 200)
            throw new Error("STATUS: " + response.status);
    }

    let jwtToken;

    try {
        jwtToken = getCookieByName("sessionToken");
    }
    catch (err) {
        location.assign(`${location.origin}/login`);
    }

    const hasAccess = jwtToken =>
        jwtToken.trim().length != 0 && getJWTPayload(jwtToken).sub == username;

    const fetchPresentationByUsername = async (username) => {
        const response = await fetch(`${API_BASE_URL}/presentation/${username}`, {
            method: 'GET',
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                "Authorization": `Bearer ${jwtToken}`
            }
        })

        if (!response.ok)
            throw new Error(await response.text());
        else {
            const data = await response.json();
            return data;
        }
    }

    function loadPresentationEdit() {
        viewContainer.innerHTML = loadEditView('/portafolio-edit/presentation.html')
            .then(() => {
                fetchPresentationByUsername(username)
                    .then(presentationData => {
                        const heroSubmitBtn = document.getElementById("hero-submit-btn");
                        if (heroSubmitBtn)
                            ['click', 'submit'].forEach((eventType) =>
                                heroSubmitBtn.addEventListener(eventType, (event) => {
                                    event.preventDefault();

                                    if (!presentationData)
                                        savePresentation()
                                            .then(() => location.reload())
                                    else
                                        updatePresentation()
                                            .then(() => location.reload());
                                }));

                        if (presentationData)
                            loadPresentation(presentationData)
                    });

            });
    }

    if (!hasAccess(jwtToken))
        location.assign(`${location.origin}/not-found`);
    else {
        try {
            loadPresentationEdit();

            const presentationNavBtn = document.getElementById("presentation-nav-btn");
            if (presentationNavBtn)
                presentationNavBtn.addEventListener('click', () => loadPresentationEdit());

            const fetchDegreesByUsername = async (username) => {
                const response = await fetch(`${API_BASE_URL}/degrees/list/${username}`, {
                    method: 'GET',
                    headers: {
                        "Content-Type": "application/json; charset=UTF-8",
                        "Authorization": `Bearer ${jwtToken}`
                    }
                });

                if (response.ok)
                    return await response.json();
                else
                    throw new Error(await response.text());
            }
            async function copyDegreesToTable() {
                const degrees = await fetchDegreesByUsername(username);
                const tBody = document.getElementById("degree-table-body");

                tBody.innerHTML = "";

                for (let degree of degrees)
                    tBody.innerHTML = `${tBody.innerHTML}
                    <tr>
                      <td>${degree.name}</td>
                      <td>${degree.description}</td>
                      <td>${degree.startDate}</td>
                      <td>${degree.endDate}</td>
                      <td class="img-container, table-img-container"><img src="${degree.imgUrl}" alt="Imagen de ${degree.name}""></td>
                      <td class="table-btn-container">
                        <a class="edit-btn">
                          <div class="img-container"><img class="edit-btn-icon" src="/assets/icons/editar1.png"></div>
                          <input type="hidden" value="${degree.id}"></input>
                        </a>              
                        <a class="delete-btn">
                          <i class="fa fa-trash"></i>
                          <input type="hidden" value="${degree.id}"></input>
                        </a>        
                      </td>                       
                    </tr>`;

                return degrees;
            }
            // todo: pasar íconos a svg 
            function loadDegreesEdit() {
                viewContainer.innerHTML = loadEditView("/portafolio-edit/degrees.html")
                    .then(() => {
                        copyDegreesToTable().then((degreeArray) => {
                            const editBtnIconArray = document.getElementsByClassName("edit-btn-icon");

                            for (let editBtnIcon of editBtnIconArray) {
                                editBtnIcon.addEventListener('mouseover', () => {
                                    editBtnIcon.src = "/assets/icons/editar2.png";
                                    editBtnIcon.style.filter = "drop-shadow(.1rem .1rem .5rem yellow)";


                                });
                                editBtnIcon.addEventListener('mouseout', () => {
                                    editBtnIcon.src = "/assets/icons/editar1.png";
                                    editBtnIcon.style.filter = "";
                                });
                            };

                            for (let editBtn of document.getElementsByClassName("edit-btn")) {
                                editBtn.addEventListener('click', e => {
                                    e.preventDefault();
                                    loadEditView("/portafolio-edit/degree.html")
                                        .then(() => {
                                            const headerText = document.getElementById("degree-header-text");
                                            headerText.innerText = "EDITAR " + headerText.innerText;

                                            const degreeNameBox = document.getElementById("degree-name");
                                            const degreeDescriptionBox = document.getElementById("degree-description");
                                            const degreeStartDateBox = document.getElementById("degree-start-date");
                                            const degreeEndDateBox = document.getElementById("degree-end-date");
                                            const degreeImageFileBox = document.getElementById("degree-image-file");

                                            const degreeOldImageFileBox = document.getElementById("degree-old-image-file");

                                            const degreeId = editBtn.querySelector("input").value;
                                            let degreeToEdit;
                                            for(let degree of degreeArray)
                                                if (degree.id == degreeId)
                                                    degreeToEdit = degree;
                                            degreeNameBox.value = degreeToEdit.name;
                                            degreeDescriptionBox.value = degreeToEdit.description;
                                            degreeStartDateBox.value = degreeToEdit.startDate;
                                            degreeEndDateBox.value = degreeToEdit.endDate;
                                            degreeOldImageFileBox.src = degreeToEdit.imgUrl;

                                            document.getElementById("degree-form-submit-button")
                                                .addEventListener('click', eSubmit => {
                                                    eSubmit.preventDefault();

                                                    const degreeFormData = new FormData();
                                                    degreeFormData.append('degree', new Blob([JSON.stringify({
                                                        name: degreeNameBox.value,
                                                        description: degreeDescriptionBox.value,
                                                        startDate: degreeStartDateBox.value,
                                                        endDate: degreeEndDateBox.value,
                                                    })], { type: "application/json; charset=UTF-8" }));

                                                    let imageFilesArray = degreeImageFileBox.files;
                                                    if (imageFilesArray != null && imageFilesArray.length > 0)
                                                        degreeFormData.append('img-file', imageFilesArray[0]);

                                                    fetch(`${API_BASE_URL}/degrees/${degreeId}`, {
                                                        method: 'PUT',
                                                        headers: {
                                                            'Authorization': `Bearer ${jwtToken}`
                                                        },
                                                        body: degreeFormData
                                                    })
                                                        .then(response => {
                                                            if (response.ok) {
                                                                loadDegreesEdit();
                                                                showSuccessDialog("¡Título académico actualizado con éxito!");
                                                            }
                                                            else{
                                                                showErrorDialog("No se pudo guardar el título, STATUS: "+ response.status);
                                                                response.json().then(json => console.log(json));
                                                            }
                                                        });
                                                });
                                        });


                                });
                            }

                            for (let deleteBtn of document.getElementsByClassName("delete-btn")) {
                                deleteBtn.addEventListener('click', e => {
                                    e.preventDefault();

                                    fetch(`${API_BASE_URL}/degrees/${deleteBtn.querySelector("input").value}`, {
                                        method: 'DELETE',
                                        headers: {
                                            'Authorization': `Bearer ${jwtToken}`
                                        }
                                    })
                                        .then(response => {
                                            if (response.status != 204)
                                                throw new Error("STATUS: " + response.status);
                                            else {
                                                showSuccessDialog("¡Título eliminado con éxito!");
                                                copyDegreesToTable();
                                            }

                                        });
                                })
                            }
                        });
                    });
            }

            const degreeNavBtn = document.getElementById("degree-nav-btn");
            if (degreeNavBtn)
                degreeNavBtn.addEventListener('click', () => loadDegreesEdit());

            const skillNavBtn = document.getElementById("skill-nav-btn");
            if (skillNavBtn)
                skillNavBtn.addEventListener('click', () => location.assign(`${location.origin}/portfolio/u/${username}/edit-skills`));

            const experienceNavBtn = document.getElementById("experience-nav-btn");
            if (experienceNavBtn)
                experienceNavBtn.addEventListener('click', () => location.assign(`${location.origin}/portfolio/u/${username}/edit-experience`));




        }
        catch (err) {
            showErrorDialog(err);
            console.log(err.stack);
        }
    }








    function loadAboutMe(aboutMe, aboutMeData) {
        const titulo = aboutMe.querySelector("h2");
        const descripcion = aboutMe.querySelector("p");

        titulo.innerText = aboutMeData.title;
        descripcion.innerText = aboutMeData.description;
    }

    function loadSkills(skillSection, skills) {
        for (let skill of skills) {
            skillSection.innerHTML = `${skillSection.innerHTML}                 
         <article class="skill-card">
            <div class="card-important-info">
                <h3>${skill.name}</h3>
                <strong>${skill.level}</strong>
                <strong>${skill.category}</strong>
            </div>
            <div class="card-info">
                <div class="img-container">
                    <img src="${skill.imgUrl}" alt="Imagen habilidad">
                </div>
                <div class="text-container">
                    <p>${skill.description}</p>
                </div>
            </div>
        </article>`
        }

    }
}

