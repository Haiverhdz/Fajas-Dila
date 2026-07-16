import { Star } from "lucide-react";
import styles from "./Testimonials.module.css";

// TODO: reemplazar con reseñas reales de clientas cuando estén disponibles.
const testimonials = [
  {
    name: "Mariana G.",
    location: "Medellín",
    rating: 5,
    quote:
      "Pensé que me iba a apretar como las fajas normales, pero se siente suave todo el día. La uso hasta para dormir en las primeras semanas post-parto.",
  },
  {
    name: "Laura R.",
    location: "Bogotá",
    rating: 5,
    quote:
      "La banda de silicona sí funciona, no se enrolla ni se sube. Es la primera faja que no me quito a las dos horas.",
  },
  {
    name: "Camila V.",
    location: "Cali",
    rating: 5,
    quote:
      "Se nota el efecto reductor desde que me la pongo. La tela es muy cómoda y no se marca bajo la ropa ajustada.",
  },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("");
}

export default function Testimonials() {
  return (
    <section id="resenas" className={styles.section}>
      <div className="container">
        <div className={styles.heading}>
          <h2 className={styles.title}>Lo que dicen nuestras clientas</h2>
          <p className={styles.subtitle}>
            Historias reales de mujeres que ya usan su short DILA a diario.
          </p>
        </div>

        <div className={styles.grid}>
          {testimonials.map(({ name, location, rating, quote }) => (
            <div key={name} className={styles.card}>
              <div className={styles.stars} aria-label={`${rating} de 5 estrellas`}>
                {Array.from({ length: rating }).map((_, i) => (
                  <Star key={i} size={16} className={styles.starFilled} />
                ))}
              </div>
              <p className={styles.quote}>&ldquo;{quote}&rdquo;</p>
              <div className={styles.person}>
                <div className={styles.avatar}>{initials(name)}</div>
                <div>
                  <p className={styles.name}>{name}</p>
                  <p className={styles.location}>{location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
