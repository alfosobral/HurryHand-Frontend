



export async function getLoggedUser() {
    const token = localStorage.getItem("token");

    if (!token) {
        return null; // No hay sesión
    }

    try {
        const res = await fetch("http://localhost:8080/api/auth/me", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (res.status === 401) {
            return null;
        }

        if (!res.ok) {
            throw new Error("Error al obtener usuario");
        }

        return await res.json(); //UserResponseDTO

    } catch (error) {
        console.error("Error en getLoggedUser:", error);
        return null;
    }
}