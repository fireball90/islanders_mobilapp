import { ProgressBar } from "react-bootstrap"
import { GameHelper } from "../../game-helper/GameHelper"

import style from './ExperienceBar.module.css'

export default function ExperienceBar({ experiencePoints }) {
    const level = GameHelper.CalculateLevel(experiencePoints)
    const currentLevelExperiencePoints = GameHelper.CalculateXP(level)
    const nextLevelExperiencePoints = GameHelper.CalculateXP(level + 1)
    const experiencePointsFromCurrentLevel = experiencePoints - currentLevelExperiencePoints
    const progressPercent = experiencePointsFromCurrentLevel / (nextLevelExperiencePoints - currentLevelExperiencePoints) * 100

    return (
        <div className={style.experienceBar}>
            <img src="../images/ui/xpbar.png" alt="xp"></img>
            <div className={style.experienceContent}>
                <ProgressBar
                    now={Math.round(progressPercent)}
                    label={`${experiencePointsFromCurrentLevel} XP`}
                    variant="danger"
                    className={style.text}
                />
                <span>
                    {nextLevelExperiencePoints - experiencePoints} XP a szintlépésig
                </span>
            </div>
        </div>
    )
}