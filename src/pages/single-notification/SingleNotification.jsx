import React, { useContext, useEffect } from "react";
import HudContext from "../../contexts/HudContext";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import NotificationContext from "../../contexts/NotificationContext";
import { useState } from "react";
import moment from "moment";
import "moment/locale/hu";

export default function SingleNotification() {
  const navigate = useNavigate();
  const { setIsHudDisplayed } = useContext(HudContext);
  const { getNotification, setNotificationToOpened } = useContext(NotificationContext);
  const { id } = useParams();
  const [notification] = useState(getNotification(id));

  moment.locale("hu");

  useEffect(() => {
    setIsHudDisplayed(true);
    if (!notification.isOpened) {
      setNotificationToOpened(notification.id);
    }
  }, []);

  return (
    <Layout
      navigations={[
        <button
          className="market-btn font-btn"
          onClick={() => navigate("/notifications")}
        >
          Vissza
        </button>,
      ]}
      title="Értesítés"
    >
      <div className="text-white text-center d-flex flex-column justify-content-between w-100">
        <div>
          <h3>{notification.title}</h3>
          <p style={{
            whiteSpace: 'pre-line'
          }}>{notification.message}</p>
          <h5>Szerzett értékek</h5>
          <div className="d-flex justify-content-center gap-3 mb-3">
            <div>
              <img
                className="me-2"
                src="../images/icons/wood.png"
                alt="wood"
              ></img>
              <span>Fa {notification.woods} db</span>
            </div>
            <div>
              <img
                className="me-2"
                src="../images/icons/stone.png"
                alt="stone"
              ></img>
              <span>Kő {notification.stones} db</span>
            </div>
            <div>
              <img
                className="me-2"
                src="../images/icons/steel.png"
                alt="steel"
              ></img>
              <span>Vas {notification.irons} db</span>
            </div>
            <div>
              <img
                className="me-2"
                src="../images/icons/coin.png"
                alt="coin"
              ></img>
              <span>Coin {notification.coins} db</span>
            </div>
            <div>
              <img className="me-2" src="../images/icons/xp.png" alt="xp"></img>
              <span>XP {notification.experience} pont</span>
            </div>
          </div>
        </div>
        <div>
          <p>{moment(notification.createDate).format("llll")}</p>
        </div>
      </div>
    </Layout>
  );
}