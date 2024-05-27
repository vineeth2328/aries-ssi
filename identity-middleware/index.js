const express = require("express");
var axios = require("axios");
var randomstring = require("randomstring");
var app = express();
const config = require("./config");
let connectionOBj = new Object();
const fs = require("fs");
const bodyParser = require('body-parser');
app.listen(3000, async () => {
 
    console.log("Listening on port 3000...");

});


app.use(bodyParser.urlencoded({ extended: true }))

// parse requests of content-type - application/json
app.use(bodyParser.json())

app.get("/configure", async (req, res) => {
  try {
    let response = {};
    let connection = await createConnection();
    let schema = await createCredentialDefinitionSchema();

    console.log(schema);

    if (connection && schema) {
      console.log(JSON.stringify(connectionOBj));
      response = { status: 200, data: connectionOBj };
      await writeFile("config.json", JSON.stringify(connectionOBj));
      res.status(200).send(response);
    } else {
      response = { status: 500, data: "internal server error" };
      res.status(500).send(response);
    }
  } catch (e) {
    let response = { status: 500, data: "configuration failed" };
    res.status(500).send(response);
  }
});



app.post("/issue-credential", async (req, res) => {
  try {
    let response = {};
    var issuer_connection_id = req.body.issuer_connection_id;
    var cred_def_id = req.body.cred_def_id
  
       var  attributes= [
        {
          name: "id",
          value: req.body.id,

        },
        {
          name: "name",
          value: req.body.name,

        },
        {
          name: "dob",
          value: req.body.dob,

        },
        {
          name: "aadhar",
          value: req.body.aadhar,

        }
      ]
console.log(attributes)
    let credential = await issueCredentials(
      issuer_connection_id,
      cred_def_id,
      attributes
    );
    res.status(200).json({
      message: "Credential generation success",
      credential:
        credential.credential_proposal_dict.credential_proposal.attributes[0]
          .value,
    });
  } catch (e) {
    res.status(500).json({ message: "credential generation failed" });
  }
});

app.get("/verify-credential", async (req, res) => {
  try {
    console.log("3333")
    var verifier_connection_id = req.query.verifier_connection_id;
    var cred_def_id = req.query.cred_def_id;
    let cred_id = await getCredentialByID(req.query.credential);
    console.log(cred_id)
    
console.log(cred_def_id,"22222")
    let connection = await verifyCredentials(
      cred_def_id,
      verifier_connection_id,
      cred_id
    );

    
    res.status(200).json({
      message: "crdential verification success",
      isVerfied: connection.verified,
    });
  } catch (e) {
    console.log(e);
    let response = { data: e };
    res.status(500).json({ message: "invaild credentials" });
  }
});

app.post('/issuer-holder-connection',async (req,res)=>{

  var holderAgentUrl  = req.body.holderAgentUrl;
  var issuerAgentUrl  = req.body.issuerAgentUrl;

     var a = "http://"+ holderAgentUrl+ "/connections/receive-invitation";
     var b = "http://"+issuerAgentUrl+"/connections/create-invitation"
     
    try {
      var createConnectionResponse = await axios.post(
        b,
        {}
      );
      var issuer_connection_id = createConnectionResponse.data.connection_id;
   
      var receiveInvitationRespone = await axios.post(
        a,
        {
          "@id": createConnectionResponse.data.invitation["@id"],
          label: createConnectionResponse.data.invitation.label,
          serviceEndpoint:
            createConnectionResponse.data.invitation.serviceEndpoint,
          recipientKeys: createConnectionResponse.data.invitation.recipientKeys,
        }
      );
   
    var holder_connection_id = receiveInvitationRespone.data.connection_id
      //=====
      var result = {
        issuer_connection_id: issuer_connection_id,
        holder_connection_id: holder_connection_id
      }

      res.json(result)
    } catch (e) {
      console.log(e);
      res.send("error",e);
    }
  

})

