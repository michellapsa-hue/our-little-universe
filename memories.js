const memoryContainer = document.getElementById("memoryContainer");

async function loadMemories() {

    if (!memoryContainer) return;

    const {
        data: { user }
    } = await supabaseClient.auth.getUser();

    if (!user) return;

    const { data: memberships, error: memberError } =
        await supabaseClient
            .from("universe_members")
            .select("universe_id")
            .eq("user_id", user.id);

    if (memberError) {
        console.error("Member error:", memberError);
        return;
    }

    if (!memberships || memberships.length === 0) {
        memoryContainer.innerHTML =
            "<p>No universe found.</p>";
        return;
    }

    const universeId = memberships[0].universe_id;

    const { data: memories, error } =
        await supabaseClient
            .from("memories")
            .select("*")
            .eq("universe_id", universeId)
            .order("memory_date", {
                ascending: false
            });

    if (error) {
        console.error("Memory error:", error);
        return;
    }

    if (!memories || memories.length === 0) {

        memoryContainer.innerHTML = `
            <div class="universe-card">
                <span class="card-icon">✨</span>
                <h2>No memories yet</h2>
                <p>
                    Our first memory is waiting to be written.
                </p>
            </div>
        `;

        return;
    }

    memoryContainer.innerHTML = "";

    memories.forEach(memory => {

        const card = document.createElement("a");

        card.href = "#";
        card.className = "universe-card";

        card.innerHTML = `
            <span class="card-icon">📸</span>

            <h2>
                ${memory.title}
            </h2>

            <p>
                ${memory.description || ""}
            </p>
        `;

        memoryContainer.appendChild(card);

    });
}


loadMemories();
