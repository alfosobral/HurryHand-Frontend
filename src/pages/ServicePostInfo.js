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






export default function ServicePostInfo() {

    const { id } = useParams();

    const [user, setUser] = useState(null);
    const [servicePost, setServicePost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        (async () => {
            try {
                const [userData, serviceData] = await Promise.all([
                    getLoggedUser(),
                    getServicePostById(id),
                ]);

                setUser(userData || null);
                setServicePost(serviceData || null);

            } catch (err) {
                console.error("Error cargando datos:", err);
            } finally {
                setLoading(false);
            }
        })();



    }, [id]);

    const data = {
        a: "Opción A",
        b: "Opción B",
        c: "Opción C",
        d: "Opción D",
        e: "Opción E",
        f: "Opción F",
        g: "Opción G",
        h: "Opción H",
        i: "Opción I",
        j: "Opción J",
        k: "Opción K",
        l: "Opción L",
        m: "Opción M",
        n: "Opción N",
        o: "Opción O",
        p: "Opción P",
        q: "Opción Q",
        r: "Opción R",
        s: "Opción S",
        t: "Opción T",
    };




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
                        <ImageCarousel images={["https://ferrari-cdn.thron.com/delivery/public/thumbnail/ferrari/4096b5fd-63e2-4a12-af3b-45ae75e4c60b/bocxuw/std/488x325/4096b5fd-63e2-4a12-af3b-45ae75e4c60b?scalemode=auto", "https://cdn.ferrari.com/cms/network/media/img/resize/66e0571870dcce0011d9c5d0-2002_enzoferrari_cassetto-archivio_02-new?"]} />
                        <h2 className={"service-post-info-overview1"}> Descripción </h2>
                        <p className={"service-post-info-overview2"}> {servicePost.description} </p>


                    </div>

                    <div className={"service-post-info-block-col2"}>

                        <h1 className={"service-post-info-title"}> {servicePost.title} </h1>
                        <Rating size={"20px"}/>
                        <p className={"service-post-info-rating"}> Rating: {servicePost.rating}</p>
                        <h2 className={"service-post-info-price"}> {servicePost.price}$ </h2>
                        <p className={"service-post-info-duration1"}> Duración:</p>
                        <p className={"service-post-info-duration2"}> {servicePost.duration} </p>
                        <p className={"service-post-info-duration3"}> minutos </p>
                        <p className={"service-post-info-date1"}> Fecha de publicación: </p>
                        <p className={"service-post-info-date2"}> {formatDate(servicePost.createdAt, "dd 'de' MMMM 'del' yyyy", { locale: es })} </p>

                    </div>

                    <div className={"service-post-info-block-col3"}>
                        <SelectableList
                            items={data}
                            height={"80%"}
                            width={"100%"}
                            multiple={false}
                            onChange={(vals) => console.log("Seleccionados:", vals)}
                            className="custom-scroll"
                            />

                        <SubmitButton> Reservar Servicio </SubmitButton>


                    </div>

                </div>

                <div className={"service-post-info-reviews"}>


                </div>

            </div>

        </div>
    );

}