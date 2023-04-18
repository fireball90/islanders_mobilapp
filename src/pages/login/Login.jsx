import axios from "axios";
import React, { useState, useContext } from "react";
import { useEffect } from "react";
import { Cookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import ResendVerifyEmailForm from "../../components/resend-verify-email-form/ResendVerifyEmailForm";
import HudContext from "../../contexts/HudContext";
import IslandContext from "../../contexts/IslandContext";
import UserContext from "../../contexts/UserContext";
import BaseModal from "../../components/base-modal/BaseModal";

import "../login/login.css";
import NotificationContext from "../../contexts/NotificationContext";

export default function Login() {
  const cookie = new Cookies();
  const navigate = useNavigate();

  const { setIsHudDisplayed } = useContext(HudContext);
  const { populateNotifications, connectToNotificationHub } =
    useContext(NotificationContext);
  const { setUserLogined } = useContext(UserContext);
  const { setPlayer } = useContext(IslandContext);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [showVerifyEmailModal, setShowVerifyEmailModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoginPending, setIsloginPending] = useState(false);
  const [isPlayerLoading, setIsPlayerLoading] = useState(false);

  function decodeToken(token) {
    const tokenBody = token.split(".")[1];
    const decodedTokenBody = JSON.parse(window.atob(tokenBody));

    return { ...decodedTokenBody, exp: new Date(decodedTokenBody.exp * 1000) };
  }

  function usernameChangeHandler(event) {
    setUsername(event.target.value);
  }

  function passwordChangeHandler(event) {
    setPassword(event.target.value);
  }

  function submit(event) {
    event.preventDefault();
    setIsloginPending(true);

    axios
      .post(`${process.env.REACT_APP_API_BASE}/api/Auth/Login`, {
        username: username,
        password: password,
      })
      .then((response) => {
        const token = response.data;

        cookie.set("token", token);
        axios.defaults.headers.common["Authorization"] = `bearer ${token}`;

        const decodedToken = decodeToken(token);
        setUserLogined(
          decodedToken[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
          ],
          decodedToken.Email
        );

        requestPlayer();
        populateNotifications();
        connectToNotificationHub();
      })
      .catch((error) => {
        if (error.code === "ERR_NETWORK") {
          alert("Nem sikerült kapcsolódni a szerverhez.");
          return;
        }
        if (error.response.data.includes("EmailNotValidatedException")) {
          setShowVerifyEmailModal(true);
          return;
        }

        setErrorMessage("Hibás felhasználónév vagy jelszó!");
      })
      .finally(() => {
        setIsloginPending(false);
      });
  }

  function requestPlayer() {
    setIsPlayerLoading(true);

    axios
      .get(`${process.env.REACT_APP_API_BASE}/api/Player/GetPlayer`)
      .then((response) => {
        setPlayer(response.data);
        navigate("/island");
      })
      .catch((error) => {
        if (error.code === "ERR_NETWORK") {
          alert("Nem sikerült kapcsolódni a szerverhez.");
        } else {
          navigate("/select-island");
        }
      })
      .finally(() => {
        setIsPlayerLoading(false);
      });
  }

  useEffect(() => {
    setIsHudDisplayed(false);

    const token = cookie.get("token");

    if (token === undefined) return;

    const decodedToken = decodeToken(token);
    const now = new Date();

    if (decodedToken.exp < now) return;

    axios.defaults.headers.common["Authorization"] = `bearer ${token}`;
    setUserLogined(
      decodedToken[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ],
      decodedToken.Email
    );

    requestPlayer();
    populateNotifications();
    connectToNotificationHub();
  }, []);

  return isPlayerLoading ? null : (
    <>
      <div className="d-flex justify-content-center align-items-center">
        <div className="login-container justify-content-center d-flex align-items-center">
          <div className="d-flex align-items-center flex-column">
            <div className="">
              <img
                className="login-img"
                alt="ISLANDERS"
                src="../images/islanders_logo.png"
              ></img>
            </div>

            <div>
              <img
                className="login-img2"
                alt="BEJELENTKEZÉS"
                src="../images/bejelentkezes.png"
              ></img>
            </div>

            <form id="form" onSubmit={submit}>
              <div className="justify-content-center  form-group row pb-1">
                <label className="col-form-label text-center login-label">
                  FELHASZNÁLÓNÉV
                </label>
                <input
                  className="login-input"
                  type="text"
                  placeholder="Név"
                  value={username}
                  onChange={usernameChangeHandler}
                />
              </div>
              <div className="justify-content-center  form-group row pb-1">
                <label className="col-form-label text-center login-label">
                  JELSZÓ
                </label>
                <input
                  className="login-input"
                  type="password"
                  placeholder="Jelszó"
                  value={password}
                  onChange={passwordChangeHandler}
                />
              </div>
              {showVerifyEmailModal ? (
                <div>
                  <BaseModal
                    title="Email megerősítés"
                    onHide={() => setShowVerifyEmailModal(false)}
                  >
                    <div className="text-white">
                      <div className="p-3">
                        <p className="text-center">
                          Nem sikerült bejelentkezni, mert nem lett megerősítve
                          az email cím. A korábban elküldött megerősítő emailben
                          található linkre kattintva teheted ezt meg.
                        </p>
                      </div>
                      <div className="d-flex justify-content-center">
                        <div className="col-9">
                          <ResendVerifyEmailForm />
                        </div>
                      </div>
                    </div>
                  </BaseModal>
                </div>
              ) : null}
              <div className="text-danger fs-bold">
                <span>{errorMessage}</span>
              </div>
              <div className="d-flex justify-content-center">
                <button
                  className="btn-button1 font-btn"
                  type="submit"
                  disabled={isLoginPending}
                >
                  Belépés
                </button>
              </div>
            </form>

            <div className="d-flex justify-content-center">
              <p className="ml-auto login-link">
                <a href="/register">Még nem regisztrált? Kattintson ide!</a>
              </p>
            </div>

            <div className="d-flex justify-content-center">
              <p className="ml-auto login-link">
                <a href="/pwreset">Elfelejtette a jelszavát?</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}