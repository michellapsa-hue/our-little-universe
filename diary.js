/* =========================================
   OUR LITTLE UNIVERSE — DIARY
========================================= */

const diaryContainer =
    document.getElementById("diaryContainer");

const createDiaryButton =
    document.getElementById("createDiaryButton");

const diaryModal =
    document.getElementById("diaryModal");

const closeDiaryModal =
    document.getElementById("closeDiaryModal");

const diaryForm =
    document.getElementById("diaryForm");

const diaryDate =
    document.getElementById("diaryDate");

const diaryTitle =
    document.getElementById("diaryTitle");

const diaryContent =
    document.getElementById("diaryContent");

const diaryDetailModal =
    document.getElementById("diaryDetailModal");

const closeDiaryDetail =
    document.getElementById("closeDiaryDetail");

const diaryDetailContent =
    document.getElementById("diaryDetailContent");


/* =========================================
   CURRENT USER
========================================= */

let currentUser = null;


/* =========================================
   GET CURRENT USER
========================================= */

async function getCurrentUser() {

    const {
        data,
        error
    } = await supabaseClient.auth.getUser();

    if (error) {

        console.error(
            "Current user error:",
            error
        );

        return null;
    }

    currentUser = data.user;

    return currentUser;
}


/* =========================================
   PERSON NAME
========================================= */

function getPersonName(userId) {

    if (
        userId ===
        "81cb9fd4-d4e4-40ae-93f2-f78e8054e34e"
    ) {
        return "Mey 💜";
    }

    if (
        userId ===
        "b6e48bbd-6547-4df3-a2d4-468507a78994"
    ) {
        return "Ian 💙";
    }

    return "My favorite person ✦";
}


/* =========================================
   FORMAT DATE
========================================= */

function formatDiaryDate(dateString) {

    if (!dateString) {
        return "";
    }

    const date =
        new Date(
            `${dateString}T00:00:00`
        );

    return date.toLocaleDateString(
        "en-US",
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );
}


/* =========================================
   LOAD DIARY
========================================= */

async function loadDiary() {

    if (!diaryContainer) {
        return;
    }

    diaryContainer.innerHTML = `
        <div class="diary-empty">
            Loading our diary...
        </div>
    `;

    const {
        data,
        error
    } = await supabaseClient
        .rpc("get_my_diary");

    if (error) {

        console.error(
            "Diary error:",
            error
        );

        diaryContainer.innerHTML = `
            <div class="diary-empty">
                Failed to load our diary.
            </div>
        `;

        return;
    }


    if (
        !data ||
        data.length === 0
    ) {

        diaryContainer.innerHTML = `
            <div class="diary-empty">
                No diary entries yet 📔
                <br>
                <span>
                    Start writing your little story.
                </span>
            </div>
        `;

        return;
    }


    diaryContainer.innerHTML = "";

    data.forEach(
        createDiaryCard
    );
}


/* =========================================
   CREATE DIARY CARD
========================================= */

function createDiaryCard(diary) {

    const card =
        document.createElement("article");

    card.className =
        "diary-card";

    card.innerHTML = `

        <div class="diary-card-icon">
            📔
        </div>

        <div class="diary-card-date">
            ${escapeHTML(
                formatDiaryDate(
                    diary.diary_date
                )
            )}
        </div>

        <h2 class="diary-card-title">
            ${escapeHTML(
                diary.title
            )}
        </h2>

        <div class="diary-card-preview">
            ${escapeHTML(
                diary.content
            )}
        </div>

        <div class="diary-card-author">
            — ${escapeHTML(
                getPersonName(
                    diary.author_id
                )
            )}
        </div>

    `;


    card.addEventListener(
        "click",
        () => {

            showDiaryDetail(
                diary
            );

        }
    );


    diaryContainer.appendChild(
        card
    );
}


/* =========================================
   SHOW DIARY DETAIL
========================================= */

