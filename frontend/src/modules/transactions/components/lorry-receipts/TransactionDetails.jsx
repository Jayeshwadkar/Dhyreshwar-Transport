import React, { useEffect, useRef, useState } from "react";
import {
  TextField,
  FormControl,
  FormHelperText,
  Button,
  InputAdornment,
  Autocomplete,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useDispatch, useSelector } from "react-redux";
import {
  getRateMasterByCustomer,
  selectIsLoading,
} from "./slice/lorryReceiptSlice";
import { LoadingSpinner } from "../../../../ui-controls";
import { validateNumber } from "../../../../services/utils";

const RATE_TYPES = [
  { label: "Fixed", value: "Fixed" },
  { label: "Kg", value: "Kg" },
  { label: "Case", value: "Case" },
];

const initialState = {
  article: null,
  articleNo: "",
  description: "",
  weight: "",
  chargeWeight: "",
  rateType: RATE_TYPES[0],
  rate: "",
  freight: "",
};

const initialErrorState = {
  article: {
    invalid: false,
    message: "",
  },
  articleNo: {
    invalid: false,
    message: "",
  },
  weight: {
    invalid: false,
    message: "",
  },
  chargeWeight: {
    invalid: false,
    message: "",
  },
  rateType: {
    invalid: false,
    message: "",
  },
  rate: {
    invalid: false,
    message: "",
  },
  freight: {
    invalid: false,
    message: "",
  },
};

