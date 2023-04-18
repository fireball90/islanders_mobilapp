import Modal from "react-bootstrap/Modal";
import style from "./Lock.module.css";

export default function Lock({ children }) {
  return (
    <div className={style.container}>
      <div className={style.card}>
        <div className={style.title}>
          <h4>Csata nem elérhető!</h4>
        </div>
        <div className={style.body}>
          <span>{children}</span>
        </div>
      </div>
    </div>
  );
}