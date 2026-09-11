const memoryContainer = document.getElementById("memoryContainer");
const addMemoryButton = document.getElementById("addMemoryButton");
const memoryModal = document.getElementById("memoryModal");
const closeMemoryModal = document.getElementById("closeMemoryModal");
const memoryForm = document.getElementById("memoryForm");


/* =========================
   CURRENT USER
========================= */

async function getCurrentUser() {

    const {
        data: { user },
        error
    } = await supabaseClient.auth.getUser();

    if (error || !user) {
        console.error("User error:", error);
        window.location.href = "login.html";
        return null;
    }

    return user;
}


/* =========================
   GET UNIVERSE
========================= */

async function getUniverseId() {

    const { data, error } = await supabaseClient
        .rpc("get_my_universe_id");

    if (error) {
        console.error("Universe error:", error);
        return null;
    }

    return data;
}


/* =========================
   MEMORY DETAIL MODAL
========================= */

function createDetailModal() {

    if (document.getElementById("memoryDetailModal")) {
        return;
    }

    const modal = document.createElement("div");

    modal.id = "memoryDetailModal";

    modal.innerHTML = `
        <div class="memory-detail-box">

            <button
                type="button"
                id="closeMemoryDetail"
                class="memory-detail-close">
                ×
            </button>

            <div id="memoryDetailContent"></div>

        </div>
    `;

    document.body.appendChild(modal);


    /* CSS */

    const style = document.createElement("style");

    style.id = "memory-detail-style";

    style.textContent = `

        #memoryDetailModal {
            position: fixed;
            inset: 0;
            z-index: 9999;

            display: none;
            align-items: center;
            justify-content: center;

            padding: 25px;

            background: rgba(3, 5, 20, 0.82);

            backdrop-filter: blur(14px);

            overflow-y: auto;
        }

        #memoryDetailModal.active {
            display: flex;
        }

        .memory-detail-box {
            position: relative;

            width: 100%;
            max-width: 720px;

            max-height: 90vh;

            overflow-y: auto;

            padding: 30px;

            border: 1px solid rgba(255,255,255,0.12);

            border-radius: 24px;

            background:
                linear-gradient(
                    145deg,
                    rgba(30, 31, 75, 0.96),
                    rgba(12, 16, 48, 0.96)
                );

            box-shadow:
                0 30px 80px rgba(0,0,0,0.5);
        }

        .memory-detail-close {
            position: absolute;

            top: 18px;
            right: 20px;

            width: 38px;
            height: 38px;

            border: 1px solid rgba(255,255,255,0.15);

            border-radius: 50%;

            background: rgba(255,255,255,0.07);

            color: white;

            font-size: 24px;

            line-height: 1;

            cursor: pointer;

            z-index: 2;
        }

        .memory-detail-close:hover {
            background: rgba(255,255,255,0.14);
        }

        .memory-detail-image {
            width: 100%;

            max-height: 430px;

            object-fit: cover;

            border-radius: 18px;

            margin-bottom: 28px;
        }

        .memory-detail-placeholder {
            width: 100%;
            height: 260px;

            display: flex;
            align-items: center;
            justify-content: center;

            border-radius: 18px;

            margin-bottom: 28px;

            background:
                linear-gradient(
                    135deg,
                    rgba(105,91,180,0.25),
                    rgba(52,83,170,0.2)
                );

            font-size: 50px;
        }

        .memory-detail-date {
            font-size: 11px;

            letter-spacing: 2px;

            text-transform: uppercase;

            opacity: 0.5;

            margin-bottom: 10px;
        }

        .memory-detail-title {
            font-family: Georgia, serif;

            font-size: 36px;

            font-weight: normal;

            line-height: 1.2;

            margin-bottom: 15px;
        }

        .memory-detail-location {
            color: rgba(255,255,255,0.55);

            font-size: 13px;

            margin-bottom: 28px;
        }

        .memory-detail-story {
            color: rgba(255,255,255,0.72);

            font-size: 15px;

            line-height: 1.9;

            white-space: pre-wrap;
        }

        @media (max-width: 600px) {

            #memoryDetailModal {
                padding: 15px;
            }

            .memory-detail-box {
                padding: 22px;
                border-radius: 20px;
            }

            .memory-detail-title {
                font-size: 28px;
            }

        }

    `;

    document.head.appendChild(style);


    /* CLOSE BUTTON */

    document
        .getElementById("closeMemoryDetail")
        .addEventListener("click", closeMemoryDetail);


    /* CLICK OUTSIDE */

    modal.addEventListener("click", (event) => {

        if (event.target === modal) {
            closeMemoryDetail();
        }

    });
}


