// =====================================================
// OUR LITTLE UNIVERSE
// letters.js
// =====================================================


// =====================================================
// ELEMENTS
// =====================================================

const lettersContainer =
    document.getElementById(
        "lettersContainer"
    );

const createLetterButton =
    document.getElementById(
        "createLetterButton"
    );

const letterModal =
    document.getElementById(
        "letterModal"
    );

const closeLetterModal =
    document.getElementById(
        "closeLetterModal"
    );

const letterForm =
    document.getElementById(
        "letterForm"
    );

const letterRecipient =
    document.getElementById(
        "letterRecipient"
    );

const letterTitle =
    document.getElementById(
        "letterTitle"
    );

const letterContent =
    document.getElementById(
        "letterContent"
    );

const letterDetailModal =
    document.getElementById(
        "letterDetailModal"
    );

const closeLetterDetail =
    document.getElementById(
        "closeLetterDetail"
    );

const letterDetailContent =
    document.getElementById(
        "letterDetailContent"
    );


// =====================================================
// STATE
// =====================================================

let currentUser = null;


// =====================================================
// PERSON NAMES
// =====================================================

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


// =====================================================
// GET CURRENT USER
// =====================================================

async function getCurrentUser() {

    const {
        data,
        error
    } =
        await supabaseClient
            .auth
            .getUser();


    if (error) {

        console.error(
            "Current user error:",
            error
        );

        return null;
    }


    currentUser =
        data.user;


    return currentUser;
}


// =====================================================
// LOAD MEMBERS
// =====================================================

async function loadMembers() {

    if (!currentUser) {
        return;
    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("universe_members")
            .select("user_id")
            .eq(
                "universe_id",
                "e6df9aea-780d-4784-a4ef-12710647444d"
            );


    if (error) {

        console.error(
            "Members error:",
            error
        );


        alert(
            "Failed to load universe members."
        );


        return;
    }


    letterRecipient.innerHTML = `
        <option value="">
            Choose someone...
        </option>
    `;


    for (
        const member of data || []
    ) {

        // Jangan tampilkan diri sendiri
        if (
            member.user_id ===
            currentUser.id
        ) {
            continue;
        }


        const option =
            document.createElement(
                "option"
            );


        option.value =
            member.user_id;


        option.textContent =
            getPersonName(
                member.user_id
            );


        letterRecipient.appendChild(
            option
        );
    }
}


// =====================================================
// LOAD LETTERS
// =====================================================

async function loadLetters() {

    if (!lettersContainer) {
        return;
    }


    lettersContainer.innerHTML = `
        <div class="letters-empty">
            Loading our letters...
        </div>
    `;


    const {
        data,
        error
    } =
        await supabaseClient
            .rpc(
                "get_my_letters"
            );


    if (error) {

        console.error(
            "Letters error:",
            error
        );


        lettersContainer.innerHTML = `
            <div class="letters-empty">
                Failed to load our letters.
            </div>
        `;


        return;
    }


    if (
        !data ||
        data.length === 0
    ) {

        lettersContainer.innerHTML = `
            <div class="letters-empty">
                No letters yet 💌
            </div>
        `;


        return;
    }


    lettersContainer.innerHTML = "";


    data.forEach(
        createLetterCard
    );
}


// =====================================================
// CREATE LETTER CARD
// =====================================================

function createLetterCard(
    letter
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "letter-card";


    card.innerHTML = `

        <div class="letter-envelope">
            💌
        </div>


        <div class="letter-to">
            To ${escapeHTML(
                getPersonName(
                    letter.recipient_id
                )
            )}
        </div>


        <h2 class="letter-title">
            ${escapeHTML(
                letter.title
            )}
        </h2>


        <div class="letter-preview">
            ${escapeHTML(
                letter.content
            )}
        </div>


        <div class="letter-from">
            — ${escapeHTML(
                getPersonName(
                    letter.sender_id
                )
            )}
        </div>

    `;


    card.addEventListener(
        "click",
        () => {

            showLetterDetail(
                letter
            );

        }
    );


    lettersContainer.appendChild(
        card
    );
}


// =====================================================
// SHOW LETTER DETAIL
// =====================================================

function showLetterDetail(
    letter
) {

    letterDetailContent.innerHTML = `

        <div class="letter-envelope">
            💌
        </div>


        <h2>
            ${escapeHTML(
                letter.title
            )}
        </h2>


        <div class="letter-detail-meta">

            From
            ${escapeHTML(
                getPersonName(
                    letter.sender_id
                )
            )}

            ·

            To
            ${escapeHTML(
                getPersonName(
                    letter.recipient_id
                )
            )}

        </div>


        <div class="letter-detail-content">

            ${escapeHTML(
                letter.content
            )}

        </div>

    `;


    letterDetailModal.classList.add(
        "active"
    );
}


// =====================================================
// OPEN WRITE LETTER
// =====================================================

if (createLetterButton) {

    createLetterButton.addEventListener(
        "click",
        async () => {

            await loadMembers();


            letterModal.classList.add(
                "active"
            );

        }
    );
}


// =====================================================
// CLOSE WRITE LETTER
// =====================================================

if (closeLetterModal) {

    closeLetterModal.addEventListener(
        "click",
        () => {

            letterModal.classList.remove(
                "active"
            );

        }
    );
}


// =====================================================
// CLOSE DETAIL
// =====================================================

if (closeLetterDetail) {

    closeLetterDetail.addEventListener(
        "click",
        () => {

            letterDetailModal.classList.remove(
                "active"
            );

        }
    );
}


// =====================================================
// CLICK OUTSIDE WRITE MODAL
// =====================================================

if (letterModal) {

    letterModal.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                letterModal
            ) {

                letterModal.classList.remove(
                    "active"
                );

            }

        }
    );
}


// =====================================================
// CLICK OUTSIDE DETAIL MODAL
// =====================================================

if (letterDetailModal) {

    letterDetailModal.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                letterDetailModal
            ) {

                letterDetailModal.classList.remove(
                    "active"
                );

            }

        }
    );
}


// =====================================================
// SAVE LETTER
// =====================================================

if (letterForm) {

    letterForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            if (!currentUser) {

                await getCurrentUser();

            }


            if (!currentUser) {

                alert(
                    "You are not logged in."
                );


                return;
            }


            const recipientId =
                letterRecipient.value;


            const title =
                letterTitle.value.trim();


            const content =
                letterContent.value.trim();


            if (
                !recipientId ||
                !title ||
                !content
            ) {

                alert(
                    "Please complete the letter."
                );


                return;
            }


            const button =
                letterForm.querySelector(
                    'button[type="submit"]'
                );


            button.disabled =
                true;


            button.textContent =
                "Saving...";


            try {

                const {
                    data,
                    error
                } =
                    await supabaseClient
                        .rpc(
                            "create_my_letter",
                            {
                                p_recipient_id:
                                    recipientId,

                                p_title:
                                    title,

                                p_content:
                                    content
                            }
                        );


                if (error) {

                    throw error;

                }


                console.log(
                    "Letter created:",
                    data
                );


                letterForm.reset();


                letterModal.classList.remove(
                    "active"
                );


                await loadLetters();


                alert(
                    "Letter saved 💌"
                );


            } catch (error) {

                console.error(
                    "Create letter error:",
                    error
                );


                alert(
                    "Failed to save letter."
                );


            } finally {

                button.disabled =
                    false;


                button.textContent =
                    "Save Letter ✦";

            }

        }
    );
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


// =====================================================
// START
// =====================================================

async function initLetters() {

    await getCurrentUser();

    await loadLetters();

}


initLetters();
