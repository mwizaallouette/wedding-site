
const button = document.getElementById("hellobutton");

if (button) {
    button.addEventListener("click", function () {
        const gallery = document.getElementById("gallery");

        if (gallery) {
            window.scrollTo({
                top: gallery.offsetTop,
                behavior: "smooth"
            });
        }
    });
}

// ================================
// SETTINGS
// ================================

const settingsButton = document.getElementById("settingsButton");
const settingsPage = document.getElementById("settingsPage");
const closeSettings = document.getElementById("closeSettings");

const darkModeToggle = document.getElementById("darkModeToggle");
const animationsToggle = document.getElementById("animationsToggle");
const photoPrivacy = document.getElementById("photoPrivacy");

const saveSettings = document.getElementById("saveSettings");
const settingsMessage = document.getElementById("settingsMessage");

const settingsStorageKey = "paccyJackySettings";

function applySettings() {
    if (darkModeToggle) {
        document.body.classList.toggle(
            "dark-theme",
            darkModeToggle.checked
        );
    }

    if (animationsToggle) {
        document.body.classList.toggle(
            "animations-off",
            !animationsToggle.checked
        );
    }
}

function loadSettings() {
    let savedSettings = {};

    try {
        savedSettings = JSON.parse(
            localStorage.getItem(settingsStorageKey) || "{}"
        ) || {};
    } catch (error) {
        console.warn("Could not load saved settings.", error);
    }

    if (darkModeToggle) {
        darkModeToggle.checked = savedSettings.darkMode === true;
    }

    if (animationsToggle) {
        animationsToggle.checked = savedSettings.animations !== false;
    }

    if (photoPrivacy) {
        photoPrivacy.value =
            savedSettings.photoPrivacy === "private"
                ? "private"
                : "public";
    }

    applySettings();
}

if (settingsButton && settingsPage) {
    settingsButton.addEventListener("click", function () {
        settingsPage.hidden = false;

        if (settingsMessage) {
            settingsMessage.textContent = "";
        }
    });
}


/* Close settings using the Close button */
if (closeSettings && settingsPage) {
    closeSettings.addEventListener("click", function () {
        settingsPage.hidden = true;
    });
}

/* Close settings when clicking outside the panel */
if (settingsPage) {
    settingsPage.addEventListener("click", function (event) {
        if (event.target === settingsPage) {
            settingsPage.hidden = true;
        }
    });
}

/* Close settings by pressing Escape */
document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && settingsPage && !settingsPage.hidden) {
        settingsPage.hidden = true;
    }
});


if (darkModeToggle) {
    darkModeToggle.addEventListener("change", applySettings);
}

if (animationsToggle) {
    animationsToggle.addEventListener("change", applySettings);
}

if (saveSettings) {
    saveSettings.addEventListener("click", function () {
        const settings = {
            darkMode: darkModeToggle
                ? darkModeToggle.checked
                : false,

            animations: animationsToggle
                ? animationsToggle.checked
                : true,

            photoPrivacy: photoPrivacy
                ? photoPrivacy.value
                : "public"
        };

        try {
            localStorage.setItem(
                settingsStorageKey,
                JSON.stringify(settings)
            );

            applySettings();

            if (settingsMessage) {
                settingsMessage.textContent =
                    "Your preferences have been saved!";
            }
        } catch (error) {
            if (settingsMessage) {
                settingsMessage.textContent =
                    "Settings could not be saved in this browser.";
            }
        }
    });
}

loadSettings();


// ================================
// PHOTO STORAGE: INDEXEDDB
// Photos are saved in this browser.
// ================================

const photoUpload = document.getElementById("photoUpload");
const galleryGrid = document.querySelector(".gallery-grid");

const databaseName = "PaccyJackyPhotoDatabase";
const databaseVersion = 1;
const photoStoreName = "photos";

function openPhotoDatabase() {
    return new Promise(function (resolve, reject) {
        const request = indexedDB.open(
            databaseName,
            databaseVersion
        );

        request.onupgradeneeded = function () {
            const database = request.result;

            if (!database.objectStoreNames.contains(photoStoreName)) {
                database.createObjectStore(photoStoreName, {
                    keyPath: "id",
                    autoIncrement: true
                });
            }
        };

        request.onsuccess = function () {
            resolve(request.result);
        };

        request.onerror = function () {
            reject(request.error);
        };
    });
}

async function savePhotoToDatabase(file) {
    const database = await openPhotoDatabase();

    return new Promise(function (resolve, reject) {
        const transaction = database.transaction(
            photoStoreName,
            "readwrite"
        );

        const store = transaction.objectStore(photoStoreName);

        store.add({
            name: file.name,
            image: file,
            addedAt: Date.now()
        });

        transaction.oncomplete = function () {
            database.close();
            resolve();
        };

        transaction.onerror = function () {
            database.close();
            reject(transaction.error);
        };

        transaction.onabort = function () {
            database.close();
            reject(transaction.error);
        };
    });
}

