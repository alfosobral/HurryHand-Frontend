import React from "react";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css";

const ImageCarousel = ({
                           images = [],
                           width = "500px",
                           height = "400px",
                           className = "",
                           ...rest
                       }) => {
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
                position: "relative",
                backgroundColor: "black",
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
                    height,
                    width,
                }}
                aria-label="Carrusel de imágenes"
                style={{ width: "100%", height: "100%" }}
            >
                {images.map((src, index) => (
                    <SplideSlide key={index} style={{ position: "relative" }}>
                        {/* Capa de fondo: misma imagen en cover + blur para evitar barras */}
                        <div
                            aria-hidden="true"
                            style={{
                                position: "absolute",
                                inset: 0,
                                backgroundImage: `url(${src})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                filter: "blur(16px)",
                                transform: "scale(1.1)",
                                opacity: 0.8,
                            }}
                        />
                        {/* Capa principal: imagen sin recorte */}
                        <div
                            style={{
                                position: "relative",
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: 0,
                            }}
                        >
                            <img
                                src={src}
                                alt={`Imagen ${index + 1}`}
                                style={{
                                    maxWidth: "100%",
                                    maxHeight: "100%",
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "contain", // nunca recorta
                                    borderRadius: "12px",
                                    zIndex: 1,
                                }}
                            />
                        </div>
                    </SplideSlide>
                ))}
            </Splide>

            {/* Ajustes de flechas/paginación */}
            <style>{`
        .splide__arrow {
          background: rgba(0,0,0,0.55);
          color: white;
          border-radius: 9999px;
          width: 38px; height: 38px;
          display: flex; align-items: center; justify-content: center;
          transition: opacity .2s ease;
        }
        .splide__arrow:hover { background: rgba(255,255,255,0.35); }
        .splide__arrow--prev { left: 10px; }
        .splide__arrow--next { right: 10px; }
        .splide__pagination { bottom: 10px; }
      `}</style>
        </section>
    );
};

export default ImageCarousel;
