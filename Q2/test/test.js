const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const { groth16,plonk } = require("snarkjs");

function unstringifyBigInts(o) {
    if ((typeof(o) == "string") && (/^[0-9]+$/.test(o) ))  {
        return BigInt(o);
    } else if ((typeof(o) == "string") && (/^0x[0-9a-fA-F]+$/.test(o) ))  {
        return BigInt(o);
    } else if (Array.isArray(o)) {
        return o.map(unstringifyBigInts);
    } else if (typeof o == "object") {
        if (o===null) return null;
        const res = {};
        const keys = Object.keys(o);
        keys.forEach( (k) => {
            res[k] = unstringifyBigInts(o[k]);
        });
        return res;
    } else {
        return o;
    }
}

describe("HelloWorld", function () {
let Verifier;
let verifier;

    beforeEach(async function () {
        Verifier = await ethers.getContractFactory("HelloWorldVerifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] Add comments to explain what each line is doing

        //creating the proof and signals(public)
        //Above process makes use of trusted setup arguements,input and compiled circuit
        const { proof, publicSignals } = await groth16.fullProve({"a":"1","b":"2"}, "contracts/circuits/HelloWorld/HelloWorld_js/HelloWorld.wasm","contracts/circuits/HelloWorld/circuit_final.zkey");

        console.log('1x2 =',publicSignals[0]);
        //publicSignals are converted from strings to BigInts
        const editedPublicSignals = unstringifyBigInts(publicSignals);
        const editedProof = unstringifyBigInts(proof);
        //creation of data
        //data then passed to smart contracts
        const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals);
        
        //verifyProof function parameters generated
    
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());
    
        const a = [argv[0], argv[1]];
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const c = [argv[6], argv[7]];
        const Input = argv.slice(8);
        //from the right proof, 
        //line expects to be true.
        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
    });
    //parameters for false proofs
    it("Should return false for invalid proof", async function () {
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});


describe("Multiplier3 with Groth16", function () {
    beforeEach(async function () {
        //[assignment] insert your script here
        Verifier = await ethers.getContractFactory("Multiplier3GROTH16Verifier")
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] insert your script here
        const {proof,publicSignals} = await groth16.fullProve(
            {a: "1",b: "2",c: "3"},
            "contracts/circuits/Multiplier3GROTH16/Multiplier3_js/Multiplier3.wasm",
            "contracts/circuits/Multiplier3GROTH16/circuit_final.zkey"
        );

        console.log("1*2*3 = ", publicSignals[1]);

        const editedPublicSignals = unstringifyBigInts(publicSignals);
        const editedProof = unstringifyBigInts(proof);
        const calldata = await groth16.exportSolidityCallData(
            editedProof,editedPublicSignals
        );

        const argv = calldata
        .replace(/["[\]\s]/g,"")
        .split(",")
        .map((x) => BigInt(x).toString());

        const a = [argv[0] ,argv[1]];
        const b = [
            [argv[2],argv[3]],
            [argv[4],argv[5]],
        ];

        const c = [argv[6], argv[7]];
        const Input = argv.slice(8);

        expect(await verifier.verifyProof(a,b,c,Input)).to.be.true;

    });
    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
        let a = [0,0];
        let b = [[0,0],[0,0]];
        let c = [0,0];
        let d = [0];

        expect(await verifier.verifyProof(a,b,c,d)).to.be.false;

    });
});


describe("Multiplier3 with PLONK", function () {

    beforeEach(async function () {
        //[assignment] insert your script here

        Verifier = await ethers.getContractFactory("PlonkVerifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();        

    });

    it("Should return true for correct proof", async function () {
        //[assignment] insert your script here
        const {proof,publicSignals} = await plonk.fullProve(
            {a: "3",b: "4",c: "5"},
            "contracts/circuits/Multiplier3PLONK/Multiplier3_js/Multiplier3.wasm",
            "contracts/circuits/Multiplier3PLONK/circuit_final.zkey"
        );

        console.log("3*4*5 = ", publicSignals[1]);
        const editedPublicSignals = unstringifyBigInts(publicSignals);
        const editedProof = unstringifyBigInts(proof);
        const calldata = await plonk.exportSolidityCallData(
            editedProof,editedPublicSignals
        );
        const [Proofs,PubS] = calldata.split(",");
        const argv = PubS
        .replace(/["[\]\s]/g,"")
        .split(",")
        .map((x) => BigInt(x).toString());
        //code to verify the contract
        expect(await verifier.verifyProof(Proofs, argv)).to.be.true;

    });
    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
        expect(await verifier.verifyProof(0,0)).to.be.false;
    });
});