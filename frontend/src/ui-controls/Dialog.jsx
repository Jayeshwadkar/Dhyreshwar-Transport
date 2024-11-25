import React, { useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { Backdrop } from "@mui/material";

const CustomDialog = ({
  isOpen,
  onClose,
  title,
  content,
  warning,
  success,
}) => {
  const [open, setOpen] = useState(isOpen);

  const handleClose = (e) => {
    setOpen(false);
    onClose(e);
  };

  return (
    <>
      <Backdrop
        open={open}
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
      />
      <Dialog
        open={open}
        onClose={onClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle
          id="alert-dialog-title"
          // style={{ color: warning ? "#d32f2f" : "rgba(0,0,0,0.87)", backgroundColor: 'white' }}
          style={{ color: warning ? "#d32f2f" : "#05a831", backgroundColor: 'white' }}
        >
          {title}
        </DialogTitle>
        <DialogContent
          style={{ backgroundColor: 'white' }}
        >
          <DialogContentText id="alert-dialog-description">
            {content}
          </DialogContentText>
        </DialogContent>
        <DialogActions style={{ backgroundColor: 'white' }}>
          {!success ? (
            <>
              <Button autoFocus onClick={handleClose} value={false}>
                {/* Disagree */}
                No
              </Button>
              <Button
                onClick={handleClose}
                value={true}
                style={{ color: warning ? "#d32f2f" : "#274d62" }}
              >
                {/* Agree */}
                Yes
              </Button>
            </>
          ) : (
            <Button
              autoFocus
              onClick={handleClose}
              value={true}
              style={{ color: warning ? "#d32f2f" : "#274d62" }}
            >
              Ok
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CustomDialog;
