import { useEffect, useState } from "react";
import { getLoggedUser } from "../services/userService";
import Navbar from "../components/Navbar/Navbar";
import Card from "../components/Card/Card";
import "./styles/UserServicesHistoryPage.css";
import { getMyPastAppointments } from "../services/appointmentService";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import SubmitButton from "../components/SubmitButton/SubmitButton";
import ReviewButton from "../components/ReviewButton/ReviewButton";
import TextAreaForReview from "../components/TextAreaForReview/TextAreaForReview";
import Radio from "../components/Rating/Rating";
import { createReview } from "../services/reviewService";



export default function UserServicesHistoryPage() {

    const [user, setUser] = useState(null);
    const [hasSession, setHasSession] = useState(false);
    const [loading, setLoading] = useState(true);
    const [services, setServices] = useState([]); 
    const [activeService, setActiveService] = useState(null);
    const [comment, setComment] = useState("");
    const [ratings, setRatings] = useState({});

    const handleReviewClick = (serviceId) => {
        setActiveService(activeService === serviceId ? null : serviceId);
        setComment("");
    };

    const handleSubmit = async (serviceId) => {
        // Construimos el cuerpo de la review
        const reviewData = {
            appointmentID: serviceId,
            title: "Reseña del usuario",
            body: comment,
            rating: ratings[serviceId] || 0,
            updatedAt: new Date().toISOString(),
            sentAt: new Date().toISOString(),
        };

        try {
            await createReview(reviewData);
            console.log("✅ Review enviada con éxito:", reviewData);

            // ✅ Aplicar animación de desvanecimiento
            const card = document.querySelector(`[data-service-id="${serviceId}"]`);
            if (card) {
            card.classList.add("fade-out");
            }

            // ⏳ Esperar a que termine la animación antes de borrar
            setTimeout(() => {
                setServices((prev) => prev.filter((s) => s.appointmentId !== serviceId));
            }, 500); // mismo tiempo que la animación

            setComment("");
            setActiveService(null);

        } catch (error) {
            console.error("❌ Error al enviar review:", error);
            alert("Ocurrió un error al enviar la review");
        }
    };


    const handleRatingChange = (serviceId, newRating) => {
        setRatings((prev) => ({
        ...prev,
        [serviceId]: newRating, // Guarda el valor para ese servicio
        }));
    };


    useEffect(() => {
        (async () => {
            try {
                const [userData] = await Promise.all([
                    getLoggedUser(),
                ]);

                setUser(userData || null);
                setHasSession(!!userData && userData !== false);

            } catch (err) {
                console.error("Error cargando datos:", err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);



    useEffect(() => {
        if (!user) return;
        (async () => {
            try {
                setLoading(true);
                const data = await getMyPastAppointments();
                setServices(data || []);
            } catch (err) {
                console.error("Error para conseguir los appointments pasados:", err);
            } finally {
                setTimeout(() => setLoading(false), 300);
            }
        })();
    }, [user]); //si cambia el user se vuvle a ejecutar ese useEffect, es solo caudno se carga componente o cuando cambia esta variable



  return (
    <div className="user-services-history-page">
      <Navbar searchbarOff={true} />

      <div className="user-services-history-body">
        <h1 className="user-services-history-title">Historial de Reservas</h1>

        <div className="user-services-list">
            {loading ? (
            <p className="loading-message">Cargando servicios Consumidos</p>
            ) : services.length === 0 ? (
            <p className="no-services-message">No hay servicios pasados para hacer review</p>
            ) : (
            services.map((service) => (
              <div key={service.id}>
                <div key={service.appointmentId} data-service-id={service.appointmentId}>
                    <Card className="user-service-card">
                    <div className="user-service-card-content">
                        <div className="user-service-info">
                        <p className="user-service-title">{service.servicePostTitle}</p>
                        <p className="user-service-date">
                            {format(
                            new Date(service.appointmentDateTime),
                            "dd 'de' MMMM 'de' yyyy 'a las' HH:mm",
                            { locale: es }
                            )}
                        </p>
                        <p className="user-service-duration">{service.durationMinutes} min</p>
                        </div>

                        <ReviewButton
                        onClick={() => handleReviewClick(service.appointmentId)}
                        />
                        
                    </div>
                    </Card>
                </div>

                {activeService === service.appointmentId && (
                  <div className="review-comment-box">
                    <Card className="Build-your-review-card">
                        <p className="card-title-make-review"> Deja tu comentario </p>
                        <TextAreaForReview
                            id={`review-comment-${service.appointmentId}`}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />

                        <SubmitButton className="submit-button-review" onClick={()=>handleSubmit(service.appointmentId)}> Enviar </SubmitButton>
                        <Radio
                        value={ratings[service.appointmentId] || 0}
                        onChange={(val) => handleRatingChange(service.appointmentId, val)}
                        />
                    </Card>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}