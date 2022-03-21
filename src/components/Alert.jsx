import React from "react";
import MuiAlert from "@material-ui/lab/Alert";
import { Snackbar } from "@material-ui/core";

export default function Alert({ onClose, severity, children, open }) {
  return (
    <Snackbar open={open} onClose={onClose}>
      <MuiAlert
        elevation={6}
        variant="filled"
        onClose={onClose}
        severity={severity}
      >
        {children}
      </MuiAlert>
    </Snackbar>
  );
}
