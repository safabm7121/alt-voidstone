import React from "react";
import { Link } from "react-router-dom";

export default function Carousel3D({
  products = [],
  imageWidth = 200,
  imageHeight = 300,
  rotateSpeed = 25,
  translateZ = 350,
  borderRadius = 12,
  width = 1200,
  height = 500,
}) {
  const validProducts = products.filter((p) => p && p._id);
  const totalItems = Math.max(validProducts.length, 6);
  const spreadAngle = 360 / totalItems;

  // If less than 6 products, duplicate them to fill the carousel
  const displayProducts = validProducts.length < 6
    ? [...Array(6)].map((_, i) => validProducts[i % validProducts.length])
    : validProducts;

  return (
    <div
      style={{
        width: '100%',
        maxWidth: width,
        height,
        position: "relative",
        perspective: "1200px",
        margin: "0 auto",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes rotateCarousel {
          from { transform: rotateY(0deg); }
          to { transform: rotateY(360deg); }
        }
        .carousel-3d {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          transform-style: preserve-3d;
          animation: rotateCarousel ${rotateSpeed}s infinite linear;
        }
        .carousel-3d:hover {
          animation-play-state: paused;
        }
        .carousel-3d .carousel-card {
          position: absolute;
          margin: 0;
          top: 50%;
          left: 50%;
          transform-origin: center center;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.4s ease;
        }
        .carousel-3d .carousel-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }
        .carousel-3d .carousel-card:hover {
          z-index: 10;
        }
        .carousel-3d .carousel-card:hover img {
          transform: scale(1.15);
        }
        .carousel-3d .carousel-card .card-info {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0,0,0,0.8));
          padding: 15px 12px 10px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .carousel-3d .carousel-card:hover .card-info {
          opacity: 1;
        }
      `}</style>

      <div className="carousel-3d">
        {displayProducts.map((product, index) => {
          const angle = index * spreadAngle;
          return (
            <Link
              to={`/products/${product._id}`}
              key={`${product._id}-${index}`}
              className="carousel-card"
              style={{
                width: imageWidth,
                height: imageHeight,
                borderRadius,
                transform: `translate(-50%, -50%) rotateY(${angle}deg) translateZ(${translateZ}px)`,
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
              }}
            >
              <img
                src={product.images?.[0] || 'https://via.placeholder.com/200x300?text=No+Image'}
                alt={product.name}
                style={{ borderRadius }}
                loading="lazy"
              />
              <div className="card-info">
                <p className="text-white font-semibold text-sm truncate">{product.name}</p>
                <p className="text-gray-300 text-xs">{product.price} DT</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}