function closeMemoryDetail() {

    const modal =
        document.getElementById("memoryDetailModal");

    if (modal) {
        modal.classList.remove("active");
    }
}


/* =========================
   SHOW MEMORY DETAIL
========================= */

function showMemoryDetail(memory, imageUrl, formattedDate) {

    createDetailModal();

    const modal =
        document.getElementById("memoryDetailModal");

    const content =
        document.getElementById("memoryDetailContent");


    content.innerHTML = `

        ${
            imageUrl
                ? `
                    <img
                        src="${escapeHtml(imageUrl)}"
                        class="memory-detail-image"
                        alt="${escapeHtml(memory.title)}"
                    >
                `
                : `
                    <div class="memory-detail-placeholder">
                        ✦
                    </div>
                `
        }


        <div class="memory-detail-date">
            ${escapeHtml(formattedDate)}
        </div>


        <h2 class="memory-detail-title">
            ${escapeHtml(memory.title)}
        </h2>


        ${
            memory.location
                ? `
                    <div class="memory-detail-location">
                        📍 ${escapeHtml(memory.location)}
                    </div>
                `
                : ""
        }


        ${
            memory.description
                ? `
                    <div class="memory-detail-story">
                        ${escapeHtml(memory.description)}
                    </div>
                `
                : `
                    <div class="memory-detail-story">
                        No story has been written for this memory yet.
                    </div>
                `
        }

    `;


    modal.classList.add("active");
}


/* =========================
   ADD MEMORY MODAL
========================= */

if (addMemoryButton) {

    addMemoryButton.addEventListener("click", () => {
        memoryModal.classList.add("active");
    });

}


if (closeMemoryModal) {

    closeMemoryModal.addEventListener("click", () => {
        memoryModal.classList.remove("active");
    });

}


if (memoryModal) {

    memoryModal.addEventListener("click", (event) => {

        if (event.target === memoryModal) {
            memoryModal.classList.remove("active");
        }

    });

}


/* =========================
   LOAD MEMORIES
========================= */

