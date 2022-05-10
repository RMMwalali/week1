#!/bin/bash

cd contracts/circuits

mkdir Multiplier3GROTH16

if [ -f ./powersOfTau28_hez_final_10.ptau ]; then
    echo "powersOfTau28_hez_final_10.ptau already exists. Skipping."
else
    echo 'Downloading powersOfTau28_hez_final_10.ptau'
    wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_10.ptau
fi

echo "Compiling Multiplier3GROTH16.circom..."

# compile circuit

circom Multiplier3.circom --r1cs --wasm --sym -o Multiplier3GROTH16
snarkjs r1cs info Multiplier3GROTH16/Multiplier3.r1cs

# Start a new zkey and make a contribution
#[CHANGE IN CODE]
snarkjs GROTH16 setup Multiplier3GROTH16/Multiplier3.r1cs powersOfTau28_hez_final_10.ptau Multiplier3GROTH16/circuit_final.zkey

snarkjs zkey export verificationkey Multiplier3GROTH16/circuit_final.zkey Multiplier3GROTH16/verification_key.json

# generate solidity contract
snarkjs zkey export solidityverifier Multiplier3GROTH16/circuit_final.zkey ../Multiplier3GROTH16Verifier.sol

cd ../..