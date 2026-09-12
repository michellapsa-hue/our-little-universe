// =====================================================
// OUR LITTLE UNIVERSE
// memories.js
// =====================================================


// =====================================================
// ELEMENTS
// =====================================================

const memoryContainer =
    document.getElementById("memoryContainer");

const addMemoryButton =
    document.getElementById("addMemoryButton");

const addMemoryModal =
    document.getElementById("addMemoryModal");

const closeMemoryModal =
    document.getElementById("closeMemoryModal");

const memoryForm =
    document.getElementById("memoryForm");

const memoryTitle =
    document.getElementById("memoryTitle");

const memoryDate =
    document.getElementById("memoryDate");

const memoryLocation =
    document.getElementById("memoryLocation");

const memoryPhoto =
    document.getElementById("memoryPhoto");

const memoryDescription =
    document.getElementById("memoryDescription");

const memoryDetailModal =
    document.getElementById("memoryDetailModal");

const closeMemoryDetail =
    document.getElementById("closeMemoryDetail");

const memoryDetailContent =
    document.getElementById("memoryDetailContent");

const memoryDetailActions =
    document.getElementById("memoryDetailActions");

const editMemoryButton =
    document.getElementById("editMemoryButton");

const deleteMemoryButton =
    document.getElementById("deleteMemoryButton");


// =====================================================
// STATE
// =====================================================

let currentMemory = null;

let currentMemoryImageUrl = "";


// =====================================================
// LOAD MEMORIES
// =====================================================

async function loadMemories() {

    if (!memoryContainer) {
        return;
    }


    memoryContainer.innerHTML = `
        <div class="memory-empty">
            Loading our memories...
        </div>
    `;


    const {
        data,
        error
    } =
        await supabaseClient.rpc(
            "get_my_memories"
        );


    if (error) {

        console.error(
            "Load memories error:",
            error
        );


        memoryContainer.innerHTML = `
            <div class="memory-empty">
                Failed to load memories.
            </div>
        `;


        return;
    }


    if (
        !data ||
        data.length === 0
    ) {

        memoryContainer.innerHTML = `
            <div class="memory-empty">
                No memories yet ✦
            </div>
        `;


        return;
    }


    memoryContainer.innerHTML = "";


    for (
        const memory of data
    ) {

        const imageUrl =
            await getMemoryImage(
                memory.id
            );


        createMemoryCard(
            memory,
            imageUrl
        );
    }
}


// =====================================================
// GET MEMORY IMAGE
// =====================================================

async function getMemoryImage(
    memoryId
) {

    const {
        data: photos,
        error
    } =
        await supabaseClient
            .from("memory_photos")
            .select(
                "id, file_path, display_order"
            )
            .eq(
                "memory_id",
                memoryId
            )
            .order(
                "display_order",
                {
                    ascending: true
                }
            )
            .limit(1);


    if (error) {

        console.error(
            "Memory photo error:",
            error
        );


        return "";
    }


    if (
        !photos ||
        photos.length === 0
    ) {

        return "";
    }


    const {
        data,
        error: signedError
    } =
        await supabaseClient
            .storage
            .from("memory-photos")
            .createSignedUrl(
                photos[0].file_path,
                60 * 60
            );


    if (
        signedError ||
        !data
    ) {

        console.error(
            "Signed URL error:",
            signedError
        );


        return "";
    }


    return data.signedUrl;
}


// =====================================================
// CREATE MEMORY CARD
// =====================================================

function createMemoryCard(
    memory,
    imageUrl
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "memory-card";


    card.innerHTML = `

        ${
            imageUrl
                ? `
                    <img
                        src="${escapeHTML(
                            imageUrl
                        )}"
                        class="memory-card-image"
                        alt="${escapeHTML(
                            memory.title
                        )}"
                    >
                `
                : ""
        }


        <div class="memory-card-content">

            <div class="memory-card-date">
                ${formatMemoryDate(
                    memory.memory_date
                )}
            </div>


            <h2 class="memory-card-title">
                ${escapeHTML(
                    memory.title
                )}
            </h2>


            ${
                memory.location
                    ? `
                        <div class="memory-card-location">
                            📍 ${escapeHTML(
                                memory.location
                            )}
                        </div>
                    `
                    : ""
            }

        </div>
    `;


    card.addEventListener(
        "click",
        () => {

            showMemoryDetail(
                memory,
                imageUrl
            );

        }
    );


    memoryContainer.appendChild(
        card
    );
}


