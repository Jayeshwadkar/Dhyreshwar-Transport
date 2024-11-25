import React, { useCallback, useState } from "react";
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
import { createArticle, selectIsLoading } from "./slice/articleSlice";
import { LoadingSpinner } from "../../../../ui-controls";

const initialArticleState = {
  articles_name: "",
  description: "",
};

const initialErrorState = {
  articles_name: {
    invalid: false,
    message: "",
  }
};

const ArticleAdd = () => {
  const [article, setArticle] = useState(initialArticleState);
  const [formErrors, setFormErrors] = useState(initialErrorState);
  const [httpError, setHttpError] = useState("");
  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsLoading);

  const navigate = useNavigate();

  const goToArticlesList = useCallback(() => {
    navigate("/master/articles");
  }, [navigate]);

  const cancelButtonHandler = () => {
    resetButtonHandler();
    goToArticlesList();
  };

  const resetButtonHandler = () => {
    setArticle(initialArticleState);
    setHttpError("");
    setFormErrors(initialErrorState);
  };

  const inputChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setArticle((currState) => {
      return {
        ...currState,
        [name]: name === "articles_name" ? value.toUpperCase() : value
      };
    });
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (!validateForm(article)) {
      if (article.branch) {
        article.branch = article.branch?._id;
      }
      dispatch(createArticle(article))
        .then(({ payload = {} }) => {
          const { message } = payload?.data || "";
          if (message === "Article Already Exist!") {
            setHttpError(message);
          } else {
            setHttpError("");
            setArticle(initialArticleState);
            goToArticlesList();
          }
        })
        .catch((error) => {
          setHttpError(error.message);
        });
    }
  };

  const validateForm = (formData) => {
    const errors = { ...initialErrorState };
    if (!formData.articles_name?.trim?.()) {
      errors.articles_name = { invalid: true, message: "Article name is required" };
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

  return (
    <>
      {isLoading && <LoadingSpinner />}
      <h1 className="pageHead">Add an article</h1>
      <div className="inner-wrap">
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
        <Paper sx={{ padding: "20px", marginBottom: "20px" }}>
          <form action="" onSubmit={submitHandler}>
            <div className="grid grid-6-col">
              <div className="grid-item">
                <FormControl fullWidth error={formErrors.articles_name.invalid}>
                  <TextField
                    size="small"
                    variant="outlined"
                    label="Article name"
                    value={article.articles_name}
                    error={formErrors.articles_name.invalid}
                    onChange={inputChangeHandler}
                    name="articles_name"
                    id="name"
                  />
                  {formErrors.articles_name.invalid && (
                    <FormHelperText>{formErrors.articles_name.message}</FormHelperText>
                  )}
                </FormControl>
              </div>
              <div className="grid-item">
                <FormControl fullWidth>
                  <TextField
                    size="small"
                    variant="outlined"
                    label="Article description"
                    value={article.description}
                    onChange={inputChangeHandler}
                    name="description"
                    id="description"
                  />
                </FormControl>
              </div>
            </div>
            <div className="right">
              <Button
                variant="outlined"
                size="medium"
                onClick={cancelButtonHandler}
              >
                Back
              </Button>
              <Button
                variant="outlined"
                size="medium"
                onClick={resetButtonHandler}
                className="ml6"
              >
                Reset
              </Button>
              <Button
                variant="contained"
                size="medium"
                type="submit"
                color="primary"
                className="ml6"
              >
                Save
              </Button>
            </div>
          </form>
        </Paper>
      </div>
    </>
  );
};

export default ArticleAdd;
