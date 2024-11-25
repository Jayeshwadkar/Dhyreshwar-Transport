import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  FormControl,
  FormHelperText,
  Button,
  Autocomplete,
} from "@mui/material";
import Paper from "@mui/material/Paper";
import { Alert, Stack } from "@mui/material";
// import { makeStyles } from "@material-ui/core/styles";
import { LoadingSpinner } from "../../../../ui-controls";
import {
  // emailRegEx,
  // mobileNoRegEx,
  states,
  validateNumber,
  validatePhoneNumber,
} from "../../../../services/utils";

import ContactPersonList from "../contact-person/ContactPersonList";
import ContactPersonForm from "../contact-person/ContactPersonForm";
import { useDispatch, useSelector } from "react-redux";
import { createCustomer, selectIsLoading } from "./slice/customerSlice";

// const useStyles = makeStyles(() => ({
//   menuPaper: {
//     maxHeight: 300,
//     maxWidth: 100,
//   },
// }));

const initialErrorState = {
  name: {
    invalid: false,
    message: "",
  },
  address: {
    invalid: false,
    message: "",
  },
  city: {
    invalid: false,
    message: "",
  },
  telephone: {
    invalid: false,
    message: "",
  },
  email: {
    invalid: false,
    message: "",
  },
  contactPerson: {
    invalid: false,
    message: "",
  }
};

