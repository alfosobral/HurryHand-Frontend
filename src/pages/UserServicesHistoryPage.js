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



export default function UserServicesHistoryPage() {

    const [user, setUser] = useState(null);
    const [hasSession, setHasSession] = useState(false);
    const [loading, setLoading] = useState(true);
    const [services, setServices] = useState([]); 
    const [activeService, setActiveService] = useState(null);
    const [comment, setComment] = useState("");

    const handleReviewClick = (serviceId) => {
    setActiveService(activeService === serviceId ? null : serviceId);
    setComment("");
    };

    const handleSubmit = () => {
    console.log("Comentario enviado:", comment);
    setComment("");
    setActiveService(null);
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
                setLoading(false);
            }
        })();
    }, [user]); //si cambia el user se vuvle a ejecutar ese useEffect, es solo caudno se carga componente o cuando cambia esta variable



  return (
    <div className="user-services-history-page">
      <Navbar searchbarOff={true} />

      <div className="user-services-history-body">
        <h1 className="user-services-history-title">Historial de Reservas</h1>

        <div className="user-services-list">
          {services.length === 0 ? (
            <p className="no-services-message">No hay servicios registrados.</p>
          ) : (
            services.map((service) => (
              <div key={service.id}>
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

                {activeService === service.appointmentId && (
                  <div className="review-comment-box">
                    <Card className="Build-your-review-card">
                        <p className="card-title-make-review"> Deja tu comentario </p>
                        <TextAreaForReview
                            id={`review-comment-${service.appointmentId}`}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />

                        <SubmitButton className="submit-button-review"> Enviar </SubmitButton>
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