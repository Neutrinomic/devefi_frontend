import { Box } from "@chakra-ui/react";
import {useEffect, useRef} from "react";


export function ForOne() {
    return <Box className="amount" as="span">1.0</Box>
};

export function AmountFixed({val}) {
    let shortAmount = numberFormat(val);
    return <Box className="amount" as="span">{shortAmount}</Box>
}

export function Amount({val, muted=false}) {

    const prevN = usePreviousValue(val);
    let hl = {
        key: val,
        className: "amount " + (val > prevN ? ('hl-up' + (muted?"-muted":"")) : val < prevN ? ('hl-down' +(muted?"-muted":"")): ''),
      };

    let shortAmount = numberFormat(val);
    return <Box  as="span" {...hl}>{shortAmount}</Box>
}

export function numberFormat(am) {

    let amount = Number(am)

    if (amount == 0) return amount.toFixed(2);

    // if number is > 1 show 4 decimals
    if (amount >= 1) return (amount).toFixed(4); // if number is < 0 show 2 decimals

    // show 4 decimals after the last non-zero digit
    let str = amount.toFixed(16);

    // find the position of the non zero digit 123456789
    let pos = str.search(/[^0\.\,]/);

    // if pos is > 10 show math notation
    if (pos > 10) return amount.toExponential(2); // if pos is < 0 show 2 decimals

    // show only 4 decimals after that
    return (amount).toFixed(pos + 2);
}


const usePreviousValue = value => {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  };

// a function that replaces all 0 with nothing at the end of a string unless there is a . in front of it
export function trimZeroes(str) {
    return str.replace(/(\d)0*$/g, "$1")
}



export function Symbol({ children }) {
    return <Box as="span" className="tsymbol">{children}</Box>
}