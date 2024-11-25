import React, { useState } from "react";
import { TextField, FormControl, FormHelperText, Button, InputLabel, Autocomplete } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { emailRegEx } from "../services/utils";

const initialErrorState = {
  email: {
    invalid: false,
    message: "",
  },
};

const SendEmail = ({ isOpen, setIsOpen, handleSendEmail, contentBody }) => {
  const [email, setEmail] = useState("");
  const [formErrors, setFormErrors] = useState(initialErrorState);

  const validateAndSend = () => {
    setFormErrors(initialErrorState);
    if (!email?.trim?.() || !emailRegEx.test(email)) {
      setFormErrors((currState) => {
        return {
          ...currState,
          email: {
            invalid: true,
            message: "Invalid email",
          },
        };
      });
    } else {
      handleSendEmail(email);
      setEmail("");
    }
  };

  const handleEmailClose = () => {
    setEmail("");
    setIsOpen(false);
  };

  return (
    <Dialog
    open={isOpen} 
    onClose={handleEmailClose}
    aria-labelledby="form-dialog-title"
    fullWidth={true}
    maxWidth="sm"
    sx={{
      "& .MuiDialog-paper": {
        width: "30%", // Adjust width as needed
        maxWidth: "600px",
      },
    }}
  >
    <DialogTitle id="form-dialog-title">Compose Email</DialogTitle>
    <DialogContent>
      <InputLabel htmlFor="to-input">Customer Email</InputLabel>
      <Autocomplete
  freeSolo
  //options={email}
  //getOptionLabel={(option) => option.emailid}
  //onChange={handleChange}
  //value={email.find((emailItem) => emailItem.emailid == emailForm.toEmail) || null}

  //onInputChange={handleInputChange}
  renderInput={(params) => (
    <TextField
      {...params}
      autoFocus
      margin="dense"
      placeholder="To"
      type="email"
 
      fullWidth
      size="small"
    />
   
  )}
/>
      <InputLabel htmlFor="message-input">Text</InputLabel>
      <TextField
        id="message-input"
        placeholder="Enter your message"
        multiline
        rows={4}
        fullWidth
    //    value={emailForm.message}
      //  onChange={(e) =>
        //  setEmailForm({ ...emailForm, message: e.target.value })
       // }
      />
    </DialogContent>
    <DialogActions style={{ justifyContent: "center" }}>
      <Button onClick={validateAndSend} color="error" variant="contained">
        Send
      </Button>
      <Button
       onClick={handleEmailClose}
        color="warning"
        variant="contained"
      >
        Cancel
      </Button>
    </DialogActions>
  </Dialog>



  );
};

export default SendEmail;
