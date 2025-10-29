import "./styles/ServicePostInfo.css";
import {getLoggedUser} from "../services/userService";
import {getServicePostById} from "../services/servicePosts";
import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";

import ImageCarousel from "../components/ ImageCarousel/ImageCarousel";
import Navbar from "../components/Navbar/Navbar";
import { getLoggedUser } from "../services/userService";
import { deleteAvailableDate, getServicePostById, addAvailableDate } from "../services/servicePosts";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { formatDate } from "date-fns";
import { es } from "date-fns/locale";
import SelectableList from "../components/SelectableList/SelectableList";
import SubmitButton from "../components/SubmitButton/SubmitButton";
import { createAppointment } from "../services/appointmentService";
import style from "./styles/ServicePostInfo.css";
import DateField from "../components/DateField/DateField";
import { deleteServicePost } from "../services/servicePosts";

export default function ServicePostInfo() {
    const { id } = useParams();

    const [user, setUser] = useState(null);
    const [hasSession, setHasSession] = useState(false);
    const [serviceProvider, setServiceProvider] = useState(false);
    const [servicePost, setServicePost] = useState(null);
    const [loading, setLoading] = useState(true);


    const [selectedDate, setSelectedDate] = useState({
        servicePostId: id,
        dateTime: null,
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
        if (user && servicePost) {
            const isProvider = user.id === servicePost.providerId;
            setServiceProvider(isProvider);
            setHasSession(!!user && user !== false);
        }
    }, [user, servicePost]);

    useEffect(() => {
        if (selectedDate.dateTime) {
            console.log("Nueva fecha seleccionada:", selectedDate.dateTime);
        } else {
            console.log("Fecha deseleccionada");
        }
    }, [selectedDate.dateTime]);

    function createDatesList(dates = []) {
        const formattedDates = {};
        dates.forEach((d) => {
            const date = new Date(d);
            const key = d;
            const value = formatDate(date, "dd/MM/yyyy 'a las' HH:mm", { locale: es });
            formattedDates[key] = value;
        });
        return formattedDates;
    }

    function handleDateChange(vals) {
        const selected = Array.isArray(vals) ? vals[0] : vals;
        setSelectedDate((prev) => ({
            ...prev,
            dateTime: selected,
        }));
    }

    // 🔹 Estados de reserva
    const [showConfirm, setShowConfirm] = useState(false);
    const [warnNoDate, setWarnNoDate] = useState(false);

    function handleReserveClick(e) {
        if (e && e.preventDefault) e.preventDefault();
        if (!selectedDate.dateTime) {
            setWarnNoDate(true);
            setTimeout(() => setWarnNoDate(false), 2200);
            return;
        }

        if (!hasSession) return;
        setShowConfirm(true);
    }

    const [warnNoDateForDelete, setWarnNoDateForDelete] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState(null);

    function handleDeleteClick(e) {
        if (e && e.preventDefault) e.preventDefault();
        if (!selectedDate.dateTime) {
            setWarnNoDateForDelete(true);
            setTimeout(() => setWarnNoDateForDelete(false), 2200);
            return;
        }
        setShowDeleteConfirm(true);
    }

    async function handleConfirmDelete() {
        setIsDeleting(true);
        setDeleteError(null);
        try {
            await deleteAvailableDate(selectedDate.servicePostId, selectedDate.dateTime);
            setShowDeleteConfirm(false);
            window.location.reload();
        } catch (err) {
            console.error("Error eliminando fecha:", err);
            setDeleteError(err?.message || "Error al eliminar la fecha");
        } finally {
            setIsDeleting(false);
        }
    }

    function handleCancelDelete() {
        setShowDeleteConfirm(false);
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
                servicePostId: selectedDate.servicePostId,
                dateTime: selectedDate.dateTime,
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

    // 🔹 Estados y handlers para Agregar Fecha
    const [showAddModal, setShowAddModal] = useState(false);
    const [newDate, setNewDate] = useState(""); // <input type="datetime-local">
    const [isAdding, setIsAdding] = useState(false);
    const [addError, setAddError] = useState(null);
    const [addSuccess, setAddSuccess] = useState(false);

    function handleAddClick(e) {
        if (e && e.preventDefault) e.preventDefault();
        setAddError(null);
        setAddSuccess(false);
        setNewDate("");
        setShowAddModal(true);
    }

    function handleCancelAdd() {
        setShowAddModal(false);
        setNewDate("");
        setAddError(null);
        setAddSuccess(false);
    }

    async function handleConfirmAdd() {
        if (!newDate) return;
        setIsAdding(true);
        setAddError(null);
        try {
            // Convertir a ISO para que el backend lo reciba con @DateTimeFormat(ISO.DATE_TIME)
            const iso = new Date(newDate).toISOString();
            await addAvailableDate(id, iso);
            setAddSuccess(true);

            setTimeout(() => window.location.reload(), 900);
        } catch (err) {
            console.error("Error agregando fecha:", err);
            setAddError(err?.message || "Error al agregar la fecha");
            setAddSuccess(false);
        } finally {
            setIsAdding(false);
        }
    }

    const [showDeletePostConfirm, setShowDeletePostConfirm] = useState(false);
    const [isDeletingPost, setIsDeletingPost] = useState(false);
    const [deletePostError, setDeletePostError] = useState(null);

    function handleDeletePostClick(e) {
        if (e && e.preventDefault) e.preventDefault();
        setShowDeletePostConfirm(true);
    }

    function handleCancelDeletePost() {
        setShowDeletePostConfirm(false);
    }

    async function handleConfirmDeletePost() {
        setIsDeletingPost(true);
        setDeletePostError(null);
        try {
            await deleteServicePost(id);
            setShowDeletePostConfirm(false);
            window.location.href = "/"; // redirige al home o lista de servicios
        } catch (err) {
            console.error("Error eliminando service post:", err);
            setDeletePostError(err?.message || "Error al eliminar el servicio");
        } finally {
            setIsDeletingPost(false);
        }
    }





    // Evita seleccionar fechas pasadas (cliente). Ajusta zona horaria local.
    const minLocalForInput = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);

    if (loading) return <p>Cargando...</p>;
    if (!servicePost) return <p>No se encontró el servicio solicitado.</p>;

    return (
        <div className="service-post-info-page">
            <div className="service-post-info-page-header">
                <Navbar searchbarOff={true} />
            </div>

            <div className="service-post-info-page-body">
                <div className="service-post-info-block">
                    <div className="service-post-info-block-col1">
                        <ImageCarousel
                            images={[
                                "https://ferrari-cdn.thron.com/delivery/public/thumbnail/ferrari/4096b5fd-63e2-4a12-af3b-45ae75e4c60b/bocxuw/std/488x325/4096b5fd-63e2-4a12-af3b-45ae75e4c60b?scalemode=auto",
                                "https://cdn.ferrari.com/cms/network/media/img/resize/66e0571870dcce0011d9c5d0-2002_enzoferrari_cassetto-archivio_02-new?",
                            ]}
                            className="image-carrousel"
                            height="auto"
                            width="550px"
                        />
                        <h2 className="service-post-info-overview1">Descripción</h2>
                        <p className="service-post-info-overview2">{servicePost.description}</p>
                    </div>

                    <div className="service-post-info-block-col2">
                        <h1 className="service-post-info-title">{servicePost.title}</h1>
                        <div className="service-post-info-rating-div">
                            <p className="service-post-info-rating1">Rating:</p>
                            <p className="service-post-info-rating2">
                                {servicePost.rating !== null ? servicePost.rating : "Sin reviews"}
                            </p>
                        </div>
                        <h2 className="service-post-info-price">{servicePost.price}$</h2>
                        <div className="service-post-info-duration-div">
                            <p className="service-post-info-duration1">Duración:</p>
                            <p className="service-post-info-duration2">{servicePost.duration}</p>
                            <p className="service-post-info-duration3">minutos</p>
                        </div>
                        <div className="service-post-info-date-div">
                            <p className="service-post-info-date1">Fecha de publicación:</p>
                            <p className="service-post-info-date2">
                                {formatDate(servicePost.createdAt, "dd 'de' MMMM 'del' yyyy", { locale: es })}
                            </p>
                        </div>
                    </div>

                    <div className="service-post-info-block-col3">
                        <form className="service-post-info-form">
                            <h2 className="service-post-info-available-dates-title">Fechas Disponibles</h2>
                            {!servicePost.availableDates || servicePost.availableDates.length === 0 ? (
                                <p className="no-dates-warning">No hay fechas disponibles para este servicio.</p>
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

                                    {serviceProvider ? (
                                        <>
                                            <SubmitButton
                                                className="service-post-info-available-add-dates-button"
                                                onClick={handleAddClick}
                                                disabled={!hasSession}
                                                aria-disabled={!hasSession}
                                            >
                                                Agregar Fecha
                                            </SubmitButton>

                                            <SubmitButton
                                                className="service-post-info-available-delete-dates-button"
                                                disabled={!hasSession}
                                                aria-disabled={!hasSession}
                                                onClick={handleDeleteClick}
                                            >
                                                Borrar Fecha
                                            </SubmitButton>

                                            <SubmitButton
                                                className="service-post-info-available-delete-post-button"
                                                disabled={!hasSession}
                                                aria-disabled={!hasSession}
                                                onClick={handleDeletePostClick}
                                            >
                                                Borrar Service Post
                                            </SubmitButton>
                                        </>
                                    ) : (
                                        <SubmitButton
                                            onClick={handleReserveClick}
                                            className="service-post-info-available-dates-button"
                                            disabled={!hasSession}
                                            aria-disabled={!hasSession}
                                        >
                                            {hasSession ? "Reservar Servicio" : "Inicia Sesión"}
                                        </SubmitButton>
                                    )}
                                </>
                            )}
                            {warnNoDateForDelete && <p className="select-warning">Seleccioná una fecha para borrarla</p>}
                            {warnNoDate && <p className="select-warning">Seleccioná una fecha antes de reservar</p>}
                        </form>
                    </div>
                </div>

                <div className="service-post-info-reviews"></div>
            </div>

            {/* Modal confirmar reserva */}
            {showConfirm && (
                <div className="modal-overlay" role="dialog" aria-modal="true">
                    <div className="confirm-modal">
                        {submitSuccess ? (
                            <>
                                <h3>Reserva completada</h3>
                                <p>
                                    Tu reserva para{" "}
                                    <strong>
                                        {selectedDate.dateTime
                                            ? formatDate(new Date(selectedDate.dateTime), "dd/MM/yyyy 'a las' HH:mm", { locale: es })
                                            : "ninguna fecha"}
                                    </strong>{" "}
                                    se creó correctamente.
                                </p>
                                <div className="confirm-buttons">
                                    <button className="btn btn-primary" onClick={handleCloseAfterSuccess}>
                                        Cerrar
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h3>Confirmar reserva</h3>
                                <p>
                                    ¿Deseas confirmar la reserva para{" "}
                                    <strong>
                                        {selectedDate.dateTime
                                            ? formatDate(new Date(selectedDate.dateTime), "dd/MM/yyyy 'a las' HH:mm", { locale: es })
                                            : "ninguna fecha seleccionada"}
                                    </strong>
                                    ?
                                </p>

                                {submitError && <p style={{ color: "var(--text-secondary, #d9534f)" }}>{submitError}</p>}

                                <div className="confirm-buttons">
                                    <button className="btn btn-secondary" onClick={handleCancelReserve} disabled={isSubmitting}>
                                        {isSubmitting ? "Cargando..." : "Cancelar"}
                                    </button>
                                    <button className="btn btn-primary" onClick={handleConfirmReserve} disabled={isSubmitting}>
                                        {isSubmitting ? "Cargando..." : "Confirmar"}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Modal confirmar borrado */}
            {showDeleteConfirm && (
                <div className="modal-overlay" role="dialog" aria-modal="true">
                    <div className="confirm-modal">
                        <h3>Confirmar borrado</h3>
                        <p>
                            ¿Deseas eliminar la fecha
                            <strong>
                                {" "}
                                {selectedDate.dateTime
                                    ? formatDate(new Date(selectedDate.dateTime), "dd/MM/yyyy 'a las' HH:mm", { locale: es })
                                    : "no seleccionada"}{" "}
                            </strong>
                            ?
                        </p>

                        {deleteError && <p style={{ color: "var(--text-secondary, #d9534f)" }}>{deleteError}</p>}

                        <div className="confirm-buttons">
                            <button className="btn btn-secondary" onClick={handleCancelDelete} disabled={isDeleting}>
                                {isDeleting ? "Cargando..." : "Cancelar"}
                            </button>
                            <button className="btn btn-primary" onClick={handleConfirmDelete} disabled={isDeleting}>
                                {isDeleting ? "Cargando..." : "Confirmar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal agregar fecha */}
            {showAddModal && (
                <div className="modal-overlay" role="dialog" aria-modal="true">
                    <div className="confirm-modal">
                        {addSuccess ? (
                            <>
                                <h3>Fecha agregada</h3>
                                <p>La nueva fecha se añadió correctamente.</p>
                                <div className="confirm-buttons">
                                    <button className="btn btn-primary" onClick={() => window.location.reload()}>
                                        Cerrar
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h3>Agregar nueva fecha</h3>
                                <p>Elegí la fecha y hora para publicar disponibilidad.</p>

                                <div style={{ margin: "12px 0" }}>
                                    <label htmlFor="new-date-input" className="sr-only">
                                        Nueva fecha
                                    </label>
                                    <DateField
                                        id="new-date-input"
                                        type="datetime-local"
                                        value={newDate}
                                        onChange={(e) => setNewDate(e.target.value)}
                                        min={minLocalForInput}
                                        className="input"
                                        style={{ width: "80%", margin: "0 auto"}}
                                        required
                                    />
                                </div>

                                {addError && <p style={{ color: "var(--text-secondary, #d9534f)" }}>{addError}</p>}

                                <div className="confirm-buttons">
                                    <button className="btn btn-secondary" onClick={handleCancelAdd} disabled={isAdding}>
                                        {isAdding ? "Cargando..." : "Cancelar"}
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleConfirmAdd}
                                        disabled={isAdding || !newDate}
                                        aria-disabled={isAdding || !newDate}
                                    >
                                        {isAdding ? "Cargando..." : "Confirmar"}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Modal confirmar borrado de Service Post */}
            {showDeletePostConfirm && (
                <div className="modal-overlay" role="dialog" aria-modal="true">
                    <div className="confirm-modal">
                        <h3>Confirmar borrado del servicio</h3>
                        <p>¿Estás seguro de que querés eliminar este servicio permanentemente?</p>

                        {deletePostError && (
                            <p style={{ color: "var(--text-secondary, #d9534f)" }}>
                                {deletePostError}
                            </p>
                        )}

                        <div className="confirm-buttons">
                            <button
                                className="btn btn-secondary"
                                onClick={handleCancelDeletePost}
                                disabled={isDeletingPost}
                            >
                                {isDeletingPost ? "Cargando..." : "Cancelar"}
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleConfirmDeletePost}
                                disabled={isDeletingPost}
                            >
                                {isDeletingPost ? "Eliminando..." : "Confirmar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

