import { useState } from "react";
import { ethers } from "ethers";

function App() {
  const [prompt, setPrompt] = useState("");
  const [connected, setConnected] = useState(false);

  let { ethereum } = window;
  let contract = null;

  if (ethereum) {
    let abi = JSON.parse(`[
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "requestId",
            "type": "uint256"
          },
          {
            "internalType": "bytes",
            "name": "output",
            "type": "bytes"
          },
          {
            "internalType": "bytes",
            "name": "callbackData",
            "type": "bytes"
          }
        ],
        "name": "aiOracleCallback",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "modelId",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "prompt",
            "type": "string"
          }
        ],
        "name": "calculateAIResult",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "contract IAIOracle",
            "name": "_aiOracle",
            "type": "address"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "inputs": [
          {
            "internalType": "contract IAIOracle",
            "name": "expected",
            "type": "address"
          },
          {
            "internalType": "contract IAIOracle",
            "name": "found",
            "type": "address"
          }
        ],
        "name": "UnauthorizedCallbackSource",
        "type": "error"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "requestId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "sender",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "modelId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "string",
            "name": "prompt",
            "type": "string"
          }
        ],
        "name": "promptRequest",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "requestId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "modelId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "string",
            "name": "input",
            "type": "string"
          },
          {
            "indexed": false,
            "internalType": "string",
            "name": "output",
            "type": "string"
          },
          {
            "indexed": false,
            "internalType": "bytes",
            "name": "callbackData",
            "type": "bytes"
          }
        ],
        "name": "promptsUpdated",
        "type": "event"
      },
      {
        "inputs": [],
        "name": "aiOracle",
        "outputs": [
          {
            "internalType": "contract IAIOracle",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "AIORACLE_CALLBACK_GAS_LIMIT",
        "outputs": [
          {
            "internalType": "uint64",
            "name": "",
            "type": "uint64"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "modelId",
            "type": "uint256"
          }
        ],
        "name": "estimateFee",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "modelId",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "prompt",
            "type": "string"
          }
        ],
        "name": "getAIResult",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "requestId",
            "type": "uint256"
          }
        ],
        "name": "isFinalized",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "name": "prompts",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "requests",
        "outputs": [
          {
            "internalType": "address",
            "name": "sender",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "modelId",
            "type": "uint256"
          },
          {
            "internalType": "bytes",
            "name": "input",
            "type": "bytes"
          },
          {
            "internalType": "bytes",
            "name": "output",
            "type": "bytes"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ]`);
    let contractAddress = "0x64BF816c3b90861a489A8eDf3FEA277cE1Fa0E82";
    let provider = new ethers.providers.Web3Provider(ethereum);
    let signer = provider.getSigner();
    contract = new ethers.Contract(contractAddress, abi, signer);
  }

  return (
    <div className="">
      <div className="flex justify-end mr-5 mt-5">
        <button
          className="border bg-blue-400 rounded-md p-2"
          onClick={() => {
            if (contract && !connected) {
              ethereum
                .request({ method: "eth_requestAccounts" })
                .then((accounts) => {
                  setConnected(true);
                });
            }
          }}
        >
          {!connected ? "Connect wallet" : "Connected"}
        </button>
      </div>
      <div className="mt-20 flex justify-center items-center">
        <h1 className="text-4xl">Enter the prompt:</h1>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="mt-1 ml-2 rounded-md border border-grey-900 py-2"
        />
      </div>
      <div className="mt-10 flex justify-center items-center">
        <div className="w-1/2 flex justify-center">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => {}}
          >
            Generate Llama2 output 
          </button>
          <button
            className="ml-5 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => {}}
          >
            Get Llama2 output
          </button>
        </div>
        <div className="w-1/2 flex justify-center">
        <button
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => {}}
          >
            Generate Stable Diffusion Art
          </button>
          <button
            className="ml-5 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => {}}
          >
            Get Stable Diffusion Art
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