function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const TransactionDetails = ({ articles, lorryReceipt, setLorryReceipt, gotoFreight, setIsTrUpdated }) => {
  const columns = [
    { field: "srNo", headerName: "SR.No", flex: 1 },
    {
      field: "article",
      headerName: "Article",
      flex: 1,
      renderCell: (params) => {
        if (typeof params.row.article === "string") {
          return params.row.article;
        }
        if (params.row.article?.label) {
          return params.row.article?.label;
        }
        return null;
      },
    },
    { field: "articleNo", headerName: "No. of articles", flex: 1 },
    { field: "description", headerName: "Description", flex: 1 },
    { field: "weight", headerName: "Weight", flex: 1 },
    // { field: "chargeWeight", headerName: "Charge weight", flex: 1 },
    {
      field: "rateType",
      headerName: "Rate type",
      flex: 1,
      renderCell: (params) => {
        if (typeof params.row?.rateType === "string") {
          return params.row.rateType;
        }
        if (params.row.rateType?.value) {
          return params.row.rateType.value;
        }
        return null;
      },
    },
    { field: "rate", headerName: "Rate", flex: 1 },
    { field: "freight", headerName: "Freight", flex: 1 },
    {
      field: "actions",
      headerName: "Action",
      flex: 1,
      sortable: false,
      renderCell: (params) => {
        const triggerEdit = (e) => {
          setIsTrUpdated(true)
          e.stopPropagation();
          return navigateToEdit(
            params.row.id || params.row._id,
            params.row._id ? true : false
          );
        };

        const triggerDelete = (e) => {
          setIsTrUpdated(true)
          e.stopPropagation();
          return deleteTransactionDetail(
            params.row.id || params.row._id,
            params.row._id ? true : false
          );
        };

        return (
          <>
            <IconButton size="small" onClick={triggerEdit} color="primary">
              <EditIcon />
            </IconButton>
            &nbsp;&nbsp;
            <IconButton size="small" onClick={triggerDelete} color="error">
              <DeleteIcon />
            </IconButton>
          </>
        );
      },
    },
  ];

  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsLoading);
  const [rates, setRates] = useState(null)
  const [formErrors, setFormErrors] = useState(initialErrorState);
  const [transactionDetail, setTransactionDetail] = useState(initialState);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hasErrors, setHasErrors] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [rateMaster, setRateMaster] = useState(false);
  const [httpError, setHttpError] = useState("");
  const [screenSize, setScreenSize] = useState(1500);


  useEffect(() => {
    setScreenSize(window.outerWidth);
  }, []);

  let articleRef = useRef(null);

  useEffect(() => {
    if (isSubmitted && !hasErrors) {
      articleRef.current.focus();
      setLorryReceipt((currentState) => {
        let updatedState = {
          ...currentState,
          transactions: [...currentState.transactions],
        };
        if (!isEditMode) {
          const updatedTransactionDetail = {
            ...transactionDetail,
            id: Math.random(),
          };
          const selectedArticle = articles?.filter?.(
            (article) => article._id === updatedTransactionDetail.article
          );
          if (selectedArticle?.length) {
            updatedTransactionDetail.article = selectedArticle[0].name;
          }
          updatedState.transactions = [
            ...currentState.transactions,
            { ...updatedTransactionDetail },
          ];
        } else {
          let filteredDetails;
          if (!updatedState.transactions[0]._id) {
            filteredDetails = updatedState.transactions?.filter?.(
              (detail) => detail.id !== transactionDetail.id
            );
          } else {
            filteredDetails = updatedState.transactions?.filter?.(
              (detail) => detail._id !== transactionDetail._id
            );
          }
          const selectedArticle = articles?.filter?.(
            (article) =>
              article._id === transactionDetail.article ||
              article.name === transactionDetail.article
          );
          const updatedDetail = { ...transactionDetail };
          if (selectedArticle?.length) {
            updatedDetail.article = selectedArticle[0].name;
          }
          updatedState.transactions = [
            ...filteredDetails,
            { ...updatedDetail },
          ];
        }
        return updatedState;
      });
      setTransactionDetail(initialState);
      document.getElementById('articleFocus').focus();
      setIsSubmitted(false);
      setIsEditMode(false);
      setIsTrUpdated(true)
    }
  }, [
    isSubmitted,
    hasErrors,
    transactionDetail,
    articles,
    isEditMode,
    setLorryReceipt,
  ]);

  useEffect(() => {
    if (transactionDetail?.weight) {
      setTransactionDetail((currState) => {
        return {
          ...currState,
          chargeWeight: currState.weight,
        };
      });
    }
  }, [transactionDetail?.weight]);

  useEffect(() => {
    let freight;
    if (
      transactionDetail.rateType &&
      (transactionDetail.rateType?.value === "Kg" ||
        transactionDetail.rateType === "Kg") &&
      transactionDetail.chargeWeight &&
      transactionDetail.rate
    ) {
      freight =
        +transactionDetail.chargeWeight * +Number(transactionDetail.rate);
    }
    if (
      transactionDetail.rateType &&
      transactionDetail.rateType.value === "Case" &&
      transactionDetail.rate &&
      transactionDetail.articleNo
    ) {
      freight = +transactionDetail.articleNo * +Number(transactionDetail.rate);
    }
    if (freight) {
      setTransactionDetail((currentState) => {
        return {
          ...currentState,
          freight: freight,
        };
      });
    }
  }, [
    transactionDetail.rate,
    transactionDetail.chargeWeight,
    transactionDetail.rateType,
    transactionDetail.articleNo,
  ]);

  // useEffect(() => {
  //   if (lorryReceipt.consignor && lorryReceipt.consignor._id) {
  //     dispatch(getRateMasterByCustomer(lorryReceipt.consignor._id))
  //       .then(({ payload = {} }) => {
  //         const { message } = payload?.data || {};
  //         if (message) {
  //           setHttpError(message);
  //         } else {
  //           setRateMaster(payload?.data.rateMaster);
  //         }
  //       })
  //       .catch((error) => {
  //         setHttpError(error.message);
  //       });
  //   }
  // }, [lorryReceipt.consignor]);

  useEffect(() => {
    if (
      rateMaster &&
      transactionDetail.article &&
      transactionDetail.article.name
    ) {
      const selectedRate = rateMaster.rates?.find?.(
        (rate) =>
          rate.article?.toLowerCase?.() ===
          transactionDetail.article.name?.toLowerCase?.()
      );
      if (selectedRate) {
        setTransactionDetail((currState) => {
          return {
            ...currState,
            rate: selectedRate.rate,
          };
        });
      }
    } else {
      setTransactionDetail((currState) => {
        return {
          ...currState,
          rate: "",
        };
      });
    }
  }, [rateMaster, transactionDetail.article]);

  useEffect(() => {

    setTransactionDetail(currentState => {
      return {
        ...currentState,
        srNo: lorryReceipt.transactions.length + 1
      }
    })

  }, [lorryReceipt.transactions]);

  const inputChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setTransactionDetail((currState) => {
      return {
        ...currState,
        [name]: name === "description" ? capitalizeFirstLetter(value) : value,
      };
    });
  };

  const resetButtonHandler = () => {
    setTransactionDetail(initialState);
    setFormErrors(initialErrorState);
    gotoFreight();
  };

  const handleFocusChangeFreight = (e) => {
    if (e.code === "Tab") {
      setTimeout(() => {
        gotoFreight();
      }, 100)
    }
  }

  const submitHandler = (e) => {
    // console.log(lorryReceipt)
    e.preventDefault();
    setFormErrors((currState) => validateForm(transactionDetail));
    setIsSubmitted(true);
  };

  const navigateToEdit = (id, has_Id) => {
    let editedTransactionDetail;
    if (!has_Id) {
      editedTransactionDetail = {
        ...(lorryReceipt.transactions?.filter?.(
          (detail) => detail.id === id
        )[0] || {}),
      };
    } else {
      editedTransactionDetail = {
        ...(lorryReceipt.transactions?.filter?.(
          (detail) => detail._id === id
        )[0] || {}),
      };
    }
    const editedArticle = articles?.findIndex?.((article) => {
      return article.name === editedTransactionDetail.article;
    });
    if (editedArticle >= 0) {
      editedTransactionDetail.article = articles[editedArticle];
    }
    const editedRateType = RATE_TYPES?.findIndex?.(
      (rateType) => rateType.label === editedTransactionDetail.rateType
    );
    if (editedRateType >= 0) {
      editedTransactionDetail.rateType = RATE_TYPES[editedRateType];
    }
    localStorage.setItem("editedTransactionDetail", JSON.stringify(editedTransactionDetail));
    setTransactionDetail(editedTransactionDetail);
    setIsEditMode(true);
  };
  useEffect(() => {
    const storedTransactionDetail = JSON.parse(localStorage.getItem("editedTransactionDetail"));
    if (storedTransactionDetail && storedTransactionDetail.rate !== undefined) {
      setTransactionDetail(prevState => ({
        ...prevState,
        rate: storedTransactionDetail.rate || "",
      }));
      localStorage.removeItem("editedTransactionDetail");

    } else {
      console.log("Rate not found in storedTransactionDetail.");
    }

  }, [transactionDetail.rate])

  const deleteTransactionDetail = (selectedId, has_Id) => {
    let updatedTransactions;
    if (!has_Id) {
      updatedTransactions = lorryReceipt.transactions?.filter?.(
        (detail) => detail.id !== selectedId
      );
    } else {
      updatedTransactions = lorryReceipt.transactions?.filter?.(
        (detail) => detail._id !== selectedId
      );
    }
    setLorryReceipt((currentState) => {
      return {
        ...currentState,
        transactions: updatedTransactions,
      };
    });
  };

  const validateForm = (formData) => {
    const errors = { ...initialErrorState };
    if (!formData.article) {
      errors.article = { invalid: true, message: "Article is required" };
    }
    if (
      (typeof formData.articleNo === "string" &&
        !formData.articleNo?.trim?.()) ||
      (typeof formData.articleNo === "number" && formData.articleNo <= 0)
    ) {
      errors.articleNo = {
        invalid: true,
        message: "Number of articles is required",
      };
    }
    if (formData.articleNo && isNaN(formData.articleNo)) {
      errors.materialCost = {
        invalid: true,
        message: "Number of articles should be a number",
      };
    }
    if (
      (!formData.weight || formData.weight <= 0) &&
      formData.rateType === RATE_TYPES[1]
    ) {
      errors.weight = {
        invalid: true,
        message: "Weight is required",
      };
    }
    if (
      (!formData.chargeWeight || formData.chargeWeight <= 0) &&
      formData.rateType === RATE_TYPES[1]
    ) {
      errors.chargeWeight = {
        invalid: true,
        message: "Charge weight is required",
      };
    }
    if (formData.weight && isNaN(formData.weight)) {
      errors.weight = {
        invalid: true,
        message: "Weight should be in a number",
      };
    }
    if (!formData.rateType) {
      errors.rateType = { invalid: true, message: "Rate type is required" };
    }
    if (formData.rate && isNaN(formData.weight)) {
      errors.rate = { invalid: true, message: "Rate  is required" };
    }
    // if (!formData.freight) {
    //   errors.freight = { invalid: true, message: "Freight is required" };
    // }

    let validationErrors = false;
    for (const key in errors) {
      if (errors[key].invalid === true) {
        validationErrors = true;
      }
    }
    if (validationErrors) {
      setHasErrors(true);
    } else {
      setHasErrors(false);
    }
    return errors;
  };

  const autocompleteChangeListener = (e, option, name) => {

    if (name === 'rateType' && option.value === "Fixed") {
      setTransactionDetail(prev => ({
        ...prev,
        [name]: option,
        rate: ""
      }))
    } else {
      setTransactionDetail((currState) => {
        return {
          ...currState,
          [name]: option,
        };
      });
    }
  };

  const handleFocusRateChange = (e) => {
    if (e.code === "Tab") {
      setTimeout(() => {
        if (e.target.value === "Fixed") {
          document.getElementById('freight').focus();
        } else {
          document.getElementById('rate').focus();
        }
      }, 10)
    }
  }

  const handleFocusFreightToAdd = (e) => {
    if (e.code === "Tab") {
      setTimeout(() => {
        document.getElementById('btnAdd').focus();
      }, 100)
    }
  }

  return (
    <div>
      {/* {isLoading && <LoadingSpinner />} */}
      <form
        id="transactionDetailsForm"
        onSubmit={submitHandler}
        className="mb20"
        style={{ overflowX: screenSize <= 1200 ? 'scroll' : 'auto' }}
      >
        <table style={{ minWidth: '1200px' }} className="customTable">
          <tbody>
            <tr>
              <td width={50}>
                <label htmlFor="">SR</label>
                <FormControl fullWidth>
                  <TextField
                    disabled={true}
                    size="small"
                    variant="outlined"
                    label=""
                    value={transactionDetail.srNo}
                    onChange={inputChangeHandler}
                    name="srNo"
                    id="srNo"
                    inputProps={{ tabIndex: 15 }}
                  />
                </FormControl>
              </td>
              <td width={180}>
                <label htmlFor="">Article</label>
                <FormControl
                  fullWidth
                  size="small"
                  error={formErrors.article.invalid}
                >
                  <Autocomplete
                    autoSelect
                    autoHighlight={true}
                    ref={articleRef || []}
                    size="small"
                    name="article"
                    options={articles || []}
                    value={transactionDetail.article}
                    onChange={(e, value) =>
                      autocompleteChangeListener(e, value, "article")
                    }
                    id="articleFocus"
                    openOnFocus
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        inputProps={{ ...params.inputProps, tabIndex: 16 }}
                        label=""
                        error={formErrors.article.invalid}
                        fullWidth
                        inputRef={articleRef}

                      />
                    )}
                  />
                  {formErrors.article.invalid && (
                    <FormHelperText>{formErrors.article.message}</FormHelperText>
                  )}
                </FormControl>
              </td>
              <td width={200}>
                <label htmlFor="">No of articles</label>
                <FormControl fullWidth error={formErrors.articleNo.invalid}>
                  <TextField
                    size="small"
                    variant="outlined"
                    label=""
                    value={transactionDetail.articleNo || ""}
                    error={formErrors.articleNo.invalid}
                    onChange={inputChangeHandler}
                    onInput={validateNumber}
                    name="articleNo"
                    id="articleNo"
                    inputProps={{ tabIndex: 17 }}
                  />
                  {formErrors.articleNo.invalid && (
                    <FormHelperText>{formErrors.articleNo.message}</FormHelperText>
                  )}
                </FormControl>
              </td>
              <td width={300}>
                <label htmlFor="">Description</label>
                <FormControl fullWidth>
                  <TextField
                    size="small"
                    variant="outlined"
                    label=""
                    value={transactionDetail.description}
                    onChange={inputChangeHandler}
                    name="description"
                    id="description"
                    inputProps={{ tabIndex: 18 }}
                  />
                </FormControl>
              </td>
              <td width={140}>
                <label htmlFor="">Weight</label>
                <FormControl fullWidth error={formErrors.weight.invalid}>
                  <TextField
                    size="small"
                    variant="outlined"
                    label=""
                    value={transactionDetail.weight || ""}
                    error={formErrors.weight.invalid}
                    onChange={inputChangeHandler}
                    onInput={validateNumber}
                    name="weight"
                    id="weight"
                    inputProps={{ tabIndex: 19 }}
                  />
                  {formErrors.weight.invalid && (
                    <FormHelperText>{formErrors.weight.message}</FormHelperText>
                  )}
                </FormControl>
              </td>
              <td width={130}>
                <label htmlFor="">Rate type</label>
                <FormControl
                  fullWidth
                  size="small"
                  error={formErrors.rateType.invalid}
                >
                  <Autocomplete
                    autoSelect
                    size="small"
                    name="rateType"
                    options={RATE_TYPES}
                    value={transactionDetail.rateType}
                    onChange={(e, value) =>
                      autocompleteChangeListener(e, value, "rateType")
                    }
                    openOnFocus
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        inputProps={{ ...params.inputProps, tabIndex: 20 }}
                        label=""
                        error={formErrors.rateType.invalid}
                        onKeyDown={handleFocusRateChange}
                        fullWidth
                      />
                    )}
                  />
                  {formErrors.rateType.invalid && (
                    <FormHelperText>{formErrors.rateType.message}</FormHelperText>
                  )}
                </FormControl>
              </td>
              <td width={140}>
                <label htmlFor="">Rate</label>
                <FormControl fullWidth error={formErrors.rate.invalid}>
                  <TextField
                    size="small"
                    variant="outlined"
                    label=""
                    value={transactionDetail.rate || ""}
                    error={formErrors.rate.invalid}
                    onChange={inputChangeHandler}
                    onInput={validateNumber}
                    name="rate"
                    id="rate"
                    disabled={transactionDetail.rateType?.value === "Fixed"}
                    InputProps={{
                      tabIndex: 21,
                      startAdornment: (
                        <InputAdornment position="start">&#8377;</InputAdornment>
                      ),
                    }}
                  />
                  {formErrors.rate.invalid && (
                    <FormHelperText>{formErrors.rate.message}</FormHelperText>
                  )}
                </FormControl>
              </td>
              <td width={140}>
                <label htmlFor="">Freight</label>
                <FormControl fullWidth error={formErrors.freight.invalid}>
                  <TextField
                    size="small"
                    variant="outlined"
                    label=""
                    value={transactionDetail.freight || ""}
                    error={formErrors.freight.invalid}
                    name="freight"
                    id="freight"
                    onKeyDown={handleFocusFreightToAdd}
                    InputProps={{
                      readOnly: transactionDetail.rateType?.value !== "Fixed",
                      tabIndex: 22,
                      startAdornment: (
                        <InputAdornment position="start">&#8377;</InputAdornment>
                      ),
                    }}
                    onChange={inputChangeHandler}
                    onInput={validateNumber}
                  />
                  {formErrors.freight.invalid && (
                    <FormHelperText>{formErrors.freight.message}</FormHelperText>
                  )}
                </FormControl>
              </td>
              <td width={250}>
                <div style={{ marginTop: '18px' }} className="right">
                  <Button
                    variant="contained"
                    // size="small"
                    type="submit"
                    color="primary"
                    form="transactionDetailsForm"
                    className="ml6"
                    inputProps={{ tabIndex: 23 }}
                    tabIndex={23}
                    id="btnAdd"
                  >
                    {isEditMode ? "Update" : "Add"}
                  </Button>
                  <Button
                    variant="outlined"
                    // size="small"
                    onClick={resetButtonHandler}
                    onKeyDown={handleFocusChangeFreight}
                    className="ml6"
                    inputProps={{ tabIndex: 24 }}
                    tabIndex={24}
                  >
                    Reset
                  </Button>

                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </form>

      <DataGrid

        autoHeight
        density="compact"
        // getRowId={(row) => row.id || row.id}
        rows={lorryReceipt.transactions.map((data, key) => {
          return {
            ...data,
            srNo: key + 1
          }
        })}
        columns={columns}
        // initialState={{
        //   ...columns,
        //   columns: {
        //     columnVisibilityModel: {
        //       id: false,
        //     },
        //   },
        // }}

        pageSize={10}
        rowsPerPageOptions={[10]}
        disableSelectionOnClick
      />
      <br />
      <p>
        Total No of Article : <strong>{lorryReceipt.transactions.reduce((total, num) => total + Math.round(Number(num.articleNo)), 0)}</strong> Total Charge Weight : <strong>{lorryReceipt.transactions.reduce((total, num) => total + Math.round(Number(num.weight)), 0)}</strong>
      </p>
    </div>
  );
};

export default TransactionDetails;