async function loadMemories() {

    if (!memoryContainer) return;


    memoryContainer.innerHTML = `
        <p style="
            grid-column: 1 / -1;
            text-align: center;
            opacity: 0.6;
        ">
            Loading our memories...
        </p>
    `;


    const user = await getCurrentUser();

    if (!user) return;


    const {
        data: memories,
        error
    } = await supabaseClient
        .rpc("get_my_memories");


    if (error) {

        console.error("Memory error:", error);

        memoryContainer.innerHTML = `
            <p style="
                grid-column: 1 / -1;
                text-align: center;
                opacity: 0.6;
            ">
                We couldn't load our memories.
            </p>
        `;

        return;
    }


    /* EMPTY */

    if (!memories || memories.length === 0) {

        memoryContainer.innerHTML = `
            <div style="
                grid-column: 1 / -1;
                text-align: center;
                padding: 60px 20px;
                opacity: 0.7;
            ">

                <div style="
                    font-size: 40px;
                    margin-bottom: 20px;
                ">
                    ✦
                </div>

                <h2 style="
                    font-family: Georgia, serif;
                    font-weight: normal;
                    margin-bottom: 10px;
                ">
                    Our story starts here.
                </h2>

                <p>
                    Add your first memory together.
                </p>

            </div>
        `;

        return;
    }


    memoryContainer.innerHTML = "";


    /* =========================
       RENDER
    ========================= */

    for (const memory of memories) {

        let imageUrl = null;


        /* GET PHOTO */

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


        if (!photoError && photos && photos.length > 0) {

            const {
                data: signedUrlData,
                error: signedUrlError
            } = await supabaseClient
                .storage
                .from("memory-photos")
                .createSignedUrl(
                    photos[0].file_path,
                    3600
                );


            if (!signedUrlError && signedUrlData) {
                imageUrl = signedUrlData.signedUrl;
            }
        }


        /* DATE */

        let formattedDate = "";

        if (memory.memory_date) {

            const date = new Date(
                memory.memory_date + "T00:00:00"
            );

            formattedDate =
                date.toLocaleDateString(
                    "en-US",
                    {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                    }
                );
        }


        /* CARD */

        const card =
            document.createElement("article");

        card.className =
            "universe-card memory-card";


        card.style.cursor = "pointer";


        card.innerHTML = `

            ${
                imageUrl
                    ? `
                        <img
                            src="${escapeHtml(imageUrl)}"
                            alt="${escapeHtml(memory.title)}"
                            style="
                                width: 100%;
                                height: 220px;
                                object-fit: cover;
                                border-radius: 14px;
                                margin-bottom: 22px;
                            "
                        >
                    `
                    : `
                        <div style="
                            width: 100%;
                            height: 180px;
                            border-radius: 14px;
                            margin-bottom: 22px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            background:
                                linear-gradient(
                                    135deg,
                                    rgba(105,91,180,0.25),
                                    rgba(52,83,170,0.2)
                                );
                            font-size: 38px;
                        ">
                            ✦
                        </div>
                    `
            }


            <span style="
                display: block;
                font-size: 11px;
                letter-spacing: 2px;
                text-transform: uppercase;
                opacity: 0.45;
                margin-bottom: 10px;
            ">
                ${escapeHtml(formattedDate)}
            </span>


            <h2>
                ${escapeHtml(memory.title)}
            </h2>


            ${
                memory.location
                    ? `
                        <p style="
                            margin-bottom: 14px;
                            opacity: 0.5;
                        ">
                            📍 ${escapeHtml(memory.location)}
                        </p>
                    `
                    : ""
            }


            ${
                memory.description
                    ? `
                        <p style="
                            line-height: 1.7;
                            opacity: 0.6;
                        ">
                            ${escapeHtml(
                                memory.description
                            )}
                        </p>
                    `
                    : ""
            }

        `;


        /* =========================
           CLICK CARD
        ========================= */

        card.addEventListener("click", () => {

            showMemoryDetail(
                memory,
                imageUrl,
                formattedDate
            );

        });


        memoryContainer.appendChild(card);
    }
}


/* =========================
   SAVE MEMORY
========================= */

if (memoryForm) {

    memoryForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const user = await getCurrentUser();

            if (!user) return;


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


            const saveButton =
                memoryForm.querySelector(
                    ".save-memory-button"
                );

            const originalText =
                saveButton.textContent;


            saveButton.disabled = true;

            saveButton.textContent =
                "Saving our memory...";


            try {

                /* CREATE MEMORY */

                const {
                    data: memory,
                    error: memoryError
                } = await supabaseClient
                    .rpc(
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


                /* UPLOAD PHOTO */

                if (photo) {

                    const universeId =
                        await getUniverseId();


                    if (!universeId) {
                        throw new Error(
                            "Universe not found."
                        );
                    }


                    const extension =
                        photo.name
                            .split(".")
                            .pop()
                            .toLowerCase();


                    const filePath =
                        `${universeId}/${user.id}/${crypto.randomUUID()}.${extension}`;


                    const {
                        error: uploadError
                    } = await supabaseClient
                        .storage
                        .from("memory-photos")
                        .upload(
                            filePath,
                            photo
                        );


                    if (uploadError) {
                        throw uploadError;
                    }


                    /* PHOTO RECORD */

                    const {
                        error: photoRecordError
                    } = await supabaseClient
                        .from("memory_photos")
                        .insert({
                            memory_id:
                                memory.id,

                            file_path:
                                filePath,

                            display_order:
                                0
                        });


                    if (photoRecordError) {
                        throw photoRecordError;
                    }

                }


                /* SUCCESS */

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
                    "We couldn't save this memory yet. Please try again."
                );


            } finally {

                saveButton.disabled = false;

                saveButton.textContent =
                    originalText;
            }

        }
    );

}


/* =========================
   ESCAPE HTML
========================= */

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================
   START
========================= */

loadMemories();
