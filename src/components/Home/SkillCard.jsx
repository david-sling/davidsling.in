import React from "react";

export default function SkillCard({ skill }) {
  return (
    <div className={["SkillCard", skill.title].join(" ")}>
      <div className="image">
        <img src={skill.image} alt={skill.title} />
      </div>
      <h4>{skill.title}</h4>
      <ul className="skills">
        {skill.skills.map((skill) => (
          <li key={skill}> {skill} </li>
        ))}
      </ul>
    </div>
  );
}
