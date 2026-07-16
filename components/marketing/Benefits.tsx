import { Sparkles, Layers, Clock, HeartPulse } from "lucide-react";
import styles from "./Benefits.module.css";

const benefits = [
  {
    icon: Sparkles,
    title: "Reduce tallas al instante",
    text: "Compresión progresiva que moldea cintura y cadera desde el primer uso.",
  },
  {
    icon: Layers,
    title: "Tela de alta compresión",
    text: "Tejido sin costuras que se adapta a tu cuerpo sin marcarse bajo la ropa.",
  },
  {
    icon: Clock,
    title: "Cómoda todo el día",
    text: "Banda de silicona antideslizante que no aprieta ni se enrolla con el movimiento.",
  },
  {
    icon: HeartPulse,
    title: "Post-parto y post-quirúrgico",
    text: "Soporte suave ideal para tu recuperación, siempre bajo indicación médica.",
  },
];

export default function Benefits() {
  return (
    <section id="beneficios" className={styles.section}>
      <div className="container">
        <div className={styles.heading}>
          <h2 className={styles.title}>Por qué elegir tu short DILA</h2>
          <p className={styles.subtitle}>
            Diseñado para acompañarte todos los días, no solo en ocasiones
            especiales.
          </p>
        </div>

        <div className={styles.grid}>
          {benefits.map(({ icon: Icon, title, text }) => (
            <div key={title} className={styles.card}>
              <div className={styles.iconWrap}>
                <Icon size={22} />
              </div>
              <h3 className={styles.cardTitle}>{title}</h3>
              <p className={styles.cardText}>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
