const memoryContainer =
    document.getElementById("memoryContainer");

const memoryForm =
    document.getElementById("memoryForm");

const memoryModal =
    document.getElementById("memoryModal");


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
            "No universe found."
        );

        return null;
    }

    return memberships[0].universe_id;
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
        await getUniverseId(user.id);

    if (!universeId) {

        memoryContainer.innerHTML = `
            <div class="empty-memory">

                <p>
                    No universe found.
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

        memoryContainer.innerHTML = `
            <div class="empty-memory">

                <p>
                    We couldn't load our memories.
                </p>

            </div>
        `;

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


    memories.forEach(memory => {

        const card =
            document.createElement("div");

        card.className =
            "universe-card";


        card.innerHTML = `

            <span class="card-icon">
                📸
            </span>

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
                    <p style="
                        margin-top: 12px;
                        line-height: 1.6;
                    ">
                        ${memory.description}
                    </p>
                `
                : ""
            }

        `;


        memoryContainer.appendChild(card);

    });

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


            saveButton.disabled = true;

            saveButton.textContent =
                "Saving our memory...";


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
                            description || null,

                        memory_date:
                            date || null,

                        location:
                            location || null,

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

                saveButton.disabled = false;

                saveButton.textContent =
                    "Save Memory ✦";

                return;
            }


            console.log(
                "Memory saved:",
                memory
            );


            /* RESET FORM */

            memoryForm.reset();


            /* CLOSE MODAL */

            memoryModal.classList.remove(
                "active"
            );


            /* RESTORE BUTTON */

            saveButton.disabled = false;

            saveButton.textContent =
                "Save Memory ✦";


            /* RELOAD MEMORIES */

            await loadMemories();

        }
    );

}


/* =========================
   START
========================= */

loadMemories();
