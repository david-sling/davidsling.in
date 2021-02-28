import React from 'react'

import SkillCard from './SkillCard'

import skills from '../../config/skills'

export default function Skills() {

    

    return (
        <section className="Skills" id="skills" >
            <div className="absoluteBG"></div>
            <div className="greyDivider"></div>
            <div className="subHead">
                <h3>MY SKILLS</h3>
                <div className="underline"></div>
                
            </div>
            <div className="skillsList">
                    {skills.map( skill => (
                        <SkillCard skill={skill} key={skill.title} />
                    ) )}
                </div>

        </section>
    )
}
