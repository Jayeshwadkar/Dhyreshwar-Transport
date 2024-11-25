import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  FormControl,
  FormHelperText,
  Button,
  Paper,
} from "@mui/material";
import { Alert, Stack } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { updateUser, validateUser } from "@modules/user/slice/userSlice";
import LoadingSpinner from "@ui-controls/LoadingSpinner";
import { setToken, setUserType } from "@services/utils";
import { removeUser, selectIsLoading } from "../slice/userSlice";
import classes from './Login.module.css'
import web from '../../../assets/web.png'
// import topLeftImage from "../../../assets/tnb_logo_01.png";
import topLeftImage from "../../../assets/TNB_Logo1.png";
import loginImage from "../../../assets/DhyareshwarLogo.png"
const initialState = {
  username: "",
  password: "",
};

const initialErrorState = {
  username: {
    invalid: false,
    message: "",
  },
  password: {
    invalid: false,
    message: "",
  },
};

const Login1 = () => {
  const [loginData, setLoginData] = useState(initialState);
  const [formErrors, setFormErrors] = useState(initialErrorState);
  const [httpError, setHttpError] = useState("");
  const [alertMessage, setAlertMessage] = useState("")
  const isLoading = useSelector(selectIsLoading);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    dispatch(removeUser());
  }, []);

  const goToHome = useCallback(() => {
    navigate("/");
  }, [navigate]);

  const validateForm = (formData) => {
    const errors = { ...initialErrorState };
    if (!formData.username || !formData.username?.trim?.()) {
      errors.username = { invalid: true, message: "Username is required" };
    }
    if (!formData.password || !formData.password?.trim?.()) {
      errors.password = { invalid: true, message: "Password is required" };
    } else if (formData.password?.trim?.()?.length < 5) {
      errors.password = {
        invalid: true,
        message: "Password length should be 5 or more characters",
      };
    }

    let validationErrors = false;
    for (const key in errors) {
      if (errors[key].invalid === true) {
        validationErrors = true;
      }
    }
    if (validationErrors) {
      setFormErrors(errors);
    }
    return validationErrors;
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (!validateForm(loginData)) {
      dispatch(validateUser(loginData))
        .then(({ payload = {} }) => {
          const message = payload?.data?.message;
          if (message != "Login successful.") {
            setHttpError(payload.data.message);
            setFormErrors(initialErrorState)
            setAlertMessage(payload.data.message)
          } else {
            const { token, type } = payload?.data || {};
            setToken(token);
            setUserType(type);
            dispatch(updateUser(payload?.data));
            setHttpError("");
            if (token) {
              goToHome();
            }
          }
        })
        .catch(() => {
          setHttpError(
            "Something went wrong! Please try later or contact Administrator."
          );
        });
    }
  };

  const inputChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setLoginData((currState) => {
      return {
        ...currState,
        [name]: value,
      };
    });
  };
  useEffect(() => {
    document.body.classList.add("no-padding");

    return () => {
      document.body.classList.remove("no-padding");
    };
  }, []);


  return (
    <>
      {isLoading && <LoadingSpinner />}
      <div className={classes.loginp}>
        <section className={classes.loginPage}>
          <img src={topLeftImage} alt="Top Left" className={classes.topLeftImage} />
          <div className={classes.manageAccount}>
            <h1>Welcome to the Transporter NoteBook Digital ERP System</h1>
            <h2 className={classes.underline}>Facilitating Transport, Enabling Growth</h2>
            <p>Economic growth critically depends on efficient transportation systems. TNB makes all the data and processes in multiple branches across India, completely digital, safe, and accessible from anywhere</p>
          </div>
          <div className={classes.loginContainer}>
            <div className={classes.loginForm}>
              <img src={loginImage} alt="Login Illustration" className={classes.loginImage} />
              <h3 className={classes.heading}><strong>Sign in to ERP System</strong></h3>
              <div className={classes.space}></div>
              <div style={{ paddingBottom: "10px", textAlign: "center", color: "red" }}>{alertMessage && (alertMessage)}</div>
              <form onSubmit={submitHandler}>
                <div className="grid grid-1-col">
                  <div className="grid-item">
                    <FormControl fullWidth error={formErrors.username.invalid}>
                      <TextField
                        size="small"
                        variant="outlined"
                        label="Username"
                        error={formErrors.username.invalid}
                        value={loginData.username}
                        onChange={inputChangeHandler}
                        name="username"
                        id="username"
                        inputProps={{ maxLength: 50 }}
                      />
                      {formErrors.username.invalid && (
                        <FormHelperText>
                          {formErrors.username.message}
                        </FormHelperText>
                      )}
                    </FormControl>
                  </div>
                  <div className="grid-item">
                    <FormControl fullWidth error={formErrors.username.invalid}>
                      <TextField
                        size="small"
                        variant="outlined"
                        label="Password"
                        type="password"
                        error={formErrors.password.invalid}
                        value={loginData.password}
                        onChange={inputChangeHandler}
                        name="password"
                        id="password"
                        inputProps={{ maxLength: 50 }}
                      />
                      {formErrors.password.invalid && (
                        <FormHelperText>
                          {formErrors.password.message}
                        </FormHelperText>
                      )}
                    </FormControl>
                  </div>
                  <div >
                    <button
                      type="submit"
                      className={classes.loginButton}
                    >
                      Login
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </section>
        <section className={classes.footer}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img
              src={web}
              alt="Transporter NoteBook Website"
              style={{ maxWidth: '100%', height: 'auto', marginRight: '8px' }}    /*change */
            />
            <a href="https://transporternotebook.com/" target="_blank" rel="noreferrer">
              Transporter Note Book
            </a>
          </div>
          <div>
            Powered by:<a href="https://vspace.in">Vspace Software</a>
          </div>
          <div>
            Email <a href="tnb@transporternotebook.com">tnb@vspace.co.in</a>
          </div>
        </section>
      </div>
    </>
  );
};

export default Login1;