function showDiaryDetail(diary) {

    diaryDetailContent.innerHTML = `

        <div class="diary-detail-icon">
            📔
        </div>

        <div class="diary-detail-date">
            ${escapeHTML(
                formatDiaryDate(
                    diary.diary_date
                )
            )}
        </div>

        <h2>
            ${escapeHTML(
                diary.title
            )}
        </h2>

        <div class="diary-detail-author">
            Written by
            ${escapeHTML(
                getPersonName(
                    diary.author_id
                )
            )}
        </div>

        <div class="diary-detail-body">
            ${escapeHTML(
                diary.content
            )}
        </div>

    `;

    diaryDetailModal.classList.add(
        "active"
    );
}


/* =========================================
   OPEN WRITE DIARY
========================================= */

if (createDiaryButton) {

    createDiaryButton.addEventListener(
        "click",
        () => {

            diaryModal.classList.add(
                "active"
            );


            /* Automatically use today's date */

            if (!diaryDate.value) {

                const today =
                    new Date()
                        .toISOString()
                        .split("T")[0];

                diaryDate.value =
                    today;
            }

        }
    );

}


/* =========================================
   CLOSE WRITE DIARY
========================================= */

if (closeDiaryModal) {

    closeDiaryModal.addEventListener(
        "click",
        () => {

            diaryModal.classList.remove(
                "active"
            );

        }
    );

}


/* =========================================
   CLOSE DETAIL
========================================= */

if (closeDiaryDetail) {

    closeDiaryDetail.addEventListener(
        "click",
        () => {

            diaryDetailModal.classList.remove(
                "active"
            );

        }
    );

}


/* =========================================
   CLICK OUTSIDE WRITE MODAL
========================================= */

if (diaryModal) {

    diaryModal.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                diaryModal
            ) {

                diaryModal.classList.remove(
                    "active"
                );

            }

        }
    );

}


/* =========================================
   CLICK OUTSIDE DETAIL MODAL
========================================= */

if (diaryDetailModal) {

    diaryDetailModal.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                diaryDetailModal
            ) {

                diaryDetailModal.classList.remove(
                    "active"
                );

            }

        }
    );

}


/* =========================================
   SAVE DIARY
========================================= */

if (diaryForm) {

    diaryForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            /* Check login */

            if (!currentUser) {
                await getCurrentUser();
            }


            if (!currentUser) {

                alert(
                    "You are not logged in."
                );

                return;
            }


            /* Get values */

            const title =
                diaryTitle.value.trim();

            const content =
                diaryContent.value.trim();

            const date =
                diaryDate.value;


            /* Validation */

            if (
                !title ||
                !content ||
                !date
            ) {

                alert(
                    "Please complete your diary."
                );

                return;
            }


            /* Submit button */

            const button =
                diaryForm.querySelector(
                    'button[type="submit"]'
                );


            button.disabled = true;

            button.textContent =
                "Saving...";


            try {

                const {
                    data,
                    error
                } = await supabaseClient
                    .rpc(
                        "create_my_diary",
                        {
                            p_title:
                                title,

                            p_content:
                                content,

                            p_diary_date:
                                date
                        }
                    );


                if (error) {
                    throw error;
                }


                console.log(
                    "Diary created:",
                    data
                );


                /* Reset */

                diaryForm.reset();


                /* Close modal */

                diaryModal.classList.remove(
                    "active"
                );


                /* Reload diary */

                await loadDiary();


            } catch (error) {

                console.error(
                    "Create diary error:",
                    error
                );

                alert(
                    "Failed to save diary."
                );


            } finally {

                button.disabled =
                    false;

                button.textContent =
                    "Save Diary ✦";

            }

        }
    );

}


/* =========================================
   ESCAPE HTML
========================================= */

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


/* =========================================
   INITIALIZE
========================================= */

async function initDiary() {

    await getCurrentUser();

    await loadDiary();

}


/* =========================================
   START
========================================= */

initDiary();
