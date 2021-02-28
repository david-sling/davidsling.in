import React from 'react'

export default function SkillCard({skill}) {
    return (
        <div className="SkillCard" >
            {/* <div className="border"></div> */}
            <div className="image">
                <img src= {skill.image}  alt=""/>
            </div>
            <h4>{skill.title}</h4>
            <ul className="skills">
                {skill.skills.map(skill=>(
                    <li key={skill}> {skill} </li>
                ))}
            </ul>
        </div>
    )
}
