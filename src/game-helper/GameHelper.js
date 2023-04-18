export class GameHelper {
    static CalculateLevel(experiencePoints) {
        return Math.floor(0.1 * Math.sqrt(experiencePoints))
    }
    static CalculateXP(level) {
        return Math.floor(Math.pow((level / 0.1), 2))
    }

    static LimitXP(experiencePoints) {
        return experiencePoints > 90000 ? 90000 : experiencePoints
    }
}