// =====================================================
// SHOW MEMORY DETAIL
// =====================================================

function showMemoryDetail(
    memory,
    imageUrl
) {

    currentMemory =
        memory;

    currentMemoryImageUrl =
        imageUrl || "";


    memoryDetailContent.innerHTML = `

        ${
            imageUrl
                ? `
                    <img
                        src="${escapeHTML(
                            imageUrl
                        )}"
                        class="memory-detail-image"
                        alt="${escapeHTML(
                            memory.title
                        )}"
                    >
                `
                : ""
        }


        <div class="memory-detail-date">
            ${formatMemoryDate(
                memory.memory_date
            )}
        </div>


        <h2 class="memory-detail-title">
            ${escapeHTML(
                memory.title
            )}
        </h2>


        ${
            memory.location
                ? `
                    <div class="memory-detail-location">
                        📍 ${escapeHTML(
                            memory.location
                        )}
                    </div>
                `
                : ""
        }


        <div class="memory-detail-story">
            ${
                memory.description
                    ? escapeHTML(
                        memory.description
                    )
                    : "No story written yet."
            }
        </div>
    `;


    memoryDetailActions.style.display =
        "flex";


    memoryDetailModal.classList.add(
        "active"
    );
}


// =====================================================
// EDIT BUTTON
// =====================================================

if (editMemoryButton) {

    editMemoryButton.addEventListener(
        "click",
        () => {

            if (!currentMemory) {
                return;
            }


            showEditForm(
                currentMemory
            );

        }
    );
}


// =====================================================
// DELETE BUTTON
// =====================================================

if (deleteMemoryButton) {

    deleteMemoryButton.addEventListener(
        "click",
        () => {

            if (!currentMemory) {
                return;
            }


            deleteMemory(
                currentMemory
            );

        }
    );
}


// =====================================================
// EDIT FORM
// =====================================================

function showEditForm(
    memory
) {

    memoryDetailActions.style.display =
        "none";


    memoryDetailContent.innerHTML = `

        <form
            id="editMemoryForm"
            class="memory-form"
        >

            <h2>
                Edit Memory ✦
            </h2>


            <label for="editTitle">
                Title
            </label>

            <input
                type="text"
                id="editTitle"
                value="${escapeAttribute(
                    memory.title
                )}"
                required
            >


            <label for="editDate">
                Date
            </label>

            <input
                type="date"
                id="editDate"
                value="${memory.memory_date || ""}"
            >


            <label for="editLocation">
                Location
            </label>

            <input
                type="text"
                id="editLocation"
                value="${escapeAttribute(
                    memory.location || ""
                )}"
            >


            <label for="editDescription">
                Story
            </label>

            <textarea
                id="editDescription"
            >${escapeHTML(
                memory.description || ""
            )}</textarea>


            <div class="memory-detail-actions">

                <button
                    type="submit"
                    class="memory-edit-button"
                    id="saveEditButton"
                >
                    Save Changes
                </button>


                <button
                    type="button"
                    class="memory-delete-button"
                    id="cancelEditButton"
                >
                    Cancel
                </button>

            </div>

        </form>
    `;


    const editForm =
        document.getElementById(
            "editMemoryForm"
        );


    editForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            await updateMemory(
                memory
            );

        }
    );


    document
        .getElementById(
            "cancelEditButton"
        )
        .addEventListener(
            "click",
            () => {

                showMemoryDetail(
                    memory,
                    currentMemoryImageUrl
                );

            }
        );
}


