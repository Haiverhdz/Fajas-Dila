"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import styles from "./Faq.module.css";

const faqs = [
  {
    question: "¿Cómo sé qué talla elegir?",
    answer:
      "Consulta nuestra guía de tallas según tu medida de cintura y cadera. Si estás entre dos tallas, te recomendamos elegir la más grande para mayor comodidad.",
  },
  {
    question: "¿Cuánto tarda el envío?",
    answer:
      "Entre 2 y 5 días hábiles dentro de Colombia, dependiendo de tu ciudad. Te enviamos el número de guía apenas despachamos tu pedido.",
  },
  {
    question: "¿Puedo cambiar la talla si no me queda bien?",
    answer:
      "Sí, tienes 8 días calendario desde que recibes tu pedido para solicitar un cambio de talla, siempre que la prenda esté sin uso y con etiquetas.",
  },
  {
    question: "¿De qué material está hecha la faja?",
    answer:
      "Tejido de compresión sin costuras con banda de silicona antideslizante interior, transpirable y suave con la piel.",
  },
  {
    question: "¿Cómo debo lavarla para que dure más?",
    answer:
      "Lávala a mano o en ciclo delicado con agua fría, sin suavizante ni secadora. Sécala a la sombra para conservar la compresión.",
  },
  {
    question: "¿Es segura para uso post-parto o post-quirúrgico?",
    answer:
      "Sí, pero siempre bajo indicación de tu médico, especialmente en las primeras semanas de recuperación.",
  },
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className={styles.section}>
      <div className="container">
        <div className={styles.heading}>
          <h2 className={styles.title}>Preguntas frecuentes</h2>
          <p className={styles.subtitle}>
            Todo lo que necesitas saber antes de comprar tu short DILA.
          </p>
        </div>

        <div className={styles.list}>
          {faqs.map(({ question, answer }, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={question} className={styles.item}>
                <button
                  type="button"
                  className={styles.trigger}
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  {question}
                  <ChevronDown
                    size={18}
                    className={`${styles.chevron} ${
                      isOpen ? styles.chevronOpen : ""
                    }`}
                  />
                </button>
                <div
                  className={`${styles.answer} ${
                    isOpen ? styles.answerOpen : ""
                  }`}
                >
                  <p className={styles.answerInner}>{answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
