const memoryContainer = document.getElementById("memoryContainer");

const addMemoryButton = document.getElementById("addMemoryButton");
const memoryModal = document.getElementById("memoryModal");
const closeMemoryModal = document.getElementById("closeMemoryModal");
const memoryForm = document.getElementById("memoryForm");

const memoryDetailModal = document.getElementById("memoryDetailModal");
const closeMemoryDetail = document.getElementById("closeMemoryDetail");
const memoryDetailContent = document.getElementById("memoryDetailContent");

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

    return new Date(date + "T00:00:00").toLocaleDateString(
        "en-US",
        {
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );
}


/* =========================
   ADD MEMORY MODAL
========================= */

if (addMemoryButton) {
    addMemoryButton.addEventListener("click", function () {
        memoryModal.classList.add("active");
    });
}


if (closeMemoryModal) {
    closeMemoryModal.addEventListener("click", function () {
        memoryModal.classList.remove("active");
    });
}


if (memoryModal) {
    memoryModal.addEventListener("click", function (event) {

        if (event.target === memoryModal) {
            memoryModal.classList.remove("active");
        }

    });
}


/* =========================
   MEMORY DETAIL
========================= */

function showMemoryDetail(memory, imageUrl) {

    let imageHtml = "";

    if (imageUrl) {
        imageHtml = `
            <img
                src="${imageUrl}"
                class="memory-detail-image"
                alt="${escapeHtml(memory.title)}">
        `;
    }


    let locationHtml = "";

    if (memory.location) {
        locationHtml = `
            <div class="memory-detail-location">
                📍 ${escapeHtml(memory.location)}
            </div>
        `;
    }


    let storyHtml = "";

    if (memory.description) {
        storyHtml = `
            <div class="memory-detail-story">
                ${escapeHtml(memory.description)}
            </div>
        `;
    } else {
        storyHtml = `
            <div class="memory-detail-story">
                No story written yet.
            </div>
        `;
    }


    memoryDetailContent.innerHTML = `

        ${imageHtml}

        <div class="memory-detail-date">
            ${escapeHtml(formatDate(memory.memory_date))}
        </div>

        <h2 class="memory-detail-title">
            ${escapeHtml(memory.title)}
        </h2>

        ${locationHtml}

        ${storyHtml}

    `;


    memoryDetailModal.classList.add("active");

    document.body.style.overflow = "hidden";
}


/* =========================
   CLOSE DETAIL MODAL
========================= */

function closeDetailModal() {

    memoryDetailModal.classList.remove("active");

    document.body.style.overflow = "";
}


/*
   IMPORTANT:
   Use onclick directly so the X button
   cannot get blocked by another listener.
*/

if (closeMemoryDetail) {

    closeMemoryDetail.onclick = function (event) {

        event.preventDefault();
        event.stopPropagation();

        closeDetailModal();

    };
}


/* =========================
   CLICK OUTSIDE DETAIL
========================= */

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
   ESC KEY
========================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Escape") {

            if (
                memoryDetailModal &&
                memoryDetailModal.classList.contains("active")
            ) {
                closeDetailModal();
            }


            if (
                memoryModal &&
                memoryModal.classList.contains("active")
            ) {
                memoryModal.classList.remove("active");
            }

        }

    }
);


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
        window.location.href = "login.html";
        return;
    }


    const {
        data: memories,
        error
    } = await supabaseClient.rpc("get_my_memories");


    if (error) {

        console.error("Load memories error:", error);

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

            const filePath = photos[0].file_path;


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


            if (!signedError && signedData) {
                imageUrl = signedData.signedUrl;
            }
        }


        /* =========================
           CREATE CARD
        ========================= */

        const card = document.createElement("article");

        card.className = "memory-card";


        const imageHtml = imageUrl
            ? `
                <img
                    src="${imageUrl}"
                    class="memory-card-image"
                    alt="${escapeHtml(memory.title)}">
            `
            : "";


        const locationHtml = memory.location
            ? `
                <div class="memory-card-location">
                    📍 ${escapeHtml(memory.location)}
                </div>
            `
            : "";


        card.innerHTML = `

            ${imageHtml}

            <div class="memory-card-date">
                ${escapeHtml(
                    formatDate(memory.memory_date)
                )}
            </div>

            <h2>
                ${escapeHtml(memory.title)}
            </h2>

            ${locationHtml}

        `;


        /* =========================
           CLICK MEMORY CARD
        ========================= */

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
   SAVE MEMORY
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
                document.getElementById("memoryPhoto");


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
            saveButton.textContent = "Saving memory...";


            try {

                /* =========================
                   CURRENT USER
                ========================= */

                const {
                    data: { user },
                    error: userError
                } = await supabaseClient.auth.getUser();


                if (userError || !user) {
                    throw new Error("User not logged in");
                }


                /* =========================
                   CREATE MEMORY
                ========================= */

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
                        error: uploadError
                    } = await supabaseClient
                        .storage
                        .from("memory-photos")
                        .upload(
                            filePath,
                            photo,
                            {
                                contentType: photo.type,
                                upsert: false
                            }
                        );


                    if (uploadError) {
                        throw uploadError;
                    }


                    /* =========================
                       SAVE PHOTO RECORD
                    ========================= */

                    const {
                        error: photoRowError
                    } = await supabaseClient
                        .from("memory_photos")
                        .insert({
                            memory_id: memory.id,
                            file_path: filePath,
                            display_order: 0
                        });


                    if (photoRowError) {
                        throw photoRowError;
                    }
                }


                /* =========================
                   RESET
                ========================= */

                memoryForm.reset();

                memoryModal.classList.remove("active");


                /* =========================
                   RELOAD
                ========================= */

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
   START
========================= */

loadMemories();