// =====================================================
// UPDATE MEMORY
// =====================================================

async function updateMemory(
    memory
) {

    const title =
        document
            .getElementById(
                "editTitle"
            )
            .value
            .trim();


    const date =
        document
            .getElementById(
                "editDate"
            )
            .value;


    const location =
        document
            .getElementById(
                "editLocation"
            )
            .value
            .trim();


    const description =
        document
            .getElementById(
                "editDescription"
            )
            .value
            .trim();


    if (!title) {

        alert(
            "Memory title cannot be empty."
        );


        return;
    }


    const button =
        document.getElementById(
            "saveEditButton"
        );


    button.disabled = true;

    button.textContent =
        "Saving...";


    const {
        data,
        error
    } =
        await supabaseClient.rpc(
            "update_my_memory",
            {
                p_memory_id:
                    memory.id,

                p_title:
                    title,

                p_description:
                    description || null,

                p_memory_date:
                    date || null,

                p_location:
                    location || null
            }
        );


    if (error) {

        console.error(
            "Update memory error:",
            error
        );


        alert(
            "Failed to update memory."
        );


        button.disabled = false;

        button.textContent =
            "Save Changes";


        return;
    }


    console.log(
        "Memory updated:",
        data
    );


    closeDetailModal();


    await loadMemories();
}


// =====================================================
// DELETE MEMORY
// =====================================================

async function deleteMemory(
    memory
) {

    const confirmed =
        confirm(
            `Delete "${memory.title}"?\n\nThis memory and its photos will be permanently deleted.`
        );


    if (!confirmed) {
        return;
    }


    deleteMemoryButton.disabled =
        true;

    deleteMemoryButton.textContent =
        "Deleting...";


    try {

        // =============================================
        // GET PHOTO PATHS
        // =============================================

        const {
            data: photos,
            error: photoError
        } =
            await supabaseClient
                .from("memory_photos")
                .select(
                    "id, file_path"
                )
                .eq(
                    "memory_id",
                    memory.id
                );


        if (photoError) {

            throw photoError;
        }


        const paths =
            photos
                ? photos
                    .map(
                        photo =>
                            photo.file_path
                    )
                    .filter(Boolean)
                : [];


        // =============================================
        // DELETE MEMORY THROUGH RPC
        // =============================================

        const {
            data,
            error
        } =
            await supabaseClient.rpc(
                "delete_my_memory",
                {
                    p_memory_id:
                        memory.id
                }
            );


        if (error) {

            throw error;
        }


        console.log(
            "Memory deleted:",
            data
        );


        // =============================================
        // DELETE STORAGE FILES
        // =============================================

        if (
            paths.length > 0
        ) {

            const {
                error:
                    storageError
            } =
                await supabaseClient
                    .storage
                    .from(
                        "memory-photos"
                    )
                    .remove(
                        paths
                    );


            if (storageError) {

                console.warn(
                    "Storage cleanup warning:",
                    storageError
                );

            }
        }


        closeDetailModal();


        await loadMemories();


    } catch (error) {

        console.error(
            "Delete memory error:",
            error
        );


        alert(
            "Failed to delete memory."
        );


        deleteMemoryButton.disabled =
            false;

        deleteMemoryButton.textContent =
            "🗑 Delete";
    }
}


// =====================================================
// ADD MEMORY BUTTON
// =====================================================

if (addMemoryButton) {

    addMemoryButton.addEventListener(
        "click",
        () => {

            addMemoryModal.classList.add(
                "active"
            );

        }
    );
}


// =====================================================
// CLOSE ADD MEMORY
// =====================================================

if (closeMemoryModal) {

    closeMemoryModal.addEventListener(
        "click",
        () => {

            addMemoryModal.classList.remove(
                "active"
            );

        }
    );
}


// =====================================================
// ADD MEMORY
// =====================================================

