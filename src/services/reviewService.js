const API_BASE = process.env.REACT_APP_API_URL;
export async function createReview(reviewData) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}/api/review`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(reviewData),
  });

  if (!res.ok) {
    throw new Error("Error al crear la review");
  }

  return await res.json();
}