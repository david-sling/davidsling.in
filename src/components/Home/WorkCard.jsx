import React, { useState } from "react";
import Loading from "../Loading";
import ReactVisibilitySensor from "react-visibility-sensor";

export default function WorkCard({ work }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  return (
    <a href={work.link} target="_blank">
      <div className="WorkCard">
        <ReactVisibilitySensor
          onChange={(isVisible) => {
            if (isVisible) {
              setImageLoaded(true);
              // console.log(result.name)
            }
          }}
        >
          <div className="image">
            {imageLoaded ? (
              <img src={work.image} alt={work.title + "-davidsling"} />
            ) : (
              <Loading />
            )}
          </div>
        </ReactVisibilitySensor>
        <div className="content">
          <h5 className="subtitle"> {work.subHead} </h5>
          <h4 className="title">{work.title}</h4>
          <p className="description">{work.description}</p>
        </div>
      </div>
    </a>
  );
}