app.post('/verfier-holder-connection',async (req,res)=>{

  var holderAgentUrl  = req.body.holderAgentUrl;
  var verifierAgentUrl  = req.body.verifierAgentUrl;

     var a = "http://"+ holderAgentUrl+ "/connections/receive-invitation";
     var b = "http://"+verifierAgentUrl+"/connections/create-invitation"
     
    try {
      var createConnectionResponse = await axios.post(
        b,
        {}
      );
      var verifier_connection_id = createConnectionResponse.data.connection_id;
   
      var receiveInvitationRespone = await axios.post(
        a,
        {
          "@id": createConnectionResponse.data.invitation["@id"],
          label: createConnectionResponse.data.invitation.label,
          serviceEndpoint:
            createConnectionResponse.data.invitation.serviceEndpoint,
          recipientKeys: createConnectionResponse.data.invitation.recipientKeys,
        }
      );
   
    var holder_connection_id = receiveInvitationRespone.data.connection_id
      //=====
      var result = {
        verifier_connection_id: verifier_connection_id,
        holder_connection_id: holder_connection_id
      }

      res.json(result)
    } catch (e) {
      console.log(e);
      res.send("error",e);
    }
  

})

app.post('/credential-definition-Schema',async(req,res)=>{
  try {
    
    var a = "http://"+ req.body.IssuerAgentUrl+ "/schemas";
    var b = "http://"+ req.body.IssuerAgentUrl+ "/credential-definitions";
    console.log(req.body.attributes)
var error;
    try {
      
   
    var createSchema = await axios.post(
      a,
      {
        attributes: ["id","name","dob","aadhar"],
        schema_name: req.body.schema_name,
        schema_version: req.body.schema_version,
      }
    );
  } catch (err) {
    error = err
  }
    var createCredentialDefiniton = await axios.post(
      b,
      {
        schema_id: createSchema.data.schema_id,
        support_revocation: false,
        tag: "default",
      }
    );
    // connectionOBj["cred_def_id"] =
    //   createCredentialDefiniton.data.credential_definition_id;
    res.json({cred_def_id: createCredentialDefiniton.data.credential_definition_id})
  } catch (e) {
    console.log("error", error);
    res.send(error.response.data)
  }

})

