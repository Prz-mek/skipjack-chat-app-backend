import crypto from "crypto";
import fs from "fs";

function generateKeyPair() {
    const keyPair = crypto.generateKeyPairSync("rsa", {
        modulusLength: 4096,
        publicKeyEncoding: {
            type: "pkcs1",
            format: "pem"
        },
        privateKeyEncoding: {
            type: "pkcs1",
            format: "pem"
        }
    });

    fs.writeFileSync(__dirname + "rsa_pub.pem", keyPair.publicKey);
    fs.writeFileSync(__dirname + "rsa_priv.pem", keyPair.privateKey);
}

generateKeyPair();