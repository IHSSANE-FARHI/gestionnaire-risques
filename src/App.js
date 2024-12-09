// App.js
import React, { useState, useEffect } from "react";
import { BrowserProvider, Contract, ethers } from "ethers"; // Import correct pour ethers.js v6
import { contractABI, contractAddress } from "./contractABI";
import bigInt from "big-integer";
import './App.css'; // Import du CSS

function App() {
  const [walletAddress, setWalletAddress] = useState("");
  const [adminAddress, setAdminAddress] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [ratioDeCouverture, setRatioDeCouverture] = useState("");
  const [allContreparties, setAllContreparties] = useState([]); // Pour les administrateurs
  const [userContreparties, setUserContreparties] = useState([]); // Pour les utilisateurs
  const [selectedContrepartie, setSelectedContrepartie] = useState(null);
  const [selectedContrepartieDetails, setSelectedContrepartieDetails] = useState(null);
  const [newContrepartie, setNewContrepartie] = useState({
    portefeuille: "",
    scoreCredit: "",
    limiteExposition: "",
    collateral: ""
  });
  const [newPosition, setNewPosition] = useState({
    portefeuille: "",
    montant: "",
    typePosition: "LONG"
  });
  const [nouveauRatio, setNouveauRatio] = useState("");
  const [contract, setContract] = useState(null);

  // Fonction pour connecter MetaMask
  async function connectWallet() {
    if (window.ethereum) {
      try {
        const provider = new BrowserProvider(window.ethereum); // Utilisation de BrowserProvider pour v6
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setWalletAddress(address);

        const contractInstance = new Contract(contractAddress, contractABI, signer);
        setContract(contractInstance);
      } catch (error) {
        console.error("Erreur de connexion:", error);
        alert("Erreur lors de la connexion à MetaMask.");
      }
    } else {
      alert("Veuillez installer MetaMask.");
    }
  }

  useEffect(() => {
    if (contract) {
      loadAdminAndRatio();
      loadContreparties();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract, isAdmin, walletAddress]);

  // Charger l'adresse admin et le ratio de couverture
  async function loadAdminAndRatio() {
    try {
      const admin = await contract.admin();
      setAdminAddress(admin);
      setIsAdmin(admin.toLowerCase() === walletAddress.toLowerCase());

      const ratio = await contract.ratioDeCouverture();
      setRatioDeCouverture(ratio.toString());
    } catch (error) {
      console.error("Erreur chargement admin et ratio:", error);
      alert("Erreur lors du chargement des informations administrateur.");
    }
  }

  // Charger les contreparties en fonction du rôle
  async function loadContreparties() {
    try {
      if (isAdmin) {
        // Si admin, charger toutes les contreparties actives
        const liste = await contract.getListeContreparties();
        const data = [];
        for (let addr of liste) {
          const c = await contract.contreparties(addr);
          data.push({
            portefeuille: c.portefeuille,
            scoreCredit: c.scoreCredit.toString(),
            limiteExposition: c.limiteExposition.toString(),
            expositionCourante: c.expositionCourante.toString(),
            collateral: c.collateral.toString(),
            estActif: c.estActif,
            penalites: c.penalites.toString(),
          });
        }
        setAllContreparties(data);
      } else if (walletAddress) {
        // Si utilisateur, charger uniquement sa propre contrepartie
        const c = await contract.contreparties(walletAddress);
        if (c.estActif) {
          setUserContreparties([{
            portefeuille: c.portefeuille,
            scoreCredit: c.scoreCredit.toString(),
            limiteExposition: c.limiteExposition.toString(),
            expositionCourante: c.expositionCourante.toString(),
            collateral: c.collateral.toString(),
            estActif: c.estActif,
            penalites: c.penalites.toString(),
          }]);
        } else {
          setUserContreparties([]);
        }
      }
    } catch (error) {
      console.error("Erreur chargement contreparties:", error);
      alert("Impossible de charger les contreparties.");
    }
  }

  // Ajouter une contrepartie
  async function addContrepartie(portefeuille, scoreCredit, limiteExposition, collateral) {
    console.log("addContrepartie appelée avec :", { portefeuille, scoreCredit, limiteExposition, collateral });
    if (!contract) {
      alert("Le contrat n'est pas chargé.");
      return;
    }
    try {
      const gasEstimate = await contract.ajouterContrepartie.estimateGas(portefeuille, scoreCredit, limiteExposition, collateral);
      console.log("Gas Estimate:", gasEstimate.toString());
      const tx = await contract.ajouterContrepartie(portefeuille, scoreCredit, limiteExposition, collateral, {
        gasLimit: gasEstimate * 2, // Remplacé .mul(2) par * 2
      });
      console.log("Transaction envoyée :", tx.hash);
      await tx.wait();
      console.log("Transaction confirmée.");
      alert("Contrepartie ajoutée avec succès !");
      await loadContreparties();
      setNewContrepartie({ portefeuille: "", scoreCredit: "", limiteExposition: "", collateral: "" });
    } catch (error) {
      console.error("Erreur ajout contrepartie:", error);
      if (error.data && error.data.message) {
        alert(`Erreur: ${error.data.message}`);
      } else if (error.reason) {
        alert(`Erreur: ${error.reason}`);
      } else {
        alert("Impossible d'ajouter cette contrepartie.");
      }
    }
  }

  // Ajouter une position
  async function addPosition(portefeuille, montant, typePosition) {
    console.log("addPosition appelée avec :", { portefeuille, montant, typePosition });
  
    if (!contract) {
      alert("Le contrat n'est pas chargé.");
      return;
    }
  
    try {
      // Convertir le montant en BigNumber via ethers.js
      const montantBigNumber = ethers.parseUnits(montant.toString(), 0); // 0 signifie aucune décimale
  
      // Estimer le gas
      const gasEstimate = await contract.ajouterPosition.estimateGas(portefeuille, montantBigNumber, typePosition);
      console.log("Gas Estimate:", gasEstimate.toString());
  
      // Passer le montantBigNumber dans la transaction
      const tx = await contract.ajouterPosition(portefeuille, montantBigNumber, typePosition, {
        gasLimit: gasEstimate * 2n, // Correction ici : multiplier directement par 2n pour BigInt
      });
  
      console.log("Transaction envoyée :", tx.hash);
      await tx.wait();
      console.log("Transaction confirmée.");
      alert("Position ajoutée avec succès !");
      
      if (selectedContrepartie === portefeuille) {
        loadContrepartieDetails(portefeuille);
      }
      loadContreparties();
      setNewPosition({ portefeuille: "", montant: "", typePosition: "LONG" });
    } catch (error) {
      console.error("Erreur ajout position:", error);
      if (error.data && error.data.message) {
        alert(`Erreur: ${error.data.message}`);
      } else if (error.reason) {
        alert(`Erreur: ${error.reason}`);
      } else {
        alert("Impossible d'ajouter cette position.");
      }
    }
  }
  
  
  
  
  // Mettre à jour le ratio de couverture
  async function updateRatioFun() {
    console.log("updateRatioFun appelée avec :", nouveauRatio);
    if (!contract) {
      alert("Le contrat n'est pas chargé.");
      return;
    }
    const val = Number(nouveauRatio);
    if (val <= 100) {
      alert("Le ratio doit être >100");
      return;
    }
    try {
      const gasEstimate = await contract.modifierRatioDeCouverture.estimateGas(val);
      console.log("Gas Estimate:", gasEstimate.toString());
      const tx = await contract.modifierRatioDeCouverture(val, {
        gasLimit: gasEstimate * 2, // Remplacé .mul(2) par * 2
      });
      console.log("Transaction envoyée :", tx.hash);
      await tx.wait();
      console.log("Transaction confirmée.");
      alert("Ratio de couverture modifié avec succès !");
      setNouveauRatio("");
      loadAdminAndRatio();
    } catch (error) {
      console.error("Erreur modification ratio:", error);
      if (error.data && error.data.message) {
        alert(`Erreur: ${error.data.message}`);
      } else if (error.reason) {
        alert(`Erreur: ${error.reason}`);
      } else {
        alert("Impossible de modifier le ratio.");
      }
    }
  }

  // Charger les détails d'une contrepartie
  async function loadContrepartieDetails(addr) {
    console.log("loadContrepartieDetails appelée avec :", addr);
    if (!contract) {
      alert("Le contrat n'est pas chargé.");
      return;
    }
    try {
      const c = await contract.contreparties(addr);
      let ratioCouverture = "";
      let expositionNette = "";
      if (c.expositionCourante > 0) {
        ratioCouverture = (await contract.calculerRatioCouverture(addr)).toString();
      }
      expositionNette = (await contract.calculerExpositionNette(addr)).toString();

      setSelectedContrepartieDetails({
        portefeuille: addr,
        scoreCredit: c.scoreCredit.toString(),
        limiteExposition: c.limiteExposition.toString(),
        expositionCourante: c.expositionCourante.toString(),
        collateral: c.collateral.toString(),
        estActif: c.estActif,
        penalites: c.penalites.toString(),
        ratioCouverture,
        expositionNette
      });
    } catch (error) {
      console.error("Erreur chargement détails contrepartie:", error);
      alert("Impossible de charger les détails de la contrepartie.");
    }
  }

  return (
    <div className="container"> {/* Ajout de la classe container */}
      <h1>Gestionnaire de Risques Financiers</h1>
      {!walletAddress ? (
        <button type="button" onClick={connectWallet}>Connecter MetaMask</button>
      ) : (
        <p>Connecté : {walletAddress}</p>
      )}

      {adminAddress && <p>Admin du contrat : {adminAddress}</p>}
      {ratioDeCouverture && <p>Ratio de couverture global : {ratioDeCouverture}%</p>}

      {/* Section Administrateur */}
      {isAdmin && (
        <div className="admin-section">
          <h2>Espace Administrateur</h2>

          {/* Modifier le Ratio de Couverture */}
          <div className="form-group">
            <h3>Modifier le Ratio de Couverture</h3>
            <label htmlFor="nouveauRatio">Nouveau ratio ({">"}100):</label>
            <input
              id="nouveauRatio"
              type="number"
              value={nouveauRatio}
              onChange={(e) => setNouveauRatio(e.target.value)}
              min="101"
              required
            />
            <button type="button" onClick={updateRatioFun}>Mettre à jour</button>
          </div>

          {/* Ajouter une Contrepartie */}
          <h3>Ajouter une Contrepartie</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const { portefeuille, scoreCredit, limiteExposition, collateral } = newContrepartie;
              if (!portefeuille || !scoreCredit || !limiteExposition || !collateral) {
                alert("Veuillez remplir tous les champs.");
                return;
              }
              if (!ethers.isAddress(portefeuille)) {
                alert("Adresse portefeuille invalide.");
                return;
              }
              if (scoreCredit > 100 || scoreCredit < 1) {
                alert("Le score de crédit doit être entre 1 et 100.");
                return;
              }
              addContrepartie(portefeuille, scoreCredit, limiteExposition, collateral);
            }}
          >
            <div className="form-group">
              <label htmlFor="portefeuille">Adresse portefeuille:</label>
              <input
                id="portefeuille"
                type="text"
                value={newContrepartie.portefeuille}
                onChange={(e) => setNewContrepartie({ ...newContrepartie, portefeuille: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="scoreCredit">Score Crédit (1-100):</label>
              <input
                id="scoreCredit"
                type="number"
                min="1"
                max="100"
                value={newContrepartie.scoreCredit}
                onChange={(e) => setNewContrepartie({ ...newContrepartie, scoreCredit: Number(e.target.value) })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="limiteExposition">Limite Exposition:</label>
              <input
                id="limiteExposition"
                type="number"
                min="1"
                value={newContrepartie.limiteExposition}
                onChange={(e) => setNewContrepartie({ ...newContrepartie, limiteExposition: Number(e.target.value) })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="collateral">Collateral:</label>
              <input
                id="collateral"
                type="number"
                min="1"
                value={newContrepartie.collateral}
                onChange={(e) => setNewContrepartie({ ...newContrepartie, collateral: Number(e.target.value) })}
                required
              />
            </div>
            <button type="submit">Ajouter</button>
          </form>

          {/* Ajouter une Position */}
          <h3>Ajouter une Position</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const { portefeuille, montant, typePosition } = newPosition;
              if (!portefeuille || !montant || !typePosition) {
                alert("Veuillez remplir tous les champs.");
                return;
              }
              if (!ethers.isAddress(portefeuille)) {
                alert("Adresse portefeuille invalide.");
                return;
              }
              if (montant <= 0) {
                alert("Le montant doit être positif.");
                return;
              }
              if (typePosition !== "LONG" && typePosition !== "SHORT") {
                alert("Type de position invalide.");
                return;
              }
              addPosition(portefeuille, montant, typePosition);
            }}
          >
            <div className="form-group">
              <label htmlFor="positionPortefeuille">Adresse portefeuille:</label>
              <input
                id="positionPortefeuille"
                type="text"
                value={newPosition.portefeuille}
                onChange={(e) => setNewPosition({ ...newPosition, portefeuille: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="montant">Montant:</label>
              <input
                id="montant"
                type="number"
                min="1"
                value={newPosition.montant}
                onChange={(e) => setNewPosition({ ...newPosition, montant: Number(e.target.value) })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="typePosition">Type de Position:</label>
              <select
                id="typePosition"
                value={newPosition.typePosition}
                onChange={(e) => setNewPosition({ ...newPosition, typePosition: e.target.value })}
                required
              >
                <option value="LONG">LONG</option>
                <option value="SHORT">SHORT</option>
              </select>
            </div>
            <button type="submit">Ajouter Position</button>
          </form>

          {/* Tableau des Toutes les Contreparties */}
          <h3>Toutes les Contreparties</h3>
          <button type="button" onClick={loadContreparties} className="refresh-button">Actualiser la liste</button>
          {allContreparties.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Adresse</th>
                  <th>Score Crédit</th>
                  <th>Limite Exposition</th>
                  <th>Exposition Courante</th>
                  <th>Collatéral</th>
                  <th>Actif</th>
                  <th>Pénalités</th>
                  <th>Détails</th>
                </tr>
              </thead>
              <tbody>
                {allContreparties.map((c, i) => (
                  <tr key={i}>
                    <td>{c.portefeuille}</td>
                    <td>{c.scoreCredit}</td>
                    <td>{c.limiteExposition}</td>
                    <td>{c.expositionCourante}</td>
                    <td>{c.collateral}</td>
                    <td>{c.estActif ? "Oui" : "Non"}</td>
                    <td>{c.penalites}</td>
                    <td>
                      <button type="button" onClick={() => {
                        setSelectedContrepartie(c.portefeuille);
                        loadContrepartieDetails(c.portefeuille);
                      }}>
                        Voir détails
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Aucune contrepartie trouvée.</p>
          )}
        </div>
      )}

      {/* Section Utilisateur : Mes Contreparties */}
      {!isAdmin && walletAddress && (
        <div className="contreparties-section">
          <h2>Mes Contreparties</h2>
          <button type="button" onClick={loadContreparties} className="refresh-button">Actualiser la liste</button>
          {userContreparties.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Adresse</th>
                  <th>Score Crédit</th>
                  <th>Limite Exposition</th>
                  <th>Exposition Courante</th>
                  <th>Collatéral</th>
                  <th>Actif</th>
                  <th>Pénalités</th>
                  <th>Détails</th>
                </tr>
              </thead>
              <tbody>
                {userContreparties.map((c, i) => (
                  <tr key={i}>
                    <td>{c.portefeuille}</td>
                    <td>{c.scoreCredit}</td>
                    <td>{c.limiteExposition}</td>
                    <td>{c.expositionCourante}</td>
                    <td>{c.collateral}</td>
                    <td>{c.estActif ? "Oui" : "Non"}</td>
                    <td>{c.penalites}</td>
                    <td>
                      <button type="button" onClick={() => {
                        setSelectedContrepartie(c.portefeuille);
                        loadContrepartieDetails(c.portefeuille);
                      }}>
                        Voir détails
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Aucune contrepartie trouvée pour votre adresse.</p>
          )}
        </div>
      )}

      {/* Section Détails de la Contrepartie */}
      {selectedContrepartieDetails && (
        <div className="details-section">
          <h3>Détails de la Contrepartie</h3>
          <p>Adresse : {selectedContrepartieDetails.portefeuille}</p>
          <p>Score de Crédit : {selectedContrepartieDetails.scoreCredit}</p>
          <p>Limite Exposition : {selectedContrepartieDetails.limiteExposition}</p>
          <p>Exposition Courante : {selectedContrepartieDetails.expositionCourante}</p>
          <p>Collateral : {selectedContrepartieDetails.collateral}</p>
          <p>Actif : {selectedContrepartieDetails.estActif ? "Oui" : "Non"}</p>
          <p>Pénalités : {selectedContrepartieDetails.penalites} unités</p>
          {selectedContrepartieDetails.expositionCourante > 0 && (
            <p>Ratio Couverture (calculé): {selectedContrepartieDetails.ratioCouverture}%</p>
          )}
          <p>Exposition Nette (calculée) : {selectedContrepartieDetails.expositionNette} unités</p>
        </div>
      )}
    </div>
  );
}

export default App;




