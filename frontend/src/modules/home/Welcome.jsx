import React from "react";
import { useSelector } from "react-redux";
import Login from "../user/components/Login1";
//import DashLorry from "./DashLorry";

const Welcome = () => {
  const user = useSelector((state) => state.user);

  return (
    <>
    
      {user.username && <h1 className="pageHead homeTitle" style={{ textAlign: "center" }}>
        <span className="welcome-text">
          Welcome{" "}
          {user && user.employee && user.employee.employee_name
            ? user.employee.employee_name
            : ""}{" "}
          to
        </span>{" "}
        <br /> {import.meta.env.VITE_TITLE}
      </h1>}
      {/* <DashLorry/> */}
      {!user.username && <Login />}
    </>
  );
};

export default Welcome;
