export default class Guard {
    constructor(condition, redirect) {
        this.condition = condition
        this.redirect = redirect
    }
}