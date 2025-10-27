import style from "./styles/ServicePostInfo.css";
import {getLoggedUser} from "../services/userService";
import {getServicePostById} from "../services/servicePosts";
import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import ImageCarousel from "../components/ ImageCarousel/ImageCarousel";
import Navbar from "../components/Navbar/Navbar";
import Rating from "../components/Rating/Rating";
import {formatDate} from "date-fns";
import {es} from "date-fns/locale";
import SelectableList from "../components/SelectableList/SelectableList";
import SubmitButton from "../components/SubmitButton/SubmitButton";
import {createAppointment} from "../services/appointmentService";






export default function ServicePostInfo() {
    const { id } = useParams();

    const [user, setUser] = useState(null);
    const [hasSession, setHasSession] = useState(false);
    const [servicePost, setServicePost] = useState(null);
    const [loading, setLoading] = useState(true);

    const [reserva, setReserva] = useState({
        servicePostId: id,
        dateTime: null
    });

    useEffect(() => {

        (async () => {
            try {
                const [userData, serviceData] = await Promise.all([
                    getLoggedUser(),
                    getServicePostById(id),
                ]);

                setUser(userData || null);
                setHasSession(!!userData && userData !== false);
                setServicePost(serviceData || null);
            } catch (err) {
                console.error("Error cargando datos:", err);
            } finally {
                setLoading(false);
            }
        })();

    }, [id]);

    useEffect(() => {
        if (reserva.dateTime) {
            console.log("Nueva fecha seleccionada:", reserva.dateTime);
        } else {
            console.log("Fecha deseleccionada");
        }
    }, [reserva.dateTime]);

    function createDatesList(dates = []) {
        const formattedDates = {};
        dates.forEach(d => {
            const date = new Date(d);
            const key = d;
            const value = formatDate(date, "dd/MM/yyyy 'a las' HH:mm", { locale: es });
            formattedDates[key] = value;
        });
        return formattedDates;
    }

    function handleDateChange(vals) {
        const selected = Array.isArray(vals) ? vals[0] : vals;
        setReserva((prev) => ({
            ...prev,
            dateTime: selected,
        }));
    }

    const [showConfirm, setShowConfirm] = useState(false);
    const [warnNoDate, setWarnNoDate] = useState(false);

    function handleReserveClick(e) {
        if (e && e.preventDefault) e.preventDefault();
        if (!reserva.dateTime) {
            setWarnNoDate(true);
            setTimeout(() => setWarnNoDate(false), 2200);
            return;
        }

        if (!hasSession) return;
        setShowConfirm(true);
    }

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(null);
    const [submitError, setSubmitError] = useState(null);

    async function handleConfirmReserve() {
        setIsSubmitting(true);
        setSubmitError(null);
        setSubmitSuccess(null);

        try {
            const dto = {
                servicePostId: reserva.servicePostId,
                dateTime: reserva.dateTime,
            };
            await createAppointment(dto);
            setSubmitSuccess(true);

            setTimeout(() => {
                window.location.reload();
            }, 1200);

        } catch (err) {
            console.error("Error creando reserva:", err);
            setSubmitError(err?.message || "Error al crear la reserva");
            setSubmitSuccess(false);
        } finally {
            setIsSubmitting(false);
        }
    }

    function handleCloseAfterSuccess() {
        window.location.reload();
    }

    function handleCancelReserve() {
        setShowConfirm(false);
    }

    if (loading) return <p>Cargando...</p>;
    if (!servicePost) return <p>No se encontró el servicio solicitado.</p>;

    return (
        <div className={"service-post-info-page"}>
            <div className={"service-post-info-page-header"}>
                <Navbar />
            </div>

            <div className={"service-post-info-page-body"}>
                <div className={"service-post-info-block"}>
                    <div className={"service-post-info-block-col1"}>
                        <ImageCarousel
                            images={[
                                "https://ferrari-cdn.thron.com/delivery/public/thumbnail/ferrari/4096b5fd-63e2-4a12-af3b-45ae75e4c60b/bocxuw/std/488x325/4096b5fd-63e2-4a12-af3b-45ae75e4c60b?scalemode=auto",
                                "https://cdn.ferrari.com/cms/network/media/img/resize/66e0571870dcce0011d9c5d0-2002_enzoferrari_cassetto-archivio_02-new?"
                            ]}
                            className="image-carrousel"
                            height="auto"
                            width="550px"
                        />
                        <h2 className={"service-post-info-overview1"}> Descripción </h2>
                        <p className={"service-post-info-overview2"}> {servicePost.description} </p>
                    </div>

                    <div className={"service-post-info-block-col2"}>
                        <h1 className={"service-post-info-title"}> {servicePost.title} </h1>
                        <div className={"service-post-info-rating-div"}>
                            <p className={"service-post-info-rating1"}> Rating: </p>
                            <p className={"service-post-info-rating2"}>{servicePost.rating !== null ? servicePost.rating : "Sin reviews"}</p>
                        </div>
                        <h2 className={"service-post-info-price"}> {servicePost.price}$ </h2>
                        <div className={"service-post-info-duration-div"}>
                            <p className={"service-post-info-duration1"}> Duración:</p>
                            <p className={"service-post-info-duration2"}> {servicePost.duration} </p>
                            <p className={"service-post-info-duration3"}> minutos </p>
                        </div>
                        <div className={"service-post-info-date-div"}>
                            <p className={"service-post-info-date1"}> Fecha de publicación: </p>
                            <p className={"service-post-info-date2"}> {formatDate(servicePost.createdAt, "dd 'de' MMMM 'del' yyyy", { locale: es })} </p>
                        </div>
                    </div>

                    <div className={"service-post-info-block-col3"}>
                        <form className={"service-post-info-form"}>
                            <h2 className={"service-post-info-available-dates-title"}> Fechas Disponibles </h2>
                            {!servicePost.availableDates || servicePost.availableDates.length === 0 ? (
                                <p className="no-dates-warning">
                                    No hay fechas disponibles para este servicio.
                                </p>
                            ) : (
                                <>
                                    <SelectableList
                                        items={createDatesList(servicePost.availableDates)}
                                        height="60vh"
                                        width="100%"
                                        multiple={false}
                                        onChange={handleDateChange}
                                        className="custom-scroll"
                                    />

                                    <SubmitButton
                                        onClick={handleReserveClick}
                                        className="service-post-info-available-dates-button"
                                        disabled={!hasSession}
                                        aria-disabled={!hasSession}
                                    >
                                        {hasSession ? "Reservar Servicio" : "Inicia Sesión"}
                                    </SubmitButton>
                                </>
                            )}
                            {warnNoDate && <p className="select-warning">Seleccioná una fecha antes de reservar</p>}
                        </form>
                    </div>
                </div>

                <div className={"service-post-info-reviews"}></div>
            </div>

            {showConfirm && (
                <div className="modal-overlay" role="dialog" aria-modal="true">
                    <div className="confirm-modal">
                        {submitSuccess ? (
                            <>
                                <h3>Reserva completada</h3>
                                <p>Tu reserva para <strong>{reserva.dateTime ? formatDate(new Date(reserva.dateTime), "dd/MM/yyyy 'a las' HH:mm", { locale: es }) : 'ninguna fecha'}</strong> se creó correctamente.</p>
                                <div className="confirm-buttons">
                                    <button className="btn btn-primary" onClick={handleCloseAfterSuccess}>Cerrar</button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h3>Confirmar reserva</h3>
                                <p>¿Deseas confirmar la reserva para <strong>{reserva.dateTime ? formatDate(new Date(reserva.dateTime), "dd/MM/yyyy 'a las' HH:mm", { locale: es }) : 'ninguna fecha seleccionada'}</strong>?</p>

                                {submitError && <p style={{ color: 'var(--text-secondary, #d9534f)' }}>{submitError}</p>}

                                <div className="confirm-buttons">
                                    <button
                                        className="btn btn-secondary"
                                        onClick={handleCancelReserve}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Cargando...' : 'Cancelar'}
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleConfirmReserve}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Cargando...' : 'Confirmar'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}