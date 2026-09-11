const memoryContainer =
    document.getElementById("memoryContainer");

const memoryForm =
    document.getElementById("memoryForm");

const memoryModal =
    document.getElementById("memoryModal");

const addMemoryButton =
    document.getElementById("addMemoryButton");

const closeMemoryModal =
    document.getElementById("closeMemoryModal");


/* =========================
   MODAL
========================= */

if (addMemoryButton) {

    addMemoryButton.addEventListener(
        "click",
        () => {

            memoryModal.classList.add(
                "active"
            );

        }
    );

}


if (closeMemoryModal) {

    closeMemoryModal.addEventListener(
        "click",
        () => {

            memoryModal.classList.remove(
                "active"
            );

        }
    );

}


if (memoryModal) {

    memoryModal.addEventListener(
        "click",
        (event) => {

            if (
                event.target === memoryModal
            ) {

                memoryModal.classList.remove(
                    "active"
                );

            }

        }
    );

}


document.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Escape") {

            memoryModal?.classList.remove(
                "active"
            );

        }

    }
);


/* =========================
   GET CURRENT USER
========================= */

async function getCurrentUser() {

    const {
        data: { user },
        error
    } = await supabaseClient.auth.getUser();


    if (error) {

        console.error(
            "User error:",
            error
        );

        return null;
    }


    return user;
}


/* =========================
   GET UNIVERSE
========================= */

async function getUniverseId(userId) {

    /*
     * TEMPORARY:
     * We will adjust the membership
     * column after checking your
     * universe_members structure.
     */

    const {
        data: memberships,
        error
    } = await supabaseClient
        .from("universe_members")
        .select("universe_id")
        .eq("user_id", userId);


    if (error) {

        console.error(
            "Member error:",
            error
        );

        return null;
    }


    if (
        !memberships ||
        memberships.length === 0
    ) {

        console.error(
            "No universe membership found."
        );

        return null;
    }


    return memberships[0].universe_id;
}


/* =========================
   FORMAT DATE
========================= */

