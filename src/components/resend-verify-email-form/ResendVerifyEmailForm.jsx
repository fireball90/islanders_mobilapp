import axios from "axios";
import { useState } from "react";
import { Link } from "react-router-dom";
import Form from "react-bootstrap/Form";
import "./ResendVerifyEmailForm.css";

export default function ResendVerifyEmailForm() {
  const [email, setEmail] = useState("");
  const [isVerifyingPending, setIsVerifyingPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState();
  const [isEmailSended, setIsEmailSended] = useState(false);
  const [isEmailTouched, setIsEmailTouched] = useState(false);

  function handleEmailChange(event) {
    setEmail(event.target.value);
  }

  function send() {
    setIsVerifyingPending(true);

    axios
      .post(`${process.env.REACT_APP_API_BASE}/api/Auth/ResendVerifyEmail?email=${email}`)
      .then(() => setIsEmailSended(true))
      .catch((error) => {
        if (error.code === "ERR_NETWORK") {
          setErrorMessage("Nem sikerült kapcsolódni a szerverhez!");
        } else {
          setErrorMessage("Nem található felhasználó ezzel az email címmel!");
        }
      })
      .finally(() => setIsVerifyingPending(false));
  }

  function inputErrorMessage() {
    return isEmailTouched && email.length === 0 ? (
      <Form.Text className="text-danger fs-5">
        Az email cím megadása kötelező!
      </Form.Text>
    ) : null;
  }

  function formErrorMessage() {
    return errorMessage ? (
      <div className="text-danger text-center">{errorMessage}</div>
    ) : null;
  }

  return !isEmailSended ? (
    <div className="d-flex flex-column w-100">
      <div className="h6 text-center">Ellenőrző email újraküldése</div>
      <Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Label>Email cím</Form.Label>
        <Form.Control
          type="text"
          placeholder="valaki@email.hu"
          onBlur={() => setIsEmailTouched(true)}
          value={email}
          onChange={(event) => handleEmailChange(event)}
        />
        {inputErrorMessage()}
      </Form.Group>
      <div>
        <div className="d-flex justify-content-center">
          <button
            className="font-btn email-resend-send"
            onClick={() => send()}
            disabled={email.length === 0 || isVerifyingPending}
          >
            Megerősítő email újraküldése
          </button>
        </div>
      </div>
      {formErrorMessage()}
    </div>
  ) : (
    <div className="text-center">
      <h6>Elküldtük a megerősítő emailt a megadott címre!</h6>
    </div>
  );
}