async function createConnection() {
  try {
    var createConnectionResponse = await axios.post(
      config.ISSUER_AGENT_API_URL + "/connections/create-invitation",
      {}
    );

    connectionOBj["issuer_connection_id"] =
      createConnectionResponse.data.connection_id;
//========
      var createConnectionResponse1 = await axios.post(
        config.verifier_API_URL + "/connections/create-invitation",
        {}
      );
  
      connectionOBj["verifier_connection_id"] =
        createConnectionResponse1.data.connection_id;

    var receiveInvitationRespone = await axios.post(
      config.HOLDER_AGENT_API_URL + "/connections/receive-invitation",
      {
        "@id": createConnectionResponse.data.invitation["@id"],
        label: createConnectionResponse.data.invitation.label,
        serviceEndpoint:
          createConnectionResponse.data.invitation.serviceEndpoint,
        recipientKeys: createConnectionResponse.data.invitation.recipientKeys,
      }
    );
    connectionOBj["holder_connection_id"] =
      receiveInvitationRespone.data.connection_id;

    //=====
    var receiveInvitationRespone1 = await axios.post(
      config.HOLDER_AGENT_API_URL + "/connections/receive-invitation",
      {
        "@id": createConnectionResponse1.data.invitation["@id"],
        label: createConnectionResponse1.data.invitation.label,
        serviceEndpoint:
          createConnectionResponse1.data.invitation.serviceEndpoint,
        recipientKeys: createConnectionResponse1.data.invitation.recipientKeys,
      }
    );
    connectionOBj["holder2_connection_id"] =
      receiveInvitationRespone1.data.connection_id;  

    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
}


async function createCredentialDefinitionSchema() {
  try {
    let schema_name = "generalschema-" + randomstring.generate(3);
    var createSchema = await axios.post(
      config.ISSUER_AGENT_API_URL + "/schemas",
      {
        attributes: ["id","name","dob","aadhar"],
        schema_name: schema_name,
        schema_version: "1.0",
      }
    );

    var createCredentialDefiniton = await axios.post(
      config.ISSUER_AGENT_API_URL + "/credential-definitions",
      {
        schema_id: createSchema.data.schema_id,
        support_revocation: false,
        tag: "default",
      }
    );
    connectionOBj["cred_def_id"] =
      createCredentialDefiniton.data.credential_definition_id;
    return true;
  } catch (e) {
    console.log("error", e);
    return false;
  }
}

async function issueCredentials(connection_id, cred_def_id, attributes) {
  let payload = {
    connection_id: connection_id,
    cred_def_id: cred_def_id,
    credential_proposal: {
      "@type": "issue-credential/1.0/offer-credential",
      
      // attributes: [
      //   {
      //     name: "id",
      //     value: "id_00" + randomstring.generate(5),

      //   },
      //   {
      //     name: "name",
      //     value: "id_00" + randomstring.generate(5),

      //   },
      //   {
      //     name: "dob",
      //     value: "id_00" + randomstring.generate(5),

      //   },
      //   {
      //     name: "aadhar",
      //     value: "id_00" + randomstring.generate(5),

      //   }
      // ],
      attributes
    },
    schema_version: "1.0",
    trace: true,
  };

  try {
    var issueCredentials = await axios.post(
      config.ISSUER_AGENT_API_URL + "/issue-credential/send",
      payload
    );
    console.log(JSON.stringify(issueCredentials.data));
   console.log("222222222222",issueCredentials);
    return issueCredentials.data;
  } catch (e) {
    console.log(e);
  }
}

async function verifyCredentials(

  cred_def_id,
  verifier_connection_id,
  cred_id
) {
  try {
    let request = {
      connection_id: verifier_connection_id,
      proof_request: {
        name: "Proof of vc",
        version: "1.0",
        requested_attributes: {
          id: {
            name: "id",
            restrictions: [
              {
                cred_def_id: cred_def_id,
              },
            ],
          },
        },
        requested_predicates: {},
      },
    };
    var presentProofRequest = await axios.post(
      // verfierurl 
      config.verifier_API_URL + "/present-proof/send-request",
      request
    );
    console.log(presentProofRequest.data);
    let thread_id = presentProofRequest.data.thread_id;
    await sleep(1000);
    console.log("present proof request done...........");
    try {
      var fetch_profs = await axios.get(
        config.HOLDER_AGENT_API_URL +
          "/present-proof/records?thread_id=" +
          thread_id
      );
    } catch (e) {
      console.log(e);
    }

    let holder_presentation =
      fetch_profs.data.results[0].presentation_exchange_id;
    console.log("fetch proof request done...........");
    let presentProofPayload = {
      auto_remove: true,
      requested_attributes: {
        id: {
          cred_id: cred_id,
          revealed: true,
        },
      },
      requested_predicates: {},
      self_attested_attributes: {},
      trace: false,
    };
    await sleep(1000);
    // holder url 
    let send_presentation = await axios.post(

      config.HOLDER_AGENT_API_URL +
        `/present-proof/records/${holder_presentation}/send-presentation`,
      presentProofPayload
    );

    console.log(send_presentation.data);
    console.log("Presentation sent..........");

    //present-oof/records/44ff6e3b-487b-417d-945b-f264f08a5980/verify-presentation

    console.log(
      "exchange id........." + presentProofRequest.data.presentation_exchange_id
    );
    await sleep(2000);
    let verify_presentation = await axios.post(
      config.verifier_API_URL +
        `/present-proof/records/${presentProofRequest.data.presentation_exchange_id}/verify-presentation`
    );

    console.log(JSON.stringify(verify_presentation.data));

    console.log("presentation verfied...........");

    return verify_presentation.data;
  } catch (e) {
    console.log(e);
    throw new Error("Verrfication failed ", e);
  }
}

async function getCredentialByID(id) {
  try {
    var request = {
      params: { wql: `{"attr::id::value": "${id}"}` },
    };

    let cred_id = await axios.get(
      config.HOLDER_AGENT_API_URL + `/credentials`,
      request
    );
    console.log(cred_id.data.results[0].referent)
    return cred_id.data.results[0].referent;
   
  } catch (e) {
    throw new Error("Invalid Credentials");
  }
}

async function readFile(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, "utf8", function (err, data) {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
}
async function writeFile(path, data) {
  return new Promise(function (resolve, reject) {
    fs.writeFile(path, data, "utf8", function (err) {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

function sleep(ms) {
  console.log("sleep............");
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}