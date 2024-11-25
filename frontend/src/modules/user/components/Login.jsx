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

const Login = () => {
  const [loginData, setLoginData] = useState(initialState);
  const [formErrors, setFormErrors] = useState(initialErrorState);
  const [httpError, setHttpError] = useState("");
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
          if (payload?.data?.message) {
            setHttpError(payload.data.message);
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

  return (
    <>
      {isLoading && <LoadingSpinner />}

      <Paper sx={{ padding: "20px", marginBottom: "20px" }}>
        {httpError !== "" && (
          <Stack
            sx={{
              width: "100%",
              margin: "0 0 30px 0",
              border: "1px solid red",
              borderRadius: "4px",
            }}
            spacing={2}
          >
            <Alert severity="error">{httpError}</Alert>
          </Stack>
        )}
        <div className="login-wrap">
          <div className="login-card">
            <h2 className="pageHead">Login</h2>
            <form onSubmit={submitHandler}>
              <div className="grid grid-1-col">
                <div className="grid-item">
                  <FormControl fullWidth error={formErrors.username.invalid}>
                    <TextField
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
                <div className="grig-item right">
                  <Button
                    variant="contained"
                    size="medium"
                    type="submit"
                    color="primary"
                    className="btn-login"
                  >
                    Login
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </Paper>
    </>
  );
};

export default Login;
