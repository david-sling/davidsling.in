import { TextField } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { firestore } from "../../services/firebase";
import Alert from "../Alert";
import { analytics } from "../../services/firebase";
import contact from "../../config/contact";
import MuiPhoneNumber from "material-ui-phone-number";
import { useHistory } from "react-router-dom";

export default function Contact({ setPageNow }) {
  const { push } = useHistory();
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
    push("/contact?requested=true");
  };

  return (
    <>
      <div className="Contact">
        <div className="circle one"></div>
        <div className="circle two"></div>
        <form action="submit" onSubmit={handleSubmit}>
          <h1>Lets's get in touch!</h1>
          <TextField
            label="Name"
            required
            variant="filled"
            value={formData.name}
            onChange={({ target: { value } }) =>
              setFormData({ ...formData, name: value })
            }
          />
          <MuiPhoneNumber
            name="phone"
            required
            label="Phone Number"
            data-cy="user-phone"
            defaultCountry={"in"}
            variant="filled"
            value={formData.ph}
            onChange={(value) => setFormData({ ...formData, ph: value })}
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
          <button
            id="button"
            className={successMessage && "sent"}
            type="submit"
          >
            {successMessage ? "SENT" : "SUBMIT"}
          </button>
          <div className="details">
            {contact.map((item) => (
              <a href={item.link} target="_blank">
                <h4>{item.content}</h4>
              </a>
            ))}
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
