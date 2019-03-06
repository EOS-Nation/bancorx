import * as bancorx from "../";

const {CUSD, BNT} = bancorx.relays;
const minReturn = "3.17";
const destAccount = "<account>";
const version = 1;

// Single converter (BNT => CUSD)
bancorx.parseMemo([CUSD], minReturn, destAccount);
// => "1,bancorc11144 CUSD,3.17,<account>"

// Multi converter (EOS => BNT => CUSD)
bancorx.parseMemo([BNT, CUSD], minReturn, destAccount, version);
// => "1,bnt2eoscnvrt BNT bancorc11144 CUSD,3.17,<account>"
