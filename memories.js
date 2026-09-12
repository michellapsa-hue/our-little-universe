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


// =====================================================
// STATE
// =====================================================

let currentMemory = null;

let currentMemoryImageUrl = "";


// =====================================================
// LOAD MEMORIES
// =====================================================

async function loadMemories() {

    if (!memoryContainer) return;


    memoryContainer.innerHTML = `
        <div class="memory-empty">
            Loading our memories...
        </div>
    `;


    const {
        data,
        error
    } = await supabaseClient.rpc(
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


    if (!data || data.length === 0) {

        memoryContainer.innerHTML = `
            <div class="memory-empty">
                No memories yet ✦
            </div>
        `;

        return;
    }


    memoryContainer.innerHTML = "";


    for (const memory of data) {

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

async function getMemoryImage(memoryId) {

    const {
        data: photos,
        error
    } = await supabaseClient
        .from("memory_photos")
        .select("*")
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
    } = await supabaseClient
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
// CREATE CARD
// =====================================================

function createMemoryCard(
    memory,
    imageUrl
) {

    const card =
        document.createElement("article");


    card.className =
        "memory-card";


    card.innerHTML = `

        ${
            imageUrl
            ? `
                <img
                    src="${imageUrl}"
                    class="memory-card-image"
                    alt="${escapeHTML(memory.title)}"
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


    memoryContainer.appendChild(card);
}


// =====================================================
// SHOW DETAIL
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
                    src="${imageUrl}"
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

        <div class="memory-detail-actions">

            <button
                type="button"
                id="editMemoryButton"
                class="memory-edit-button"
            >
                ✎ Edit Memory
            </button>

            <button
                type="button"
                id="deleteMemoryButton"
                class="memory-delete-button"
            >
                🗑 Delete
            </button>

        </div>
    `;


    memoryDetailModal.classList.add(
        "active"
    );


    document
        .getElementById(
            "editMemoryButton"
        )
        .addEventListener(
            "click",
            () => {

                showEditForm(
                    memory
                );

            }
        );


    document
        .getElementById(
            "deleteMemoryButton"
        )
        .addEventListener(
            "click",
            () => {

                deleteMemory(
                    memory
                );

            }
        );
}


// =====================================================
// EDIT FORM
// =====================================================

function showEditForm(memory) {

    memoryDetailContent.innerHTML = `

        <div class="memory-form">

            <h2>
                Edit Memory ✦
            </h2>

            <label>
                Title
            </label>

            <input
                type="text"
                id="editTitle"
                value="${escapeAttribute(
                    memory.title
                )}"
            >


            <label>
                Date
            </label>

            <input
                type="date"
                id="editDate"
                value="${memory.memory_date || ""}"
            >


            <label>
                Location
            </label>

            <input
                type="text"
                id="editLocation"
                value="${escapeAttribute(
                    memory.location || ""
                )}"
            >


            <label>
                Story
            </label>

            <textarea
                id="editDescription"
            >${escapeHTML(
                memory.description || ""
            )}</textarea>


            <div class="memory-detail-actions">

                <button
                    type="button"
                    id="saveEditButton"
                    class="memory-edit-button"
                >
                    Save Changes
                </button>

                <button
                    type="button"
                    id="cancelEditButton"
                    class="memory-delete-button"
                >
                    Cancel
                </button>

            </div>

        </div>
    `;


    document
        .getElementById(
            "saveEditButton"
        )
        .addEventListener(
            "click",
            () => {

                updateMemory(
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
    } = await supabaseClient.rpc(
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


    alert(
        "Memory updated ✦"
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


    try {

        // =============================================
        // GET PHOTOS
        // =============================================

        const {
            data: photos,
            error: photoError
        } = await supabaseClient
            .from("memory_photos")
            .select(
                "id, file_path"
            )
            .eq(
                "memory_id",
                memory.id
            );


        if (photoError) {

            console.error(
                "Get photos error:",
                photoError
            );

            alert(
                "Failed to prepare deletion."
            );

            return;
        }


        // =============================================
        // DELETE STORAGE FILES
        // =============================================

        if (
            photos &&
            photos.length > 0
        ) {

            const paths =
                photos
                    .map(
                        photo =>
                            photo.file_path
                    )
                    .filter(Boolean);


            if (paths.length > 0) {

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

                    console.error(
                        "Storage delete error:",
                        storageError
                    );

                    alert(
                        "Failed to delete memory photo."
                    );

                    return;
                }
            }
        }


        // =============================================
        // DELETE MEMORY THROUGH RPC
        // =============================================

        const {
            data,
            error
        } = await supabaseClient.rpc(
            "delete_my_memory",
            {
                p_memory_id:
                    memory.id
            }
        );


        if (error) {

            console.error(
                "Delete memory error:",
                error
            );

            alert(
                "Failed to delete memory."
            );

            return;
        }


        if (!data) {

            alert(
                "Memory was not found."
            );

            return;
        }


        alert(
            "Memory deleted ✦"
        );


        closeDetailModal();


        await loadMemories();


    } catch (error) {

        console.error(
            "Unexpected delete error:",
            error
        );

        alert(
            "Something went wrong."
        );
    }
}


// =====================================================
// ADD MEMORY
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
// CLOSE ADD MODAL
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
// ADD MEMORY FORM
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
                            "User not logged in"
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
                            .pop();


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


                alert(
                    "Memory saved ✦"
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
// CLOSE WHEN CLICK OUTSIDE
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
// FORMAT DATE
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


    return date.toLocaleDateString(
        "en-US",
        {
            month: "long",
            day: "numeric",
            year: "numeric"
        }
    ).toUpperCase();
}


// =====================================================
// SECURITY
// =====================================================

function escapeHTML(value) {

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


function escapeAttribute(value) {

    return escapeHTML(value);
}


// =====================================================
// START
// =====================================================

loadMemories();
