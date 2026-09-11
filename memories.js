// =====================================================
// OUR LITTLE UNIVERSE
// memories.js
// =====================================================


// =====================================================
// ELEMENTS
// =====================================================

const memoryContainer = document.getElementById("memoryContainer");

const addMemoryButton = document.getElementById("addMemoryButton");
const addMemoryModal = document.getElementById("addMemoryModal");
const closeMemoryModal = document.getElementById("closeMemoryModal");

const memoryForm = document.getElementById("memoryForm");

const memoryTitle = document.getElementById("memoryTitle");
const memoryDate = document.getElementById("memoryDate");
const memoryLocation = document.getElementById("memoryLocation");
const memoryPhoto = document.getElementById("memoryPhoto");
const memoryDescription = document.getElementById("memoryDescription");


// DETAIL MODAL

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
        <p style="
            text-align:center;
            color:#aaa;
            padding:40px;
        ">
            Loading our memories...
        </p>
    `;

    const { data, error } =
        await supabaseClient.rpc("get_my_memories");

    if (error) {

        console.error("Load memories error:", error);

        memoryContainer.innerHTML = `
            <p style="
                text-align:center;
                color:#ff8a8a;
                padding:40px;
            ">
                Failed to load memories.
            </p>
        `;

        return;
    }

    if (!data || data.length === 0) {

        memoryContainer.innerHTML = `
            <p style="
                text-align:center;
                color:#aaa;
                padding:40px;
            ">
                No memories yet ✦
            </p>
        `;

        return;
    }

    memoryContainer.innerHTML = "";

    for (const memory of data) {

        let imageUrl = "";

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

        if (photoError) {
            console.error("Photo error:", photoError);
        }

        if (photos && photos.length > 0) {

            const filePath = photos[0].file_path;

            const {
                data: signedUrlData,
                error: signedUrlError
            } = await supabaseClient
                .storage
                .from("memory-photos")
                .createSignedUrl(
                    filePath,
                    60 * 60
                );

            if (!signedUrlError && signedUrlData) {
                imageUrl = signedUrlData.signedUrl;
            }
        }

        createMemoryCard(memory, imageUrl);
    }
}


// =====================================================
// CREATE MEMORY CARD
// =====================================================

function createMemoryCard(memory, imageUrl) {

    const card = document.createElement("article");

    card.className = "memory-card";

    const formattedDate =
        formatMemoryDate(memory.memory_date);

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
                ${formattedDate}
            </div>

            <h2 class="memory-card-title">
                ${escapeHTML(memory.title)}
            </h2>

            ${
                memory.location
                ? `
                    <div class="memory-card-location">
                        📍 ${escapeHTML(memory.location)}
                    </div>
                `
                : ""
            }

        </div>
    `;

    card.addEventListener("click", () => {

        showMemoryDetail(
            memory,
            imageUrl
        );

    });

    memoryContainer.appendChild(card);
}


// =====================================================
// SHOW MEMORY DETAIL
// =====================================================

function showMemoryDetail(memory, imageUrl) {

    currentMemory = memory;
    currentMemoryImageUrl = imageUrl || "";

    const formattedDate =
        formatMemoryDate(memory.memory_date);

    memoryDetailContent.innerHTML = `

        ${
            imageUrl
            ? `
                <img
                    src="${imageUrl}"
                    class="memory-detail-image"
                    alt="${escapeHTML(memory.title)}"
                >
            `
            : ""
        }

        <div class="memory-detail-date">
            ${formattedDate}
        </div>

        <h2 class="memory-detail-title">
            ${escapeHTML(memory.title)}
        </h2>

        ${
            memory.location
            ? `
                <div class="memory-detail-location">
                    📍 ${escapeHTML(memory.location)}
                </div>
            `
            : ""
        }

        ${
            memory.description
            ? `
                <div class="memory-detail-story">
                    ${escapeHTML(memory.description)}
                </div>
            `
            : `
                <div class="memory-detail-story">
                    No story written yet.
                </div>
            `
        }

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

    memoryDetailModal.classList.add("active");


    // =================================================
    // EDIT BUTTON
    // =================================================

    document
        .getElementById("editMemoryButton")
        .addEventListener("click", () => {

            showEditForm(memory);

        });


    // =================================================
    // DELETE BUTTON
    // =================================================

    document
        .getElementById("deleteMemoryButton")
        .addEventListener("click", () => {

            deleteMemory(memory);

        });
}


// =====================================================
// EDIT FORM
// =====================================================

function showEditForm(memory) {

    memoryDetailContent.innerHTML = `

        <div class="memory-edit-form">

            <h2>Edit Memory</h2>

            <label>
                Title
            </label>

            <input
                type="text"
                id="editTitle"
                value="${escapeAttribute(memory.title)}"
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
                value="${escapeAttribute(memory.location || "")}"
            >

            <label>
                Story
            </label>

            <textarea
                id="editDescription"
                rows="6"
            >${escapeHTML(memory.description || "")}</textarea>

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
        .getElementById("saveEditButton")
        .addEventListener(
            "click",
            () => updateMemory(memory)
        );


    document
        .getElementById("cancelEditButton")
        .addEventListener(
            "click",
            () => showMemoryDetail(
                memory,
                currentMemoryImageUrl
            )
        );
}


