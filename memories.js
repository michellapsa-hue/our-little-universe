const memoryContainer =
    document.getElementById("memoryContainer");

const addMemoryButton =
    document.getElementById("addMemoryButton");

const memoryModal =
    document.getElementById("memoryModal");

const closeMemoryModal =
    document.getElementById("closeMemoryModal");

const memoryForm =
    document.getElementById("memoryForm");

const memoryDetailModal =
    document.getElementById("memoryDetailModal");

const closeMemoryDetail =
    document.getElementById("closeMemoryDetail");

const memoryDetailContent =
    document.getElementById("memoryDetailContent");

const UNIVERSE_ID =
    "e6df9aea-780d-4784-a4ef-12710647444d";


/* =========================
   ESCAPE HTML
========================= */

function escapeHtml(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================
   FORMAT DATE
========================= */

function formatDate(date) {

    if (!date) {
        return "A special day";
    }

    return new Date(date + "T00:00:00")
        .toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
}


/* =========================
   ADD MEMORY MODAL
========================= */

if (addMemoryButton) {

    addMemoryButton.onclick = function () {
        memoryModal.classList.add("active");
    };

}


if (closeMemoryModal) {

    closeMemoryModal.onclick = function () {
        memoryModal.classList.remove("active");
    };

}


if (memoryModal) {

    memoryModal.addEventListener("click", function (event) {

        if (event.target === memoryModal) {
            memoryModal.classList.remove("active");
        }

    });

}


/* =========================
   DETAIL MODAL
========================= */

function closeDetailModal() {

    memoryDetailModal.classList.remove("active");

    document.body.style.overflow = "";

}


if (closeMemoryDetail) {

    closeMemoryDetail.onclick = function (event) {

        event.preventDefault();
        event.stopPropagation();

        closeDetailModal();

    };

}


if (memoryDetailModal) {

    memoryDetailModal.addEventListener(
        "click",
        function (event) {

            if (event.target === memoryDetailModal) {
                closeDetailModal();
            }

        }
    );

}


/* =========================
   DETAIL STYLE
========================= */

const editDeleteStyle =
    document.createElement("style");

editDeleteStyle.textContent = `

    .memory-detail-actions {
        display: flex;
        gap: 10px;
        margin-top: 30px;
    }

    .memory-edit-button,
    .memory-delete-button {
        flex: 1;
        padding: 12px 18px;
        border-radius: 12px;
        cursor: pointer;
        font-size: 13px;
        color: white;
    }

    .memory-edit-button {
        border: 1px solid rgba(255,255,255,0.15);
        background: rgba(255,255,255,0.08);
    }

    .memory-delete-button {
        border: 1px solid rgba(255,100,120,0.25);
        background: rgba(180,50,80,0.18);
    }

    .memory-edit-button:hover,
    .memory-delete-button:hover {
        opacity: 0.8;
    }

    .edit-memory-form {
        margin-top: 20px;
    }

    .edit-memory-form label {
        display: block;
        margin: 15px 0 7px;
        font-size: 12px;
        color: rgba(255,255,255,0.65);
    }

    .edit-memory-form input,
    .edit-memory-form textarea {
        width: 100%;
        padding: 12px 14px;
        border-radius: 12px;
        border: 1px solid rgba(255,255,255,0.1);
        background: rgba(255,255,255,0.06);
        color: white;
        outline: none;
        font-family: Arial, sans-serif;
    }

    .edit-memory-form textarea {
        min-height: 130px;
        resize: vertical;
    }

    .edit-memory-buttons {
        display: flex;
        gap: 10px;
        margin-top: 20px;
    }

    .edit-save-button,
    .edit-cancel-button {
        flex: 1;
        padding: 12px;
        border-radius: 12px;
        cursor: pointer;
        color: white;
    }

    .edit-save-button {
        border: none;
        background: linear-gradient(
            135deg,
            #5d69c9,
            #8062bd
        );
    }

    .edit-cancel-button {
        border: 1px solid rgba(255,255,255,0.15);
        background: rgba(255,255,255,0.06);
    }

    .delete-confirm-box {
        text-align: center;
        padding: 25px 5px 10px;
    }

    .delete-confirm-box h2 {
        font-family: Georgia, serif;
        font-weight: normal;
        font-size: 28px;
        margin-bottom: 12px;
    }

    .delete-confirm-box p {
        color: rgba(255,255,255,0.55);
        font-size: 14px;
        line-height: 1.7;
    }

    .delete-confirm-buttons {
        display: flex;
        gap: 10px;
        margin-top: 25px;
    }

    .confirm-delete-button,
    .cancel-delete-button {
        flex: 1;
        padding: 12px;
        border-radius: 12px;
        cursor: pointer;
        color: white;
    }

    .confirm-delete-button {
        border: none;
        background: #9b4059;
    }

    .cancel-delete-button {
        border: 1px solid rgba(255,255,255,0.15);
        background: rgba(255,255,255,0.06);
    }

    @media (max-width: 600px) {

        .memory-detail-actions,
        .edit-memory-buttons,
        .delete-confirm-buttons {
            flex-direction: column;
        }

    }

`;

document.head.appendChild(editDeleteStyle);


/* =========================
   SHOW MEMORY DETAIL
========================= */

function showMemoryDetail(memory, imageUrl) {

    const imageHtml = imageUrl
        ? `
            <img
                src="${imageUrl}"
                class="memory-detail-image"
                alt="${escapeHtml(memory.title)}">
        `
        : "";


    const locationHtml = memory.location
        ? `
            <div class="memory-detail-location">
                📍 ${escapeHtml(memory.location)}
            </div>
        `
        : "";


    const storyHtml = memory.description
        ? `
            <div class="memory-detail-story">
                ${escapeHtml(memory.description)}
            </div>
        `
        : `
            <div class="memory-detail-story">
                No story written yet.
            </div>
        `;


    memoryDetailContent.innerHTML = `

        ${imageHtml}

        <div class="memory-detail-date">
            ${escapeHtml(
                formatDate(memory.memory_date)
            )}
        </div>

        <h2 class="memory-detail-title">
            ${escapeHtml(memory.title)}
        </h2>

        ${locationHtml}

        ${storyHtml}

        <div class="memory-detail-actions">

            <button
                type="button"
                class="memory-edit-button"
                id="editMemoryButton">

                ✎ Edit Memory

            </button>

            <button
                type="button"
                class="memory-delete-button"
                id="deleteMemoryButton">

                🗑 Delete

            </button>

        </div>
    `;


    memoryDetailModal.classList.add("active");

    document.body.style.overflow = "hidden";


    document.getElementById(
        "editMemoryButton"
    ).onclick = function () {

        showEditForm(memory);

    };


    document.getElementById(
        "deleteMemoryButton"
    ).onclick = function () {

        showDeleteConfirmation(memory);

    };

}


/* =========================
   EDIT FORM
========================= */

function showEditForm(memory) {

    memoryDetailContent.innerHTML = `

        <h2 class="memory-detail-title">
            Edit Memory
        </h2>

        <form
            id="editMemoryForm"
            class="edit-memory-form">

            <label for="editMemoryTitle">
                Title
            </label>

            <input
                type="text"
                id="editMemoryTitle"
                value="${escapeHtml(memory.title)}"
                required>


            <label for="editMemoryDate">
                Date
            </label>

            <input
                type="date"
                id="editMemoryDate"
                value="${memory.memory_date || ""}">


            <label for="editMemoryLocation">
                Location
            </label>

            <input
                type="text"
                id="editMemoryLocation"
                value="${escapeHtml(memory.location || "")}"
                placeholder="Where did it happen?">


            <label for="editMemoryDescription">
                Our story
            </label>

            <textarea
                id="editMemoryDescription"
                placeholder="Tell the story...">${escapeHtml(
                    memory.description || ""
                )}</textarea>


            <div class="edit-memory-buttons">

                <button
                    type="button"
                    id="cancelEditButton"
                    class="edit-cancel-button">

                    Cancel

                </button>

                <button
                    type="submit"
                    class="edit-save-button">

                    Save Changes ✦

                </button>

            </div>

        </form>
    `;


    document.getElementById(
        "cancelEditButton"
    ).onclick = function () {

        closeDetailModal();

        showMemoryDetail(
            memory,
            ""
        );

    };


    document.getElementById(
        "editMemoryForm"
    ).onsubmit = async function (event) {

        event.preventDefault();


        const title =
            document
                .getElementById("editMemoryTitle")
                .value
                .trim();


        const date =
            document
                .getElementById("editMemoryDate")
                .value;


        const location =
            document
                .getElementById("editMemoryLocation")
                .value
                .trim();


        const description =
            document
                .getElementById("editMemoryDescription")
                .value
                .trim();


        const saveButton =
            this.querySelector(
                ".edit-save-button"
            );


        saveButton.disabled = true;
        saveButton.textContent =
            "Saving...";


        try {

            const {
                error
            } = await supabaseClient
                .from("memories")
                .update({

                    title: title,

                    memory_date:
                        date || null,

                    location:
                        location || null,

                    description:
                        description || null

                })
                .eq("id", memory.id);


            if (error) {
                throw error;
            }


            closeDetailModal();

            await loadMemories();


        } catch (error) {

            console.error(
                "Edit memory error:",
                error
            );

            alert(
                "Failed to update this memory."
            );


        } finally {

            saveButton.disabled = false;
            saveButton.textContent =
                "Save Changes ✦";

        }

    };

}


/* =========================
   DELETE CONFIRMATION
========================= */

function showDeleteConfirmation(memory) {

    memoryDetailContent.innerHTML = `

        <div class="delete-confirm-box">

            <h2>
                Delete this memory?
            </h2>

            <p>
                Are you sure you want to delete
                <strong>
                    ${escapeHtml(memory.title)}
                </strong>?
                <br>
                This cannot be undone.
            </p>


            <div class="delete-confirm-buttons">

                <button
                    type="button"
                    id="cancelDeleteButton"
                    class="cancel-delete-button">

                    Cancel

                </button>


                <button
                    type="button"
                    id="confirmDeleteButton"
                    class="confirm-delete-button">

                    Yes, Delete

                </button>

            </div>

        </div>
    `;


    document.getElementById(
        "cancelDeleteButton"
    ).onclick = function () {

        closeDetailModal();

    };


    document.getElementById(
        "confirmDeleteButton"
    ).onclick = async function () {

        const button = this;

        button.disabled = true;
        button.textContent =
            "Deleting...";


        try {

            /* =========================
               GET PHOTOS
            ========================= */

            const {
                data: photos,
                error: photosError
            } = await supabaseClient
                .from("memory_photos")
                .select("id, file_path")
                .eq("memory_id", memory.id);


            if (photosError) {
                throw photosError;
            }


            /* =========================
               DELETE STORAGE FILES
            ========================= */

            if (photos && photos.length > 0) {

                const filePaths =
                    photos.map(
                        photo => photo.file_path
                    );


                const {
                    error: storageError
                } = await supabaseClient
                    .storage
                    .from("memory-photos")
                    .remove(filePaths);


                if (storageError) {
                    throw storageError;
                }

            }


            /* =========================
               DELETE PHOTO RECORDS
            ========================= */

            const {
                error: photoDeleteError
            } = await supabaseClient
                .from("memory_photos")
                .delete()
                .eq("memory_id", memory.id);


            if (photoDeleteError) {
                throw photoDeleteError;
            }


            /* =========================
               DELETE MEMORY
            ========================= */

            const {
                error: memoryDeleteError
            } = await supabaseClient
                .from("memories")
                .delete()
                .eq("id", memory.id);


            if (memoryDeleteError) {
                throw memoryDeleteError;
            }


            /* =========================
               CLOSE + RELOAD
            ========================= */

            closeDetailModal();

            await loadMemories();


        } catch (error) {

            console.error(
                "Delete memory error:",
                error
            );

            alert(
                "Failed to delete this memory."
            );


            button.disabled = false;
            button.textContent =
                "Yes, Delete";

        }

    };

}


/* =========================
   LOAD MEMORIES
========================= */

async function loadMemories() {

    memoryContainer.innerHTML = `
        <div class="memory-card-empty">
            Loading our memories... ✦
        </div>
    `;


    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();


    if (userError || !user) {

        window.location.href =
            "login.html";

        return;
    }


    const {
        data: memories,
        error
    } = await supabaseClient
        .rpc("get_my_memories");


    if (error) {

        console.error(
            "Load memories error:",
            error
        );

        memoryContainer.innerHTML = `
            <div class="memory-card-empty">
                Failed to load memories.
            </div>
        `;

        return;
    }


    if (!memories || memories.length === 0) {

        memoryContainer.innerHTML = `
            <div class="memory-card-empty">
                No memories yet.<br>
                Create your first little moment ✦
            </div>
        `;

        return;
    }


    memoryContainer.innerHTML = "";


    for (const memory of memories) {

        let imageUrl = "";


        /* =========================
           GET PHOTO
        ========================= */

        const {
            data: photos,
            error: photoError
        } = await supabaseClient
            .from("memory_photos")
            .select("*")
            .eq("memory_id", memory.id)
            .order("display_order", {
                ascending: true
            })
            .limit(1);


        if (
            !photoError &&
            photos &&
            photos.length > 0
        ) {

            const filePath =
                photos[0].file_path;


            const {
                data: signedData,
                error: signedError
            } = await supabaseClient
                .storage
                .from("memory-photos")
                .createSignedUrl(
                    filePath,
                    60 * 60
                );


            if (
                !signedError &&
                signedData
            ) {

                imageUrl =
                    signedData.signedUrl;

            }

        }


        /* =========================
           CARD
        ========================= */

        const card =
            document.createElement("article");


        card.className =
            "memory-card";


        const imageHtml =
            imageUrl
                ? `
                    <img
                        src="${imageUrl}"
                        class="memory-card-image"
                        alt="${escapeHtml(
                            memory.title
                        )}">
                `
                : "";


        const locationHtml =
            memory.location
                ? `
                    <div class="memory-card-location">
                        📍 ${escapeHtml(
                            memory.location
                        )}
                    </div>
                `
                : "";


        card.innerHTML = `

            ${imageHtml}

            <div class="memory-card-date">
                ${escapeHtml(
                    formatDate(
                        memory.memory_date
                    )
                )}
            </div>

            <h2>
                ${escapeHtml(
                    memory.title
                )}
            </h2>

            ${locationHtml}

        `;


        card.onclick = function () {

            showMemoryDetail(
                memory,
                imageUrl
            );

        };


        memoryContainer.appendChild(card);
    }

}


/* =========================
   SAVE NEW MEMORY
========================= */

if (memoryForm) {

    memoryForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const title =
                document
                    .getElementById("memoryTitle")
                    .value
                    .trim();


            const date =
                document
                    .getElementById("memoryDate")
                    .value;


            const location =
                document
                    .getElementById("memoryLocation")
                    .value
                    .trim();


            const description =
                document
                    .getElementById("memoryDescription")
                    .value
                    .trim();


            const photoInput =
                document.getElementById(
                    "memoryPhoto"
                );


            const photo =
                photoInput.files[0];


            if (!title) {
                return;
            }


            const saveButton =
                memoryForm.querySelector(
                    ".save-memory-button"
                );


            saveButton.disabled = true;

            saveButton.textContent =
                "Saving memory...";


            try {

                /* =========================
                   USER
                ========================= */

                const {
                    data: { user },
                    error: userError
                } = await supabaseClient
                    .auth
                    .getUser();


                if (
                    userError ||
                    !user
                ) {

                    throw new Error(
                        "User not logged in"
                    );

                }


                /* =========================
                   CREATE MEMORY
                ========================= */

                const {
                    data: memory,
                    error: memoryError
                } =
                    await supabaseClient
                        .rpc(
                            "create_my_memory",
                            {
                                p_title:
                                    title,

                                p_description:
                                    description ||
                                    null,

                                p_memory_date:
                                    date ||
                                    null,

                                p_location:
                                    location ||
                                    null
                            }
                        );


                if (memoryError) {
                    throw memoryError;
                }


                /* =========================
                   UPLOAD PHOTO
                ========================= */

                if (photo) {

                    const extension =
                        photo.name
                            .split(".")
                            .pop()
                            .toLowerCase();


                    const filePath =
                        `${UNIVERSE_ID}/${user.id}/${crypto.randomUUID()}.${extension}`;


                    const {
                        error:
                            uploadError
                    } =
                        await supabaseClient
                            .storage
                            .from(
                                "memory-photos"
                            )
                            .upload(
                                filePath,
                                photo,
                                {
                                    contentType:
                                        photo.type,

                                    upsert:
                                        false
                                }
                            );


                    if (uploadError) {
                        throw uploadError;
                    }


                    /* =========================
                       PHOTO RECORD
                    ========================= */

                    const {
                        error:
                            photoRowError
                    } =
                        await supabaseClient
                            .from(
                                "memory_photos"
                            )
                            .insert({
                                memory_id:
                                    memory.id,

                                file_path:
                                    filePath,

                                display_order:
                                    0
                            });


                    if (photoRowError) {
                        throw photoRowError;
                    }

                }


                /* =========================
                   RESET
                ========================= */

                memoryForm.reset();

                memoryModal.classList.remove(
                    "active"
                );


                await loadMemories();


            } catch (error) {

                console.error(
                    "Save memory error:",
                    error
                );

                alert(
                    "Something went wrong while saving this memory."
                );


            } finally {

                saveButton.disabled = false;

                saveButton.textContent =
                    "Save Memory ✦";

            }

        }
    );

}


/* =========================
   ESC
========================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Escape") {

            if (
                memoryDetailModal &&
                memoryDetailModal.classList.contains(
                    "active"
                )
            ) {

                closeDetailModal();

            }

            if (
                memoryModal &&
                memoryModal.classList.contains(
                    "active"
                )
            ) {

                memoryModal.classList.remove(
                    "active"
                );

            }

        }

    }
);


/* =========================
   START
========================= */

loadMemories();
