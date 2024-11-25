import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  TextField,
  FormControl,
  FormHelperText,
  Button,
  Paper,
} from "@mui/material";
import { Alert, Stack } from "@mui/material";
import { LoadingSpinner } from "../../../../ui-controls";
import { useDispatch, useSelector } from "react-redux";
import {
  getArticle,
  selectIsLoading,
  updateArticle,
} from "./slice/articleSlice";

const initialArticleState = {
  articles_name: "",
  description: ""
};

const initialErrorState = {
  articles_name: {
    invalid: false,
    message: "",
  }
};

const ArticleEdit = () => {
  const [article, setArticle] = useState(initialArticleState);
  const [fetchedArticle, setFetchedArticle] = useState(initialArticleState);
  const [formErrors, setFormErrors] = useState(initialErrorState);
  const [httpError, setHttpError] = useState("");
  const isLoading = useSelector(selectIsLoading);
  const dispatch = useDispatch();

  const location = useLocation();
  const { articleId } = location.state;
  const navigate = useNavigate();

  const goToArticlesList = useCallback(() => {
    navigate("/master/articles");
  }, [navigate]);

  useEffect(() => {
    if (articleId && articleId !== "") {
      dispatch(getArticle(articleId))
        .then(({ payload = {} }) => {
          const { message } = payload?.data || {};
          if (message) {
            setHttpError(message);
          } else {
            setHttpError("");
            setArticle(payload?.data);
            setFetchedArticle(payload?.data);
          }
        })
        .catch((error) => {
          setHttpError(error.message);
        });
    }
  }, [articleId]);

  const backButtonHandler = () => {
    goToArticlesList();
  };

  const resetButtonHandler = () => {
    setArticle(fetchedArticle);
    setHttpError("");
    setFormErrors(initialErrorState);
  };

  const inputChangeHandler = (isSelect, e) => {
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
      dispatch(updateArticle(article))
        .then(({ payload = {} }) => {
          const { message } = payload?.data || {};
          if (message) {
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
      <h1 className="pageHead">Edit an article</h1>
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

        {isLoading && <LoadingSpinner />}

        {!isLoading && (
          <form action="" onSubmit={submitHandler}>
            <Paper sx={{ padding: "20px", marginBottom: "20px" }}>
              <div className="grid grid-6-col">
                <div className="grid-item">
                  <FormControl fullWidth error={formErrors.articles_name.invalid}>
                    <TextField
                      size="small"
                      variant="outlined"
                      label="Article name"
                      value={article.articles_name}
                      error={formErrors.articles_name.invalid}
                      onChange={inputChangeHandler.bind(null, false)}
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
                      onChange={inputChangeHandler.bind(null, false)}
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
                  onClick={backButtonHandler}
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
            </Paper>
          </form>
        )}
      </div>
    </>
  );
};

export default ArticleEdit;
