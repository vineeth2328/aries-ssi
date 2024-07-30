first create did from indy network 
/ register api 
req.body

{
    "did": "did:sov:LnXR1rPnncTPZvRdmJKhJQ",
    "seed": "000000000000000000000000Trustee2",
    "role": "TRUST_ANCHOR"

  }

than register did in aries acapy /wallet/create/did endpoint 

{
  "method": "sov",
  "options": {
    "did": "did:sov:LnXR1rPnncTPZvRdmJKhJQ",
    "key_type": "ed25519"
  },
  "seed": "000000000000000000000000Trustee2"
}

than aries aca-py /vc/credential/isue end point
req.body 

{
    "credential": {
        "@context": [
            "https://www.w3.org/2018/credentials/v1",
            "https://w3id.org/citizenship/v1",
            "https://w3id.org/security/bbs/v1",
            {
                "firstname": "https://schema.org/givenName",
                "lastname": "https://schema.org/familyName",
                "age": "https://schema.org/age"
            }
        ],
        // "credentialStatus": {
        //     "id": "https://example.com/credentials/status/3#94567",
        //     "statusListCredential": "https://example.com/credentials/status/3",
        //     "statusListIndex": "94567",
        //     "statusPurpose": "revocation",
        //     "type": "BitstringStatusListEntry"
        // },
        "credentialSubject": {
            "firstname": "dhoni",
            "lastname": "Kashyap",
            "age": "20"
            // "type": [
            //   "PermanentResident",
            //   "Person"
            // ]
        },
        "expirationDate": "2010-01-01T19:23:24Z",
        "id": "http://example.edu/credentials/1872",
        "issuanceDate": "2010-01-01T19:23:24Z",
        "issuer": "did:sov:LnXR1rPnncTPZvRdmJKhJQ",
        "type": [
            "VerifiableCredential",
            "AlumniCredential"
        ]
    }
    // "options": {
    //     "challenge": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    //     "created": "2021-12-31T23:59:59Z",
    //     "credentialStatus": {
    //         "type": "CredentialStatusList2017"
    //     }
    // }
}


for verify copy above api response 

sample verify 

{

 "verifiableCredential": {
        "@context": [
            "https://www.w3.org/2018/credentials/v1",
            "https://w3id.org/citizenship/v1",
            "https://w3id.org/security/bbs/v1",
            {
                "firstname": "https://schema.org/givenName",
                "lastname": "https://schema.org/familyName",
                "age": "https://schema.org/age"
            },
            "https://w3id.org/security/suites/ed25519-2020/v1"
        ],
        "id": "http://example.edu/credentials/1872",
        "type": [
            "VerifiableCredential",
            "AlumniCredential"
        ],
        "issuer": "did:sov:LnXR1rPnncTPZvRdmJKhJQ",
        "issuanceDate": "2010-01-01T19:23:24Z",
        "expirationDate": "2010-01-01T19:23:24Z",
        "credentialSubject": {
            "firstname": "dhoni",
            "lastname": "Kashyap",
            "age": "20"
        },
        "proof": {
            "type": "Ed25519Signature2020",
            "proofPurpose": "assertionMethod",
            "verificationMethod": "did:sov:LnXR1rPnncTPZvRdmJKhJQ#key-1",
            "created": "2024-07-30T17:41:01+00:00",
            "proofValue": "z2uq9JJfrJJKHXFk4oFZpDwVsZgardC4H1KaunvvZ5GV464q461NwVk4a229D1oo5W8QHqSR3Du1jexKT8cXzaQce"
        }
    }
}



