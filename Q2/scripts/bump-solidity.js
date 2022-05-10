const fs = require("fs");
const solidityRegex = /pragma solidity \^\d+\.\d+\.\d+/;

const verifierRegex = /contract Verifier/;
const contractsVerifiers = [
    "Multiplier3GROTH16Verifier","Multiplier3PLONKVerifier","HelloWorldVerifier"
];
contractsVerifiers.forEach((verifier) => {
    let Path = `./contracts/${verifier}.sol`;
    let content = fs.readFileSync(Path, { encoding: 'utf-8' });
    let bumped = content.replace(solidityRegex, 'pragma solidity ^0.8.0');
    bumped = bumped.replace(verifierRegex, "contract " + verifier.replace("-","_"));

    fs.writeFileSync(Path, bumped);
});
// [assignment] add your own scripts below to modify the other verifier contracts you will build during the assignment