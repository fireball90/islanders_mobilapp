import React, { useContext, useEffect } from "react";
import "../notifications/notifications.css";
import Layout from "../../components/layout/Layout";
import HudContext from "../../contexts/HudContext";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import 'moment/locale/hu';
import NotificationContext from "../../contexts/NotificationContext";

export default function Notifications() {
  const { setIsHudDisplayed } = useContext(HudContext);
  const { notifications, deleteNotification } = useContext(NotificationContext);

  const navigate = useNavigate()

  useEffect(() => {
    setIsHudDisplayed(true);
  }, []);

  function openNotification(id) {
    navigate(`/single-notification/${id}`)
  }

  moment.locale('hu')

  return (
    <Layout navigations={[]} title="Értesítések">
      <div className="container-fluid">
          <div className="col-12 align-items-center d-flex justify-content-center">
            <div className="container">
              <div className="row">
              {notifications.map((notification, index)=>(
                <div className={notification.isOpened ? "not-list-container container" : "not-list-container container new-notification"} key={index}>
                  <div className="row d-flex align-items-center justify-content-center not-height">               
                    <div className="col-3 text-center">
                      <h4>{notification.title}</h4>
                    </div>
                    <div className="col-3 text-center">
                      <p>
                        <img src="../images/icons/wood.png" alt="wood"></img>Fa
                        - {notification.woods} db
                      </p>
                      <p>
                        <img src="../images/icons/stone.png" alt="stone"></img>
                        Kő - {notification.stones} db
                      </p>
                      <p>
                        <img src="../images/icons/steel.png" alt="steel"></img>
                        Vas- {notification.irons} db
                      </p>
                      <p>
                        <img src="../images/icons/coin.png" alt="coin"></img>
                        Coin - {notification.coins} db
                      </p>
                      <p>
                        <img src="../images/icons/xp.png" alt="xp"></img>XP -
                        {notification.experience} pont
                      </p>
                    </div>
                    <div className="col-3 text-center">
                      <h4>Időpont:</h4>
                      <p>{moment(notification.createDate).format("llll")}</p>
                    </div>
                    <div className="col-3 text-center">
                      <button className="open-btn font-btn" onClick={() => openNotification(notification.id)}>Megnyitás</button>
                      <button className="not-delete-btn font-btn" onClick={() => deleteNotification(notification.id)}>Törlés</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}