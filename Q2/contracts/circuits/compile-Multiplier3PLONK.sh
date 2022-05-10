#!/bin/bash

cd contracts/circuits

mkdir Multiplier3PLONK

if [ -f ./powersOfTau28_hez_final_10.ptau ]; then
    echo "powersOfTau28_hez_final_10.ptau already exists. Skipping."
else
    echo 'Downloading powersOfTau28_hez_final_10.ptau'
    wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_10.ptau
fi

echo "Compiling Multiplier3PLONK.circom..."

# compile circuit

circom Multiplier3.circom --r1cs --wasm --sym -o Multiplier3PLONK
snarkjs r1cs info Multiplier3PLONK/Multiplier3.r1cs

# Start a new zkey and make a contribution
#[CHANGE IN CODE]
snarkjs plonk setup Multiplier3PLONK/Multiplier3.r1cs powersOfTau28_hez_final_10.ptau Multiplier3PLONK/circuit_final.zkey

snarkjs zkey export verificationkey Multiplier3PLONK/circuit_final.zkey Multiplier3PLONK/verification_key.json

# generate solidity contract
snarkjs zkey export solidityverifier Multiplier3PLONK/circuit_final.zkey ../Multiplier3PLONKVerifier.sol

cd ../..