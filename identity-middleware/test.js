const axios = require('axios');
const config = require('./config'); // Ensure this points to your actual config file

async function verifyCredentials(cred_def_id, verifier_connection_id, cred_id) {
  try {
    const request = {
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

    const presentProofRequest = await axios.post(
      `${config.verifier_API_URL}/present-proof/send-request`,
      request
    );
    console.log(presentProofRequest.data);
    const thread_id = presentProofRequest.data.thread_id;

    // Polling function to replace sleep
    const poll = async (fn, interval, timeout) => {
      const endTime = Date.now() + timeout;
      const checkCondition = async (resolve, reject) => {
        try {
          const result = await fn();
          if (result) {
            resolve(result);
          } else if (Date.now() < endTime) {
            setTimeout(checkCondition, interval, resolve, reject);
          } else {
            reject(new Error('Timeout exceeded'));
          }
        } catch (error) {
          reject(error);
        }
      };
      return new Promise(checkCondition);
    };

    // Poll to fetch proofs
    const fetchProofs = async () => {
      const response = await axios.get(
        `${config.HOLDER_AGENT_API_URL}/present-proof/records?thread_id=${thread_id}`
      );
      return response.data.results.length > 0 ? response.data.results[0] : null;
    };

    const proofRecord = await poll(fetchProofs, 1000, 10000); // Poll every 1 second, timeout after 10 seconds
    const holder_presentation = proofRecord.presentation_exchange_id;
    console.log("fetch proof request done...........");

    const presentProofPayload = {
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

    const send_presentation = await axios.post(
      `${config.HOLDER_AGENT_API_URL}/present-proof/records/${holder_presentation}/send-presentation`,
      presentProofPayload
    );

    console.log(send_presentation.data);
    console.log("Presentation sent..........");

    // Poll to verify presentation
    const verifyPresentation = async () => {
      const response = await axios.post(
        `${config.verifier_API_URL}/present-proof/records/${presentProofRequest.data.presentation_exchange_id}/verify-presentation`
      );
      return response.data.verified;
    };

    const verified = await poll(verifyPresentation, 2000, 10000); // Poll every 2 seconds, timeout after 10 seconds

    console.log(JSON.stringify(verified));
    console.log("presentation verified...........");

    return verified;
  } catch (error) {
    console.error('Error verifying credentials:', error);
    throw new Error('Verification failed', error);
  }
}

module.exports = verifyCredentials;
