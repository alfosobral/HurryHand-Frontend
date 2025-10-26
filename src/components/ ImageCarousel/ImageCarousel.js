import React from "react";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css";

const ImageCarousel = ({ images = [], width = "500px", height = "400px", className = "", ...rest }) => {
    return (
        <section
            id="image-carousel"
            className={className}
            aria-label="Galería de imágenes"
            style={{
                width,
                height,
                overflow: "hidden",
                borderRadius: "18px",
            }}
            {...rest}
        >
            <Splide
                options={{
                    type: "loop",
                    perPage: 1,
                    autoplay: true,
                    interval: 3000,
                    pauseOnHover: true,
                    arrows: true,
                    pagination: true,
                }}
                aria-label="Carrusel de imágenes"
                style={{
                    width: "100%",
                    height: "100%",
                }}
            >
                {images.map((src, index) => (
                    <SplideSlide key={index}>
                        <img
                            src={src}
                            alt={`Imagen ${index + 1}`}
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                borderRadius: "12px",
                            }}
                        />
                    </SplideSlide>
                ))}
            </Splide>
        </section>
    );
};

export default ImageCarousel;