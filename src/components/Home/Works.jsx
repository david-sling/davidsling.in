import React from "react";

import WorkCard from "./WorkCard";

import works from "../../config/works";

export default function Works() {
  return (
    <div className="Works" id="work">
      <div className="curver">
        <div className="curve"></div>
      </div>
      <div className="subHead">
        <h3>MY WORK</h3>
        <div className="underline"></div>
      </div>
      <div className="workList">
        {works.map((work, i = 0) => (
          <WorkCard work={work} key={work.title} />
        ))}
      </div>
    </div>
  );
}