async function getSavedPhotos() {
    const database = await openPhotoDatabase();

    return new Promise(function (resolve, reject) {
        const transaction = database.transaction(
            photoStoreName,
            "readonly"
        );

        const request = transaction
            .objectStore(photoStoreName)
            .getAll();

        request.onsuccess = function () {
            resolve(request.result);
        };

        request.onerror = function () {
            reject(request.error);
        };

        transaction.oncomplete = function () {
            database.close();
        };
    });
}

async function deleteSavedPhoto(photoId) {
    const database = await openPhotoDatabase();

    return new Promise(function (resolve, reject) {
        const transaction = database.transaction(
            photoStoreName,
            "readwrite"
        );

        transaction.objectStore(photoStoreName).delete(photoId);

        transaction.oncomplete = function () {
            database.close();
            resolve();
        };

        transaction.onerror = function () {
            database.close();
            reject(transaction.error);
        };
    });
}

function updateEmptyMessage() {
    if (!galleryGrid) return;

    const hasPhotos = Boolean(
        galleryGrid.querySelector(".gallery-photo")
    );

    let emptyMessage = galleryGrid.querySelector(".gallery-empty");

    if (!hasPhotos && !emptyMessage) {
        emptyMessage = document.createElement("p");
        emptyMessage.className = "gallery-empty";
        emptyMessage.textContent =
            "No photos yet. Add some beautiful memories!";
        galleryGrid.appendChild(emptyMessage);
    } else if (hasPhotos && emptyMessage) {
        emptyMessage.remove();
    }
}

function displayPhoto(photo) {
    if (!galleryGrid) return;

    const photoURL = URL.createObjectURL(photo.image);

    const photoCard = document.createElement("div");
    photoCard.className = "gallery-photo";

    const image = document.createElement("img");
    image.src = photoURL;
    image.alt = photo.name;
    image.className = "gallery-image";

    const removeButton = document.createElement("button");
    removeButton.textContent = "Remove";
    removeButton.className = "remove-photo";
    removeButton.type = "button";

    image.addEventListener("click", function () {
        window.open(photoURL, "_blank");
    });

    removeButton.addEventListener("click", async function () {
        removeButton.disabled = true;

        try {
            await deleteSavedPhoto(photo.id);

            URL.revokeObjectURL(photoURL);
            photoCard.remove();

            updateEmptyMessage();
        } catch (error) {
            console.error("Could not remove photo:", error);
            removeButton.disabled = false;
            alert("Sorry, this photo could not be removed.");
        }
    });

    photoCard.appendChild(image);
    photoCard.appendChild(removeButton);
    galleryGrid.appendChild(photoCard);
}

async function loadSavedPhotos() {
    if (!galleryGrid) return;

    try {
        const savedPhotos = await getSavedPhotos();

        savedPhotos.forEach(function (photo) {
            displayPhoto(photo);
        });

        updateEmptyMessage();
    } catch (error) {
        console.error("Could not load saved photos:", error);
        updateEmptyMessage();
    }
}

if (photoUpload && galleryGrid) {
    photoUpload.addEventListener("change", async function () {
        const files = Array.from(this.files);

        for (const file of files) {
            if (!file.type.startsWith("image/")) continue;

            try {
                await savePhotoToDatabase(file);
            } catch (error) {
                console.error("Could not save photo:", error);
                alert(
                    "A photo could not be saved. Try a smaller image."
                );
                continue;
            }
        }

        // Refresh the gallery from saved browser storage.
        galleryGrid
            .querySelectorAll(".gallery-photo")
            .forEach(function (card) {
                const image = card.querySelector("img");

                if (image && image.src.startsWith("blob:")) {
                    URL.revokeObjectURL(image.src);
                }

                card.remove();
            });

        await loadSavedPhotos();

        this.value = "";
    });

    loadSavedPhotos();
}
// Notifications setting

const notificationsToggle = document.getElementById("notificationsToggle");

if (notificationsToggle) {
    notificationsToggle.checked =
        localStorage.getItem("paccyJackyNotifications") === "true";

    notificationsToggle.addEventListener("change", async function () {
        if (this.checked) {
            if (!("Notification" in window)) {
                alert("Your browser does not support notifications.");
                this.checked = false;
                return;
            }

            const permission = await Notification.requestPermission();

            if (permission === "granted") {
                localStorage.setItem("paccyJackyNotifications", "true");

                new Notification("PACCY & JACKY 💍", {
                    body: "Notifications are now enabled!"
                });
            } else {
                localStorage.setItem("paccyJackyNotifications", "false");
                this.checked = false;
                alert("Please allow notifications in your browser settings.");
            }
        } else {
            localStorage.setItem("paccyJackyNotifications", "false");
        }
    });
}

/* Make website elements appear as you scroll */

const revealElements = document.querySelectorAll(
    "section, .gallery-photo, .events, footer"
);

revealElements.forEach(function (element) {
    element.classList.add("reveal-on-scroll");
});

const revealObserver = new IntersectionObserver(
    function (entries, observer) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    },
    {
        threshold: 0.12
    }
);

