import React, { useEffect, useLayoutEffect } from "react";

export default function LogoAnim() {
  return (
    <>
      <iframe
        style={{
          width: "100%",
          height: "100%",
          border: "none",
        }}
        src={`${
          process.env.NODE_ENV === "development"
            ? "http://localhost:3000"
            : "https://davidsling.in"
        }/logoAnim.html`}
      />
    </>
  );
}
