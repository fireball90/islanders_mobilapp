import React, { useContext, useEffect, useState } from "react";
import HudContext from "../../contexts/HudContext";
import axios from "axios";
import "../pwreset/pwreset.css";
import Modal from "react-bootstrap/Modal";

export default function Pwreset() {
  const { setIsHudDisplayed } = useContext(HudContext);
  const [ errorMessage, setErrorMessage ] = useState(null);
  const [email, setEmail] = useState("");
  const [modalShow, setModalShow] = React.useState(false);
  
  const handleChange = (event) => {
    setEmail(event.target.value);
  };

  const submitHandler = (event) => {
    event.preventDefault();

    if (email === "") {
      setErrorMessage('Adjon meg egy email címet!');
      return;
    }

    axios.put(`${process.env.REACT_APP_API_BASE}/api/Auth/SetTemporaryPassword?email=${email}`)
    .then(() => {
      setModalShow(true);
    })
    .catch(() => {
      setErrorMessage('Nem sikerült kapcsolódni a szerverhez.')
    })
  };

  useEffect(() => {
    setIsHudDisplayed(false);
  }, []);

  return (
    <div className="d-flex justify-content-center align-items-center">
      <div className="pwreset-container justify-content-center d-flex align-items-center">
        <div className="d-flex align-items-center flex-column">
          <div className="">
            <img
              className="pwreset-img"
              alt="ISLANDERS"
              src="../images/islanders_logo.png"
            ></img>
          </div>

          <MyVerticallyCenteredModal
            show={modalShow}
            onHide={() => setModalShow(false)}
          />

          <div className="">
            <img
              className="pwreset-img2"
              alt="PWRESET"
              src="../images/elfelejtett_jelszo.png"
            ></img>
          </div>

          <form id="form" className="" onSubmit={submitHandler}>
            <div className="justify-content-center form-group row pb-3">
              <label className="col-form-label text-center pwreset-label">
                REGISZTRÁLÁSNÁL HASZNÁLT EMAIL CÍM
              </label>
              <div className="col-sm-8">
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="pwreset-input"
                  onChange={handleChange}
                  value={email}
                />
              </div>
            </div>
            <div className="fs-6 text-danger text-center bg-warning">{ errorMessage }</div>
            <div className="d-flex justify-content-center">
              <button type="submit" className="btn-button-reset font-btn">
                Küldés
              </button>
            </div>
          </form>

          <div className="">
            <p className="ml-auto pwreset-link">
              <a href="/">Visszatérés a bejelentkezéshez</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
function MyVerticallyCenteredModal(props) {
  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <div className="successful-register-modal">
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Sikeres email küldés
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Az email címére küldtünk egy új jelszót, amellyel be tud lépni az oldalra. Majd kérjük változtassa azt meg a saját profil menüpontban!
          </p>
        </Modal.Body>
        <Modal.Footer>
          <button onClick={props.onHide} className="modal-register-btn">
            Bezárás
          </button>
        </Modal.Footer>
      </div>
    </Modal>
  );
}