const CustomerAdd = () => {
  const initialState = {
    name: "",
    address: "",
    telephone: "",
    fax: "",
    cstNo: "",
    gstNo: "",
    state: "",
    city: "",
    email: "",
    vendorCode: "",
    vatNo: "",
    eccNo: "",
    branch: null,
    closingBalance: "",
    closingBalanceType: null,
    openingBalance: "",
    openingBalanceType: null,
    contactPerson: []
  };
  const user = useSelector((state) => state.user);
  const [customer, setCustomer] = useState(initialState);
  const { places } = useSelector(
    ({ lorryreceipt }) => lorryreceipt
  );
  const [formErrors, setFormErrors] = useState(initialErrorState);
  const [httpError, setHttpError] = useState("");
  const [editContact, setEditContact] = useState(null);
  const isLoading = useSelector(selectIsLoading);
  const [contactPerson, setContactPerson] = useState([])

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const goToCustomersList = useCallback(() => {
    navigate("/master/customers");
  }, [navigate]);

  const resetButtonHandler = () => {
    setCustomer({ ...initialState });
    setHttpError("");
    setFormErrors(initialErrorState);
  };

  const inputChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setCustomer((currState) => {
      return {
        ...currState,
        [name]: name === "name" || name === "gstNo" ? value.toUpperCase() : value
      };
    });
  };

  const autocompleteChangeListener = (e, value, name) => {
    setCustomer((currState) => {
      return {
        ...currState,
        [name]: value,
      };
    });
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (!validateForm(customer)) {
      if (customer.branch) {
        customer.branch = customer.branch?._id;
      }
      dispatch(createCustomer({ ...customer, city: customer.city?.place_name, contactPerson: contactPerson }))
        .then(({ payload = {} }) => {
          const { message } = payload?.data || {};
          if (message.includes("Already Exist!")) {
            setHttpError(message);
          } else {
            setHttpError("");
            setCustomer(initialState);
            goToCustomersList();
          }
        })
        .catch((error) => {
          setHttpError(error.message);
        });
    }
  };

  const backButtonHandler = () => {
    goToCustomersList();
  };

  const validateForm = (formData) => {
    const errors = { ...initialErrorState };
    if (!formData.name?.trim?.()) {
      errors.name = { invalid: true, message: "Customer name is required" };
    }

    if (!formData.city) {
      errors.city = { invalid: true, message: "Customer city is required" };
    }

    if (!formData.address) {
      errors.address = {
        invalid: true,
        message: "Address is required",
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

  // const handleOnContactPersonAdd = (receivedPerson) => {
  //   if (!editContact) {
  //     setCustomer((currentState) => {
  //       const currentCustomer = { ...currentState };
  //       currentCustomer.contactPerson?.push?.(receivedPerson);
  //       return currentCustomer;
  //     });
  //   } else {
  //     const editedContact = { ...editContact };
  //     const updatedReceivedPerson = { ...receivedPerson };
  //     delete updatedReceivedPerson.index;
  //     setCustomer((currentState) => {
  //       const currentCustomer = { ...currentState };
  //       const currentCustomerContacts = [...currentState.contactPerson];
  //       currentCustomerContacts[editedContact.index] = {
  //         ...updatedReceivedPerson,
  //       };
  //       currentCustomer.contactPerson = [...currentCustomerContacts];
  //       return currentCustomer;
  //     });
  //     setEditContact(null);
  //   }
  // };

  const handleOnContactPersonAdd = (receivedPerson) => {
    if (!editContact) {
      setContactPerson((prev) => [...prev, receivedPerson])
    } else {
      const editedContact = { ...editContact };
      const updatedReceivedPerson = { ...receivedPerson };
      delete updatedReceivedPerson.index;
      setContactPerson((currentState) => {
        const currentSupplierContacts = [...currentState];
        currentSupplierContacts[editedContact.index] = {
          ...updatedReceivedPerson,
        };
        return currentSupplierContacts;
      });
      setEditContact(null);
    }
  }

  // const handleTriggerEdit = (index) => {
  //   setEditContact({ ...customer.contactPerson[index], index: index });
  // };

  const handleTriggerEdit = (index) => {
    setEditContact({ ...contactPerson[index], index: index });
  };

  // const handleTriggerDelete = (contactIndex) => {
  //   setCustomer((currentState) => {
  //     const currentCustomer = { ...currentState };
  //     currentCustomer.contactPerson = currentCustomer.contactPerson?.filter?.(
  //       (contact, index) => index !== contactIndex
  //     );
  //     return currentCustomer;
  //   });
  // };

  const handleTriggerDelete = (contactIndex) => {
    setContactPerson((currentState) => {
      const currentContact = currentState.filter((contact, index) => index != contactIndex);
      return currentContact;
    });
  };

  return (
    <>
      {isLoading && <LoadingSpinner />}

      <h1 className="pageHead">Add a customer</h1>
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

      {!isLoading && (
        <div>
          <form action="" id="customerForm" onSubmit={submitHandler}>
            <div className="inner-wrap">
              <Paper sx={{ padding: "20px", marginBottom: "20px" }}>
                <div className="grid grid-6-col">

                  <div className="grid-item">
                    <FormControl fullWidth error={formErrors.name.invalid}>
                      <TextField
                        size="small"
                        variant="outlined"
                        label="Name"
                        value={customer.name}
                        error={formErrors.name.invalid}
                        onChange={inputChangeHandler}
                        name="name"
                        id="name"
                      />
                      {formErrors.name.invalid && (
                        <FormHelperText>
                          {formErrors.name.message}
                        </FormHelperText>
                      )}
                    </FormControl>
                  </div>
                  <div className="grid-item">
                    <FormControl fullWidth error={formErrors.address.invalid}>
                      <TextField
                        size="small"
                        variant="outlined"
                        label="Correspondence address"
                        value={customer.address}
                        onChange={inputChangeHandler}
                        error={formErrors.address.invalid}
                        name="address"
                        id="address"
                      />
                      {formErrors.address.invalid && (
                        <FormHelperText>
                          {formErrors.address.message}
                        </FormHelperText>
                      )}
                    </FormControl>
                  </div>
                  <div className="grid-item">
                    <FormControl fullWidth error={formErrors.telephone.invalid}>
                      <TextField
                        size="small"
                        variant="outlined"
                        label="Telephone"
                        value={customer.telephone}
                        error={formErrors.telephone.invalid}
                        onChange={inputChangeHandler}
                        onInput={validatePhoneNumber}
                        name="telephone"
                        id="telephone"
                      />
                      {formErrors.telephone.invalid && (
                        <FormHelperText>
                          {formErrors.telephone.message}
                        </FormHelperText>
                      )}
                    </FormControl>
                  </div>
                  <div className="grid-item">
                    <FormControl fullWidth>
                      <TextField
                        size="small"
                        variant="outlined"
                        label="Fax No"
                        value={customer.fax}
                        onChange={inputChangeHandler}
                        name="fax"
                        id="fax"
                      />
                    </FormControl>
                  </div>
                  <div className="grid-item">
                    <FormControl fullWidth>
                      <TextField
                        size="small"
                        variant="outlined"
                        label="CST No."
                        value={customer.cstNo}
                        onChange={inputChangeHandler}
                        name="cstNo"
                        id="cstNo"
                      />
                    </FormControl>
                  </div>
                  <div className="grid-item">
                    <FormControl fullWidth>
                      <TextField
                        size="small"
                        variant="outlined"
                        label="GST No."
                        value={customer.gstNo}
                        onChange={inputChangeHandler}
                        name="gstNo"
                        id="gstNo"
                      />
                    </FormControl>
                  </div>
                  <div className="grid-item">
                    <FormControl fullWidth size="small">
                      <Autocomplete
                        disablePortal
                        size="small"
                        name="state"
                        options={states || []}
                        value={customer.state || null}
                        onChange={(e, value) =>
                          autocompleteChangeListener(e, value, "state")
                        }
                        getOptionLabel={(option) => option}
                        openOnFocus
                        renderInput={(params) => (
                          <TextField {...params} label="State" fullWidth />
                        )}
                      />
                    </FormControl>
                  </div>
                  {/* <div className="grid-item">
                    <FormControl fullWidth>
                      <TextField
                        size="small"
                        variant="outlined"
                        label="City"
                        value={customer.city}
                        onChange={inputChangeHandler}
                        name="city"
                        id="city"
                      />
                    </FormControl>
                  </div> */}
                  <div className="grid-item">
                    <FormControl error={formErrors.city.invalid} fullWidth size="small">
                      <Autocomplete
                        disablePortal
                        size="small"
                        name="city"
                        options={places || []}
                        value={customer.city || null}
                        onChange={(e, value) =>
                          autocompleteChangeListener(e, value, "city")
                        }
                        getOptionLabel={(option) => option.place_name}
                        openOnFocus
                        renderInput={(params) => (
                          <TextField {...params} label="City" fullWidth />
                        )}
                      />
                      {formErrors.city.invalid && (
                        <FormHelperText>
                          {formErrors.city.message}
                        </FormHelperText>
                      )}
                    </FormControl>
                  </div>
                  <div className="grid-item">
                    <FormControl fullWidth error={formErrors.email.invalid}>
                      <TextField
                        size="small"
                        variant="outlined"
                        label="Email"
                        value={customer.email}
                        error={formErrors.email.invalid}
                        onChange={inputChangeHandler}
                        name="email"
                        id="email"
                      />
                      {formErrors.email.invalid && (
                        <FormHelperText>
                          {formErrors.email.message}
                        </FormHelperText>
                      )}
                    </FormControl>
                  </div>
                  <div className="grid-item">
                    <FormControl fullWidth>
                      <TextField
                        size="small"
                        variant="outlined"
                        label="Vendor Code"
                        value={customer.vendorCode}
                        onChange={inputChangeHandler}
                        name="vendorCode"
                        id="vendorCode"
                      />
                    </FormControl>
                  </div>
                  <div className="grid-item">
                    <FormControl fullWidth>
                      <TextField
                        size="small"
                        variant="outlined"
                        label="VAT No"
                        value={customer.vatNo}
                        onChange={inputChangeHandler}
                        name="vatNo"
                        id="vatNo"
                      />
                    </FormControl>
                  </div>
                  <div className="grid-item">
                    <FormControl fullWidth>
                      <TextField
                        size="small"
                        variant="outlined"
                        label="ECC No"
                        value={customer.eccNo}
                        onChange={inputChangeHandler}
                        name="eccNo"
                        id="eccNo"
                      />
                    </FormControl>
                  </div>
                  <div className="grid-item">
                    <FormControl fullWidth>
                      <TextField
                        size="small"
                        variant="outlined"
                        label="Opening balance"
                        value={customer.openingBalance}
                        onChange={inputChangeHandler}
                        onInput={validateNumber}
                        name="openingBalance"
                        id="openingBalance"
                      />
                    </FormControl>
                  </div>
                  <div className="grid-item">
                    <FormControl fullWidth size="small">
                      <Autocomplete
                        autoSelect
                        size="small"
                        name="openingBalanceType"
                        options={["Credit", "Debit"]}
                        value={customer.openingBalanceType || null}
                        onChange={(e, value) =>
                          autocompleteChangeListener(
                            e,
                            value,
                            "openingBalanceType"
                          )
                        }
                        openOnFocus
                        getOptionLabel={(option) => option}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Balance type"
                            fullWidth
                          />
                        )}
                      />
                    </FormControl>
                  </div>

                  <div className="grid-item">
                    <FormControl fullWidth>
                      <TextField
                        size="small"
                        variant="outlined"
                        label="Closing balance"
                        value={customer.closingBalance}
                        onChange={inputChangeHandler}
                        onInput={validateNumber}
                        name="closingBalance"
                        id="closingBalance"
                      />
                    </FormControl>
                  </div>
                  <div className="grid-item">
                    <FormControl fullWidth size="small">
                      <Autocomplete
                        autoSelect
                        size="small"
                        name="closingBalanceType"
                        options={["Credit", "Debit"]}
                        value={customer.closingBalanceType || null}
                        onChange={(e, value) =>
                          autocompleteChangeListener(
                            e,
                            value,
                            "closingBalanceType"
                          )
                        }
                        openOnFocus
                        getOptionLabel={(option) => option}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Balance type"
                            fullWidth
                          />
                        )}
                      />
                    </FormControl>
                  </div>
                </div>
              </Paper>
            </div>
          </form>

          <div className="bl_contact_person">
            <div className="bl_form">
              <ContactPersonForm
                onContactPersonAdd={handleOnContactPersonAdd}
                editContact={editContact}
              />
            </div>
            <div className="bl_content">
              {formErrors.contactPerson.invalid && (
                <Stack
                  sx={{
                    width: "100%",
                    margin: "0 0 30px 0",
                    border: "1px solid red",
                    borderRadius: "4px",
                  }}
                  spacing={2}
                >
                  <Alert severity="error">
                    {formErrors.contactPerson.message}
                  </Alert>
                </Stack>
              )}
              <ContactPersonList
                contactPersons={contactPerson}
                handleTriggerEdit={handleTriggerEdit}
                handleTriggerDelete={handleTriggerDelete}
              />
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
              form="customerForm"
              className="ml6"
            >
              Save
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomerAdd;
