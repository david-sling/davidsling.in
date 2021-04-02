import React from "react";

import { Link } from "react-router-dom";

export default function WorkCard({ work }) {
  return (
    <a href={work.link} target="_blank">
      <div className="WorkCard">
        <div className="image">
          <img src={work.image} alt={work.title + "-davidsling"} />
        </div>
        <div className="content">
          <h5 className="subtitle"> {work.subHead} </h5>
          <h4 className="title">{work.title}</h4>
          <p className="description">{work.description}</p>
        </div>
      </div>
    </a>
  );
}
