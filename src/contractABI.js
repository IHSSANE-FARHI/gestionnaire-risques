export const contractABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_portefeuille",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_montant",
                "type": "uint256"
            }
        ],
        "name": "ajouterCollateral",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_portefeuille",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_scoreCredit",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_limiteExposition",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_collateral",
                "type": "uint256"
            }
        ],
        "name": "ajouterContrepartie",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_portefeuille",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_montant",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "_typePosition",
                "type": "string"
            }
        ],
        "name": "ajouterPosition",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_nouveauRatio",
                "type": "uint256"
            }
        ],
        "name": "modifierRatioDeCouverture",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "portefeuille",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "limiteExposition",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "collateral",
                "type": "uint256"
            }
        ],
        "name": "ContrepartieAjoutee",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "portefeuille",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "expositionCourante",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "limiteExposition",
                "type": "uint256"
            }
        ],
        "name": "LimiteDepassee",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "portefeuille",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "montantPenalite",
                "type": "uint256"
            }
        ],
        "name": "PenaliteAppliquee",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "portefeuille",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "montant",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "typePosition",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "collateralExige",
                "type": "uint256"
            }
        ],
        "name": "PositionAjoutee",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "portefeuille",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "ratioCouverture",
                "type": "uint256"
            }
        ],
        "name": "RatioCouvertureInsuffisant",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "admin",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_portefeuille",
                "type": "address"
            }
        ],
        "name": "calculerExpositionNette",
        "outputs": [
            {
                "internalType": "int256",
                "name": "",
                "type": "int256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_portefeuille",
                "type": "address"
            }
        ],
        "name": "calculerRatioCouverture",
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
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "contreparties",
        "outputs": [
            {
                "internalType": "address",
                "name": "portefeuille",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "scoreCredit",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "limiteExposition",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "expositionCourante",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "collateral",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "estActif",
                "type": "bool"
            },
            {
                "internalType": "uint256",
                "name": "penalites",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getListeContreparties",
        "outputs": [
            {
                "internalType": "address[]",
                "name": "",
                "type": "address[]"
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
        "name": "listeContreparties",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "ratioDeCouverture",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];
export const contractAddress = "0xc77f311ccdde695b736701e80eb647d70f98b1bc";
