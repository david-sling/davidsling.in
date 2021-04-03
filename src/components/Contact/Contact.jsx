import { TextField } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { firestore } from "../../services/firebase";
import Alert from "../Alert";
import { analytics } from "../../services/firebase";

export default function Contact({ setPageNow }) {
  const [formData, setFormData] = useState({
    name: "",
    ph: "",
    email: "",
    message: "",
  });
  const [successMessage, setSuccessMessage] = useState(null);

  const closeSuccessMessage = () => setSuccessMessage(null);

  useEffect(() => {
    setPageNow("CONTACT");
    analytics.logEvent("event", "page_view", {
      page_path: "/contact",
      page_title: "CONTACT",
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.ph.length < 8) return alert("Invalid phone number");
    await firestore.add("messages", formData);
    setSuccessMessage("Message sent! Thanks for showing interest.");
    setFormData({
      name: "",
      ph: "",
      email: "",
      message: "",
    });
    analytics.logEvent("event", "screen_view", {
      screen_name: "Contact info submitted",
    });
  };

  return (
    <>
      <div className="Contact">
        <div className="circle one"></div>
        <div className="circle two"></div>
        <form action="submit" onSubmit={handleSubmit}>
          <TextField
            label="Name"
            required
            variant="filled"
            value={formData.name}
            onChange={({ target: { value } }) =>
              setFormData({ ...formData, name: value })
            }
          />
          <TextField
            label="Phone Number"
            required
            type="number"
            variant="filled"
            value={formData.ph}
            onChange={({ target: { value } }) =>
              setFormData({ ...formData, ph: value })
            }
          />
          <TextField
            label="E-mail"
            required
            type="email"
            variant="filled"
            value={formData.email}
            onChange={({ target: { value } }) =>
              setFormData({ ...formData, email: value })
            }
          />
          <TextField
            label="Message"
            multiline
            rows={5}
            variant="filled"
            value={formData.message}
            onChange={({ target: { value } }) =>
              setFormData({ ...formData, message: value })
            }
          />
          <button type="submit">SUBMIT</button>
          <div className="details">
            <a href="tel:+918072539328">
              <h4>+91 80725 39328</h4>
            </a>
            <a href="mailto:sddavid.johan@gmail.com">
              <h4>sddavid.johan@gmail.com</h4>
            </a>
          </div>
        </form>
      </div>
      <Alert
        onClose={closeSuccessMessage}
        severity="success"
        open={successMessage}
      >
        {successMessage}
      </Alert>
    </>
  );
}
