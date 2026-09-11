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
   OPEN MODAL
========================= */

if (addMemoryButton) {

    addMemoryButton.addEventListener("click", () => {
        memoryModal.classList.add("active");
    });

}


/* =========================
   CLOSE MODAL
========================= */

if (closeMemoryModal) {

    closeMemoryModal.addEventListener("click", () => {
        memoryModal.classList.remove("active");
    });

}


/* =========================
   CLICK OUTSIDE MODAL
========================= */

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


    const { data: memories, error } =
        await supabaseClient
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
       RENDER MEMORIES
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

            formattedDate = date.toLocaleDateString(
                "en-US",
                {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                }
            );
        }


        /* CARD */

        const card = document.createElement("article");

        card.className = "universe-card memory-card";


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
                                    rgba(105, 91, 180, 0.25),
                                    rgba(52, 83, 170, 0.2)
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
                            ${escapeHtml(memory.description)}
                        </p>
                    `
                    : ""
            }

        `;


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
                document.getElementById("memoryPhoto");

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

                /* =========================
                   CREATE MEMORY VIA RPC
                ========================= */

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


                /* =========================
                   UPLOAD PHOTO
                ========================= */

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


                    /* SAVE PHOTO RECORD */

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


/* =========================
   START
========================= */

loadMemories();
