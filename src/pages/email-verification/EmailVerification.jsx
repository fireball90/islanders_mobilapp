import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import HudContext from "../../contexts/HudContext";
import BaseModal from "../../components/base-modal/BaseModal";

import style from "./EmailVerification.module.css";

export default function EmailVerification() {
  const { setIsHudDisplayed } = useContext(HudContext);

  const { token } = useParams();
  const navigate = useNavigate();

  const [message, setMessage] = useState();
  const [isVerifyingPending, setIsVerifyingPending] = useState(true);

  useEffect(() => {
    setIsHudDisplayed(false);

    axios
      .post(`${process.env.REACT_APP_API_BASE}/api/Auth/VerifyEmail?token=${token}`)
      .then(() => {
        setMessage("Email sikeresen megerősítve!");
      })
      .catch((error) => {
        if (error.code === "ERR_NETWORK") {
          setMessage("Nem sikerült kapcsolódni a szerverhez!");
        } else {
          setMessage(`Nem sikerült megerősíteni az email címet. Lejárt, vagy hibás a megerősítő token!
          A bejelentkezés oldalon lehet új megerősítő emailt igényelni.`);
        }
      })
      .finally(() => setIsVerifyingPending(false));
  }, []);

  return !isVerifyingPending ? (
    <div className={style.container}>
      <BaseModal title="Email megerősítés">
      <div className="text-center text-white d-flex flex-column justify-content-between p-4">
        {message}
        <div className="font-btn">
          <button className={style.verifyBtn} onClick={() => navigate("/")}>Vissza a bejelentkezéshez</button>
        </div>
      </div>
      </BaseModal>
    </div>
  ) : null;
}