import React, { useEffect, useLayoutEffect } from "react";

const dev = process.env.NODE_ENV === "development";

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
          dev ? "http://localhost:3000" : "https://davidsling.in"
        }/logoAnim.html`}
      />
    </>
  );
}