revealElements.forEach(function (element) {
    revealObserver.observe(element);
});
/* PACCY & JACKY event planner */
const eventForm = document.getElementById("eventForm");
const eventList = document.getElementById("eventList");
const eventStorageKey = "paccyJackyEvents";

function getSavedEvents() {
    try {
        return JSON.parse(
            localStorage.getItem(eventStorageKey) || "[]"
        );
    } catch (error) {
        return [];
    }
}

function saveEvents(events) {
    localStorage.setItem(eventStorageKey, JSON.stringify(events));
}

function displayEvents() {
    if (!eventList) return;

    const events = getSavedEvents();
    eventList.replaceChildren();

    if (events.length === 0) {
        const message = document.createElement("p");
        message.textContent = "Your marked events will appear here.";
        eventList.appendChild(message);
        return;
    }

    events.forEach(function (event) {
        const card = document.createElement("article");
        card.className = "event-card";

        const heading = document.createElement("h3");
        heading.textContent = event.name;
        card.appendChild(heading);

        const dateLine = document.createElement("p");
        dateLine.textContent =
            "Date: " + event.date +
            (event.time ? " at " + event.time : "");
        card.appendChild(dateLine);

        if (event.description) {
            const description = document.createElement("p");
            description.textContent = event.description;
            card.appendChild(description);
        }

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "event-delete";
        deleteButton.textContent = "Remove event";

        deleteButton.addEventListener("click", function () {
            const remainingEvents = getSavedEvents().filter(
                function (savedEvent) {
                    return savedEvent.id !== event.id;
                }
            );

            saveEvents(remainingEvents);
            displayEvents();
        });

        card.appendChild(deleteButton);
        eventList.appendChild(card);
    });
}

if (eventForm && eventList) {
    eventForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const newEvent = {
            id: Date.now().toString() + Math.random().toString(16).slice(2),
            name: document.getElementById("eventName").value.trim(),
            date: document.getElementById("eventDate").value,
            time: document.getElementById("eventTime").value,
            description: document.getElementById("eventDescription").value.trim()
        };

        if (!newEvent.name || !newEvent.date) {
            alert("Please enter an event name and date.");
            return;
        }

        const events = getSavedEvents();
        events.push(newEvent);

        try {
            saveEvents(events);
            eventForm.reset();
            displayEvents();
        } catch (error) {
            alert("Could not save this event in your browser.");
        }
    });

    displayEvents();
}

/* Navigation menu controls */
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const menuSettingsButton = document.getElementById("menuSettingsButton");

if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", function () {
        const isOpen = navLinks.classList.toggle("open");

        menuToggle.setAttribute("aria-expanded", String(isOpen));
        menuToggle.setAttribute(
            "aria-label",
            isOpen ? "Close menu" : "Open menu"
        );
        menuToggle.textContent = isOpen ? "✕" : "☰";
    });

    navLinks.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
            navLinks.classList.remove("open");
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "Open menu");
            menuToggle.textContent = "☰";
        });
    });
}

if (menuSettingsButton) {
    menuSettingsButton.addEventListener("click", function () {
        const existingSettingsButton =
            document.getElementById("settingsButton");

        if (existingSettingsButton) {
            existingSettingsButton.click();
        }
    });
}

/* =====================================
   RELIVE PROFILE SETTINGS
===================================== */

const profileDisplayName = document.getElementById("profileDisplayName");
const saveProfileName = document.getElementById("saveProfileName");
const profileMessage = document.getElementById("profileMessage");
const signOutButton = document.getElementById("signOutButton");

// Load the saved display name when the page opens.
async function loadProfileSettings() {
    if (!profileDisplayName) return;

    const { data, error } = await supabaseClient.auth.getUser();

    if (error || !data.user) {
        profileMessage.textContent = "Please sign in to manage your profile.";
        return;
    }

    profileDisplayName.value =
        data.user.user_metadata?.display_name || "";
}

// Save a new display name.
if (saveProfileName) {
    saveProfileName.addEventListener("click", async function () {
        const name = profileDisplayName.value.trim();

        if (!name) {
            profileMessage.textContent = "Please enter a display name.";
            return;
        }

        saveProfileName.disabled = true;
        profileMessage.textContent = "Saving your name...";

        const { data, error } = await supabaseClient.auth.updateUser({
            data: { display_name: name }
        });

        saveProfileName.disabled = false;

        if (error) {
            profileMessage.textContent = error.message;
            return;
        }

        profileDisplayName.value =
            data.user.user_metadata.display_name;

        profileMessage.textContent = "Your display name has been saved!";
    });
}

// Sign out of RELIVE.
if (signOutButton) {
    signOutButton.addEventListener("click", async function () {
        signOutButton.disabled = true;
        profileMessage.textContent = "Signing out...";

        const { error } = await supabaseClient.auth.signOut();

        signOutButton.disabled = false;

        if (error) {
            profileMessage.textContent = error.message;
            return;
        }

        window.location.href = "signin.html";
    });
}

loadProfileSettings();