// =====================================================
// UPDATE MEMORY
// =====================================================

async function updateMemory(memory) {

    const title =
        document
            .getElementById("editTitle")
            .value
            .trim();

    const date =
        document
            .getElementById("editDate")
            .value;

    const location =
        document
            .getElementById("editLocation")
            .value
            .trim();

    const description =
        document
            .getElementById("editDescription")
            .value
            .trim();


    if (!title) {

        alert("Memory title cannot be empty.");

        return;
    }


    const saveButton =
        document.getElementById(
            "saveEditButton"
        );

    saveButton.disabled = true;
    saveButton.textContent = "Saving...";


    const {
        data,
        error
    } = await supabaseClient.rpc(
        "update_my_memory",
        {
            p_memory_id: memory.id,
            p_title: title,
            p_description: description || null,
            p_memory_date: date || null,
            p_location: location || null
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

        saveButton.disabled = false;
        saveButton.textContent = "Save Changes";

        return;
    }


    console.log(
        "Memory updated:",
        data
    );


    alert("Memory updated ✦");


    closeDetailModal();

    await loadMemories();
}


// =====================================================
// DELETE MEMORY
// =====================================================

async function deleteMemory(memory) {

    const confirmed =
        confirm(
            `Delete "${memory.title}"?\n\nThis memory and its photos will be permanently deleted.`
        );


    if (!confirmed) {
        return;
    }


    try {

        // =============================================
        // GET MEMORY PHOTOS
        // =============================================

        const {
            data: photos,
            error: photoError
        } = await supabaseClient
            .from("memory_photos")
            .select("id, file_path")
            .eq("memory_id", memory.id);


        if (photoError) {

            console.error(
                "Get memory photos error:",
                photoError
            );

            alert(
                "Failed to prepare memory deletion."
            );

            return;
        }


        // =============================================
        // DELETE FILES FROM STORAGE
        // =============================================

        if (photos && photos.length > 0) {

            const filePaths =
                photos
                    .map(photo => photo.file_path)
                    .filter(Boolean);


            if (filePaths.length > 0) {

                const {
                    error: storageError
                } = await supabaseClient
                    .storage
                    .from("memory-photos")
                    .remove(filePaths);


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
        // DELETE MEMORY USING RPC
        // =============================================

        const {
            data,
            error
        } = await supabaseClient.rpc(
            "delete_my_memory",
            {
                p_memory_id: memory.id
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
                "Memory was not found or you do not have permission to delete it."
            );

            return;
        }


        console.log(
            "Memory deleted successfully:",
            memory.id
        );


        alert("Memory deleted ✦");


        closeDetailModal();

        await loadMemories();


    } catch (error) {

        console.error(
            "Unexpected delete error:",
            error
        );

        alert(
            "Something went wrong while deleting the memory."
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
// CLOSE ADD MEMORY MODAL
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
                    "Please enter a memory title."
                );

                return;
            }


            const submitButton =
                memoryForm.querySelector(
                    'button[type="submit"]'
                );


            submitButton.disabled = true;

            submitButton.textContent =
                "Saving...";


            try {

                // =====================================
                // CREATE MEMORY
                // =====================================

                const {
                    data: memory,
                    error: memoryError
                } = await supabaseClient.rpc(
                    "create_my_memory",
                    {
                        p_title: title,
                        p_description:
                            description || null,
                        p_memory_date:
                            date || null,
                        p_location:
                            location || null
                    }
                );


                if (memoryError) {

                    console.error(
                        "Create memory error:",
                        memoryError
                    );

                    alert(
                        "Failed to create memory."
                    );

                    return;
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
                        await supabaseClient.auth.getUser();


                    if (!user) {

                        alert(
                            "You are not logged in."
                        );

                        return;
                    }


                    const {
                        data: universeId,
                        error: universeError
                    } = await supabaseClient.rpc(
                        "get_my_universe_id"
                    );


                    if (universeError) {

                        console.error(
                            "Universe error:",
                            universeError
                        );

                        alert(
                            "Failed to find your universe."
                        );

                        return;
                    }


                    const fileExtension =
                        photoFile.name
                            .split(".")
                            .pop();


                    const fileName =
                        `${crypto.randomUUID()}.${fileExtension}`;


                    const filePath =
                        `${universeId}/${user.id}/${memory.id}/${fileName}`;


                    const {
                        error: uploadError
                    } =
                        await supabaseClient
                            .storage
                            .from("memory-photos")
                            .upload(
                                filePath,
                                photoFile
                            );


                    if (uploadError) {

                        console.error(
                            "Upload error:",
                            uploadError
                        );

                        alert(
                            "Memory created, but photo upload failed."
                        );

                    } else {

                        // =================================
                        // SAVE PHOTO RECORD
                        // =================================

                        const {
                            error: photoInsertError
                        } =
                            await supabaseClient
                                .from("memory_photos")
                                .insert({
                                    memory_id:
                                        memory.id,

                                    file_path:
                                        filePath,

                                    display_order:
                                        0
                                });


                        if (photoInsertError) {

                            console.error(
                                "Photo record error:",
                                photoInsertError
                            );

                            alert(
                                "Memory created, but photo record failed."
                            );
                        }
                    }
                }


                // =====================================
                // RESET
                // =====================================

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
                    "Unexpected add memory error:",
                    error
                );

                alert(
                    "Something went wrong."
                );

            } finally {

                submitButton.disabled = false;

                submitButton.textContent =
                    "Save Memory";
            }

        }
    );
}


