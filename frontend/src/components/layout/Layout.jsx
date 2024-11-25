import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Footer, Navigation, Header } from "..";
import classes from "./Layout.module.css";
import {
  getArticles,
  getCustomers,
  getPlaces,
  getVehicles
} from "../../modules/transactions/components/lorry-receipts/slice/lorryReceiptSlice";

const Layout = (props) => {
  const user = useSelector((state) => state.user);
  // const dispatch = useDispatch();

  // useEffect(() => {    
  //   dispatch(getArticles());
  //   dispatch(getCustomers());
  //   dispatch(getPlaces());
  //   dispatch(getVehicles());
  // }, []);

  return (
    <>
      {user && user.username && (
        <>
          <Header />
          <Navigation />

          <div className="main-wrap">
            {/* <div className="left-panel">
            </div> */}
            <div className="right-panel">
              <main className={classes.main}>{props.children}</main>
              <Footer />
            </div>
          </div>
        </>
      )}

      {!user.username && (
        // <div className="bg-login">
        <div>
          {/* <div className="bl_login"> */}
          <div>
            {/* <main className={classes.main}>{props.children}</main> */}
            <main>{props.children}</main>
          </div>
        </div>
      )}
    </>
  );
};

export default Layout;