function formatDate(dateString) {

    const date =
        new Date(
            dateString + "T00:00:00"
        );


    return date.toLocaleDateString(
        "en-US",
        {
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );

}


/* =========================
   LOAD MEMORIES
========================= */

async function loadMemories() {

    if (!memoryContainer) return;


    const user =
        await getCurrentUser();


    if (!user) return;


    const universeId =
        await getUniverseId(
            user.id
        );


    if (!universeId) {

        memoryContainer.innerHTML = `
            <div class="empty-memory">
                <p>
                    Your universe could not be found.
                </p>
            </div>
        `;

        return;
    }


    const {
        data: memories,
        error
    } = await supabaseClient
        .from("memories")
        .select("*")
        .eq(
            "universe_id",
            universeId
        )
        .order(
            "memory_date",
            {
                ascending: false
            }
        );


    if (error) {

        console.error(
            "Memory error:",
            error
        );

        return;
    }


    if (
        !memories ||
        memories.length === 0
    ) {

        memoryContainer.innerHTML = `
            <div class="universe-card">

                <span class="card-icon">
                    ✨
                </span>

                <h2>
                    No memories yet
                </h2>

                <p>
                    Our first memory is waiting
                    to be written.
                </p>

            </div>
        `;

        return;
    }


    memoryContainer.innerHTML = "";


    for (const memory of memories) {

        let photoUrl = null;


        const {
            data: photos
        } = await supabaseClient
            .from("memory_photos")
            .select("*")
            .eq(
                "memory_id",
                memory.id
            )
            .order(
                "display_order",
                {
                    ascending: true
                }
            )
            .limit(1);


        if (
            photos &&
            photos.length > 0
        ) {

            const {
                data: signedUrlData,
                error: signedError
            } = await supabaseClient
                .storage
                .from("memory-photos")
                .createSignedUrl(
                    photos[0].file_path,
                    3600
                );


            if (!signedError) {

                photoUrl =
                    signedUrlData.signedUrl;

            }

        }


        const card =
            document.createElement(
                "div"
            );


        card.className =
            "universe-card";


        card.style.overflow =
            "hidden";


        card.innerHTML = `

            ${
                photoUrl
                ? `
                    <img
                        src="${photoUrl}"
                        alt="${memory.title}"
                        style="
                            width:100%;
                            height:220px;
                            object-fit:cover;
                            border-radius:14px;
                            margin-bottom:22px;
                        "
                    >
                `
                : `
                    <span class="card-icon">
                        📸
                    </span>
                `
            }


            <h2>
                ${memory.title}
            </h2>


            ${
                memory.memory_date
                ? `
                    <p>
                        ${formatDate(
                            memory.memory_date
                        )}
                    </p>
                `
                : ""
            }


            ${
                memory.location
                ? `
                    <p>
                        📍 ${memory.location}
                    </p>
                `
                : ""
            }


            ${
                memory.description
                ? `
                    <p
                        style="
                            margin-top:12px;
                            line-height:1.6;
                        "
                    >
                        ${memory.description}
                    </p>
                `
                : ""
            }

        `;


        memoryContainer.appendChild(
            card
        );

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


            const user =
                await getCurrentUser();


            if (!user) {

                alert(
                    "Please login first."
                );

                return;
            }


            const universeId =
                await getUniverseId(
                    user.id
                );


            if (!universeId) {

                alert(
                    "Your universe could not be found."
                );

                return;
            }


            const title =
                document
                    .getElementById(
                        "memoryTitle"
                    )
                    .value
                    .trim();


            const date =
                document
                    .getElementById(
                        "memoryDate"
                    )
                    .value;


            const location =
                document
                    .getElementById(
                        "memoryLocation"
                    )
                    .value
                    .trim();


            const description =
                document
                    .getElementById(
                        "memoryDescription"
                    )
                    .value
                    .trim();


            const photoInput =
                document.getElementById(
                    "memoryPhoto"
                );


            const photo =
                photoInput?.files?.[0];


            if (!title) {

                alert(
                    "Please give this memory a title."
                );

                return;
            }


            const saveButton =
                memoryForm.querySelector(
                    ".save-memory-button"
                );


            saveButton.disabled =
                true;


            saveButton.textContent =
                "Saving our memory...";


            /* CREATE MEMORY */

            const {
                data: memory,
                error
            } = await supabaseClient
                .from("memories")
                .insert([
                    {
                        universe_id:
                            universeId,

                        title:
                            title,

                        description:
                            description ||
                            null,

                        memory_date:
                            date ||
                            null,

                        location:
                            location ||
                            null,

                        created_by:
                            user.id
                    }
                ])
                .select()
                .single();


            if (error) {

                console.error(
                    "Save memory error:",
                    error
                );


                alert(
                    "Something went wrong while saving the memory."
                );


                saveButton.disabled =
                    false;


                saveButton.textContent =
                    "Save Memory ✦";


                return;
            }


            /* UPLOAD PHOTO */

            if (photo) {

                const extension =
                    photo.name
                        .split(".")
                        .pop();


                const fileName =
                    `${crypto.randomUUID()}.${extension}`;


                const filePath =
                    `${universeId}/${user.id}/${fileName}`;


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

                    console.error(
                        "Upload error:",
                        uploadError
                    );


                    alert(
                        "Memory saved, but the photo could not be uploaded."
                    );

                } else {

                    const {
                        error:
                            photoInsertError
                    } = await supabaseClient
                        .from(
                            "memory_photos"
                        )
                        .insert([
                            {
                                memory_id:
                                    memory.id,

                                file_path:
                                    filePath,

                                caption:
                                    null,

                                display_order:
                                    0
                            }
                        ]);


                    if (
                        photoInsertError
                    ) {

                        console.error(
                            "Photo record error:",
                            photoInsertError
                        );

                    }

                }

            }


            /* RESET */

            memoryForm.reset();


            memoryModal.classList.remove(
                "active"
            );


            saveButton.disabled =
                false;


            saveButton.textContent =
                "Save Memory ✦";


            await loadMemories();

        }
    );

}


/* =========================
   START
========================= */

loadMemories();

/* =========================
   START
========================= */

loadMemories();
