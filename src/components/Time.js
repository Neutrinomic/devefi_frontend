import moment from "moment";


export function Time({ time }) {
    let texttime = moment(time * 1000).format("MMM Do 'YY, HH:mm:ss");

    return texttime
}