// =====================================================
// CLOSE DETAIL MODAL
// =====================================================

function closeDetailModal() {

    if (!memoryDetailModal) return;

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


// Close when clicking outside box

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


// =====================================================
// FORMAT DATE
// =====================================================

function formatMemoryDate(dateString) {

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
// SECURITY HELPERS
// =====================================================

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function escapeAttribute(value) {

    return escapeHTML(value);
}


// =====================================================
// EXTRA CSS
// =====================================================

const memoryActionStyle =
    document.createElement("style");

memoryActionStyle.textContent = `

.memory-detail-actions {
    display: flex;
    gap: 12px;
    margin-top: 28px;
    flex-wrap: wrap;
}

.memory-edit-button,
.memory-delete-button {
    border: none;
    padding: 12px 20px;
    border-radius: 999px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: 0.2s ease;
}

.memory-edit-button {
    background: linear-gradient(
        135deg,
        #6f72d8,
        #8662c7
    );
    color: white;
}

.memory-delete-button {
    background: rgba(
        180,
        70,
        100,
        0.18
    );
    color: #ff9aae;
}

.memory-edit-button:hover,
.memory-delete-button:hover {
    transform: translateY(-2px);
}

.memory-edit-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.memory-edit-form {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.memory-edit-form h2 {
    margin-bottom: 12px;
}

.memory-edit-form label {
    margin-top: 8px;
    font-size: 13px;
    color: #aaa;
}

.memory-edit-form input,
.memory-edit-form textarea {
    width: 100%;
    box-sizing: border-box;
    padding: 12px 14px;
    border-radius: 10px;
    border: 1px solid rgba(
        255,
        255,
        255,
        0.12
    );
    background: rgba(
        255,
        255,
        255,
        0.05
    );
    color: white;
    font-family: inherit;
    outline: none;
}

.memory-edit-form textarea {
    resize: vertical;
}

.memory-edit-form input:focus,
.memory-edit-form textarea:focus {
    border-color: #8174dc;
}

`;


document.head.appendChild(
    memoryActionStyle
);


// =====================================================
// START
// =====================================================

loadMemories();