if (memoryForm) {

    memoryForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const title =
                memoryTitle.value.trim();


            const date =
                memoryDate.value;


            const location =
                memoryLocation.value.trim();


            const description =
                memoryDescription.value.trim();


            const photoFile =
                memoryPhoto.files[0];


            if (!title) {

                alert(
                    "Please enter a title."
                );


                return;
            }


            const submitButton =
                memoryForm.querySelector(
                    'button[type="submit"]'
                );


            submitButton.disabled =
                true;

            submitButton.textContent =
                "Saving...";


            try {

                // =====================================
                // CREATE MEMORY
                // =====================================

                const {
                    data: memory,
                    error: memoryError
                } =
                    await supabaseClient.rpc(
                        "create_my_memory",
                        {
                            p_title:
                                title,

                            p_description:
                                description || null,

                            p_memory_date:
                                date || null,

                            p_location:
                                location || null
                        }
                    );


                if (memoryError) {

                    throw memoryError;
                }


                if (!memory) {

                    throw new Error(
                        "Memory was not created."
                    );
                }


                // =====================================
                // UPLOAD PHOTO
                // =====================================

                if (photoFile) {

                    const {
                        data: {
                            user
                        }
                    } =
                        await supabaseClient
                            .auth
                            .getUser();


                    if (!user) {

                        throw new Error(
                            "User not logged in."
                        );
                    }


                    const {
                        data: universeId,
                        error:
                            universeError
                    } =
                        await supabaseClient.rpc(
                            "get_my_universe_id"
                        );


                    if (universeError) {

                        throw universeError;
                    }


                    const extension =
                        photoFile.name
                            .split(".")
                            .pop()
                            .toLowerCase();


                    const fileName =
                        `${crypto.randomUUID()}.${extension}`;


                    const filePath =
                        `${universeId}/${user.id}/${memory.id}/${fileName}`;


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
                                photoFile
                            );


                    if (uploadError) {

                        throw uploadError;
                    }


                    const {
                        error:
                            photoInsertError
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


                    if (
                        photoInsertError
                    ) {

                        throw photoInsertError;
                    }
                }


                memoryForm.reset();


                addMemoryModal.classList.remove(
                    "active"
                );


                await loadMemories();


            } catch (error) {

                console.error(
                    "Create memory error:",
                    error
                );


                alert(
                    "Failed to save memory."
                );


            } finally {

                submitButton.disabled =
                    false;

                submitButton.textContent =
                    "Save Memory ✦";
            }

        }
    );
}


// =====================================================
// CLOSE DETAIL
// =====================================================

function closeDetailModal() {

    if (!memoryDetailModal) {
        return;
    }


    memoryDetailModal.classList.remove(
        "active"
    );


    memoryDetailContent.innerHTML =
        "";


    memoryDetailActions.style.display =
        "none";


    currentMemory = null;

    currentMemoryImageUrl = "";
}


if (closeMemoryDetail) {

    closeMemoryDetail.addEventListener(
        "click",
        closeDetailModal
    );
}


// =====================================================
// CLICK OUTSIDE MODAL
// =====================================================

if (memoryDetailModal) {

    memoryDetailModal.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                memoryDetailModal
            ) {

                closeDetailModal();

            }

        }
    );
}


if (addMemoryModal) {

    addMemoryModal.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                addMemoryModal
            ) {

                addMemoryModal.classList.remove(
                    "active"
                );

            }

        }
    );
}


// =====================================================
// DATE FORMAT
// =====================================================

function formatMemoryDate(
    dateString
) {

    if (!dateString) {

        return "DATE UNKNOWN";
    }


    const date =
        new Date(
            `${dateString}T00:00:00`
        );


    return date
        .toLocaleDateString(
            "en-US",
            {
                month: "long",
                day: "numeric",
                year: "numeric"
            }
        )
        .toUpperCase();
}


// =====================================================
// SECURITY
// =====================================================

function escapeHTML(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";
    }


    return String(value)
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );
}


function escapeAttribute(
    value
) {

    return escapeHTML(
        value
    );
}


// =====================================================
// START
// =====================================================

loadMemories();
