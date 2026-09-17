import type { OrderStatus } from "@/types/payment";
import styles from "./StatusBadge.module.css";

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pendiente",
  approved: "Aprobado",
  declined: "Rechazado",
  in_process: "En proceso",
};

export default function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`${styles.badge} ${styles[status]}`}>{STATUS_LABELS[status]}</span>;
}
