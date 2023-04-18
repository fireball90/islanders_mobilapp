import React, { useRef, useState } from "react";
import "../register/register.css";
import { useForm } from "react-hook-form";
import Modal from "react-bootstrap/Modal";
import axios from "axios";
import { Link } from "react-router-dom";

export default function Register() {
  const [modalShow, setModalShow] = React.useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const password = useRef({});
  password.current = watch("password", "");

  const onSubmit = (data) => {
    axios
      .post(`${process.env.REACT_APP_API_BASE}/api/Auth/Registration`, data)
      .then(() => {
        setModalShow(true);
      })
      .catch((error) => {
        if (error.code === "ERR_NETWORK") {
          setErrorMessage("Nem sikerült kapcsolódni a szerverhez.");
        } else {
          setErrorMessage(
            "A felhasználónév vagy az e-mail cím már regisztrálva lett a rendszerben. Kérjük, használj másikat."
          );
        }
      });
  };

  return (
    <div className="d-flex justify-content-center align-items-center">
      <div className="register-container justify-content-center d-flex align-items-center ">
        <div className="d-flex align-items-center flex-column">
          <div className="">
            <img
              className="register-img"
              alt="ISLANDERS"
              src="../images/islanders_logo.png"
            ></img>
          </div>

          <div className="">
            <img
              className="register-img2"
              alt="REGISZTRÁCIÓ"
              src="../images/regisztracio.png"
            ></img>
          </div>

          <RegisterModal
            show={modalShow}
            onHide={() => setModalShow(false)}
          />

          <form id="form" className="" onSubmit={handleSubmit(onSubmit)}>
            <div className="justify-content-center form-group row pb-1">
              <label className="col-form-label text-center register-label">
                FELHASZNÁLÓ NÉV
              </label>
              <input
                className="register-input"
                type="text"
                placeholder="Név"
                id="username"
                {...register("username", {
                  required: true,
                  max: 30,
                  min: 5,
                  maxLength: 30,
                  pattern: /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]+$/i,
                })}
              />
              {errors.username?.type === "required" && (
                <span className="reg-error-msg text-center">
                  Kérjük adjon meg egy felhasználónevet.
                </span>
              )}
              {errors.username?.type === "min" && (
                <span className="reg-error-msg text-center">
                  5 és 30 karakter közti hosszúságú nevet adjon meg
                </span>
              )}
              {errors.username?.type === "maxLength" && (
                <span className="reg-error-msg text-center">
                  5 és 30 karakter közti hosszúságú nevet adjon meg.
                </span>
              )}
              {errors.username?.type === "pattern" && (
                <span className="reg-error-msg text-center">
                  Kérjük csak az angol ABC betűit és számokat használjon.
                </span>
              )}
            </div>

            <div className="justify-content-center form-group row pb-1">
              <label className="col-form-label text-center register-label">
                E-MAIL CÍM
              </label>
              <input
                className="register-input"
                type="text"
                placeholder="Email cím"
                id="email"
                {...register("email", {
                  required: true,
                  pattern: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/i,
                })}
              />
              {errors.email?.type === "required" && (
                <span className="reg-error-msg text-center">
                  Kérem adjon meg egy email címet.
                </span>
              )}
              {errors.email?.type === "pattern" && (
                <span className="reg-error-msg text-center">
                  Kérem adjon meg egy helyes email címet. Pl: name@email.com
                </span>
              )}
            </div>

            <div className="justify-content-center form-group row pb-1">
              <label className="col-form-label text-center register-label">
                JELSZÓ
              </label>
              <input
                className="register-input"
                name="password"
                type="password"
                placeholder="Jelszó"
                id="password"
                {...register("password", {
                  required: true,
                  max: 40,
                  min: 8,
                  maxLength: 40,
                  pattern:
                    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,40}$/i,
                })}
              />
              {errors.password?.type === "pattern" && (
                <span className="reg-error-msg text-center">
                  A jelszónak 8 - 40 karakter hosszúnak kell lennie.
                </span>
              )}
              {errors.password?.type === "pattern" && (
                <span className="reg-error-msg text-center">
                  A jelszó tartalmazzon egy kisbetűt, egy nagybetűt és egy
                  számot.
                </span>
              )}
              {errors.password?.type === "maxLength" && (
                <span className="reg-error-msg text-center">
                  A jelszónak 8 - 40 karakter hosszúnak kell lennie.
                </span>
              )}
            </div>

            <div className="justify-content-center form-group row pb-1">
              <label className="col-form-label text-center register-label">
                JELSZÓ ELLENŐRZÉSE
              </label>
              <input
                className="register-input"
                type="password"
                placeholder="Jelszó ellenőrzése"
                id="confirmPassword"
                {...register("confirmPassword", {
                  validate: (value) => value === password.current,
                })}
              />
              {errors.confirmPassword && (
                <span className="reg-error-msg text-center">
                  Nem egyezik a fent megadott jelszóval!
                </span>
              )}
            </div>

            <div className="text-center">
              <span className="login-error-msg ">{errorMessage}</span>
            </div>

            <div className="d-flex justify-content-center">
              <button type="submit" className="btn btn-button3">
                Regisztráció
              </button>
            </div>
          </form>

          <div className="d-flex justify-content-center">
            <p className="ml-auto register-link">
              <a href="/">Már regisztrált? Lépjen be!</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function RegisterModal(props) {
  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      className="modal-animation"
    >
      <div className="successful-register-modal">
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Sikeres regisztráció
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Az email címére küldtünk egy levelet a regisztráció befejezéséhez
            szükséges linkkel. Kérem kattintson rá, hogy véglegesítse a
            regisztrációt.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Link to="/">
            <button onClick={props.onHide} className="modal-register-btn">
              Bezárás
            </button>
          </Link>
        </Modal.Footer>
      </div>
    </Modal>
  );
}
