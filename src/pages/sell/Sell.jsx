import React, { useContext, useEffect, useState } from "react";
import "../sell/sell.css";
import { Link } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import HudContext from "../../contexts/HudContext";
import axios from "axios";
import Modal from "react-bootstrap/Modal";
import AlertModal from "../../components/alert-modal/Alert";
import IslandContext from "../../contexts/IslandContext";

export default function Sell() {
  const { setIsHudDisplayed } = useContext(HudContext);
  const { player, setPlayer } = useContext(IslandContext);

  const [errorMessage, setErrorMessage] = useState(null);
  const [modalShow, setModalShow] = React.useState(false);

  const [myItem, setMyItem] = useState(0);
  const [myItemAmount, setMyItemAmount] = useState(1);

  const [theirItem, setTheirItem] = useState(0);
  const [theirItemAmount, setTheirItemAmount] = useState(1);

  const [myItemValid, setMyItemValid] = useState(true);
  const [theirItemValid, setTheirItemValid] = useState(true);

  function checkFormIsValid() {
    return myItemValid && theirItemValid;
  }

  function myItemChangeHandler(event) {
    setMyItem(event.target.value);
  }
  function myItemAmountChangeHandler(event) {
    const availableAmount = getAvailableAmount();

    if (
      event.target.value >= 1 &&
      event.target.value <= 10000 &&
      event.target.value <= availableAmount
    ) {
      setMyItemValid(true);
    } else {
      setMyItemValid(false);
    }

    setMyItemAmount(event.target.value);
  }

  function theirItemChangeHandler(event) {
    setTheirItem(event.target.value);
  }
  function theirItemAmountChangeHandler(event) {
    if (event.target.value >= 1 && event.target.value <= 10000) {
      setTheirItemValid(true);
    } else {
      setTheirItemValid(false);
    }

    setTheirItemAmount(event.target.value);
  }

  function getAvailableAmount() {
    switch (Number(myItem)) {
      case 0:
        return player.coins;
      case 1:
        return player.woods;
      case 2:
        return player.stones;
      case 3:
        return player.irons;
      default:
        return 0;
    }
  }

  useEffect(() => {
    setIsHudDisplayed(true);
  }, []);

  function submit(event) {
    event.preventDefault();

    const selectedItem = myItem;
    const selectedAmount = myItemAmount;
    const selectedReplacementItem = theirItem;
    const selectedReplacementAmount = theirItemAmount;

    axios
      .post(`${process.env.REACT_APP_API_BASE}/api/Exchange/CreateExchange`, {
        item: Number(selectedItem),
        amount: Number(selectedAmount),
        replacementItem: Number(selectedReplacementItem),
        replacementAmount: Number(selectedReplacementAmount),
      })
      .then(() => {
        let updatedPlayer = player;

        switch (Number(selectedItem)) {
          case 0:
            updatedPlayer = {
              ...updatedPlayer,
              coins: updatedPlayer.coins - selectedAmount,
            };
            break;
          case 1:
            updatedPlayer = {
              ...updatedPlayer,
              woods: updatedPlayer.woods - selectedAmount,
            };
            break;
          case 2:
            updatedPlayer = {
              ...updatedPlayer,
              stones: updatedPlayer.stones - selectedAmount,
            };
            break;
          case 3:
            updatedPlayer = {
              ...updatedPlayer,
              irons: updatedPlayer.irons - selectedAmount,
            };
          // eslint-disable-next-line no-fallthrough
          default:
            break;
        }
        setPlayer(updatedPlayer);
        setModalShow(true);
        setMyItem(0);
        setTheirItem(0);
        setMyItemAmount(1);
        setTheirItemAmount(0);
      })
      .catch((error) => {
        if (error.code === "ERR_NETWORK") {
          setErrorMessage("Nem sikerült kapcsolódni a szerverhez.");
        } else {
          setErrorMessage(error.response.data);
        }
      });
  }

  return (
    <Layout navigations={[]} title="Hirdetés feladása">
      {errorMessage ? (
        <div>
          <AlertModal title="Hiba történt">
            <span className="text-white">{errorMessage}</span>
          </AlertModal>
        </div>
      ) : null}

      <SellModal show={modalShow} onHide={() => setModalShow(false)} />
      <div className="container-fluid">
        <div className="row">
          <div className="col-12 d-flex align-items-center justify-content-center flex-column sell-all">
            <form id="sell-form" className="row" onSubmit={submit}>
              <div className="justify-content-center">
                <label className="col-sm-12 col-form-label text-center">
                  Válassz anyagot:
                </label>
                <select
                  id="yourItems"
                  name="myItem"
                  className="form-select"
                  value={myItem}
                  onChange={myItemChangeHandler}
                >
                  <option value="0">Érme</option>
                  <option value="1">Fa</option>
                  <option value="2">Kő</option>
                  <option value="3">Vas</option>
                </select>
                <label className="col-sm-12 col-form-label text-center">
                  Válassz mennyiséget:
                </label>
                <input
                  type="number"
                  id="myAmount"
                  name="myAmount"
                  value={myItemAmount}
                  onChange={myItemAmountChangeHandler}
                  className="form-control"
                ></input>
              </div>
              {!myItemValid ? (
                <div className="text-danger">
                  <span>
                    Csak 1 és 10000 közötti értéket adhatsz meg, vagy nem áll
                    rendelkezésedre elég nyersanyag!
                  </span>
                </div>
              ) : null}
              <div className="justify-content-center">
                <label className="col-sm-12 col-form-label text-center">
                  Mit kérsz cserébe:
                </label>
                <select
                  id="theirItem"
                  name="theirItem"
                  className="form-select"
                  value={theirItem}
                  onChange={theirItemChangeHandler}
                >
                  <option value="0">Érme</option>
                  <option value="1">Fa</option>
                  <option value="2">Kő</option>
                  <option value="3">Vas</option>
                </select>
                <label className="col-sm-12 col-form-label text-center">
                  Mennyit kérsz cserébe:
                </label>
                <input
                  type="number"
                  name="theirAmount"
                  id="theirAmount"
                  value={theirItemAmount}
                  onChange={theirItemAmountChangeHandler}
                  className="form-control"
                ></input>
                {!theirItemValid ? (
                  <div>
                    <span className="text-danger">
                      Csak 1 és 10000 közötti értéket adhatsz meg!
                    </span>
                  </div>
                ) : null}
                <div className="d-flex justify-content-center pt-3">
                  <button
                    className="sell-btn font-btn"
                    type="submit"
                    disabled={!checkFormIsValid()}
                  >
                    Hirdetés feladása
                  </button>
                </div>
              </div>
            </form>
          </div>
          <div className="why-tho d-flex justify-content-center align-items-center">
            <Link className="pb-3" to="/market">
              <button className="market-btn font-btn">Mégse</button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function SellModal(props) {
  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      className="modal-animation"
    >
      <div className="successful-sell-modal">
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Sikeres hirdetés feladás
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            A hirdetését sikeresen feladta a piacon. A saját hirdetések gombra
            kattintva törölheti, ha meggondolja magát! Kattinston a bezárás
            gombra a továbblépéshez!
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Link to="/market">
            <button onClick={props.onHide} className="modal-sell-btn">
              Bezárás
            </button>
          </Link>
        </Modal.Footer>
      </div>
    </Modal>
  );
}