import React from "react";
import Loader from "react-loader-spinner";

export default function Loading() {
  return (
    <div className="Loader">
      <Loader type="ThreeDots" color="#fff" height={80} width={80} />
    </div>
  );
}
