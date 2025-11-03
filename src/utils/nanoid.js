export function nanoid() {
    return Math.random().toString(52).substring(2, 9)
}