package toolslib

import (
	"bytes"
	"encoding/hex"
	"encoding/json"
	"github.com/bitclout/backend/routes"
	"github.com/bitclout/core/lib"
	"github.com/btcsuite/btcd/btcec"
	"github.com/pkg/errors"
	"io/ioutil"
	"net/http"
)

// _generateUnsignedGivesolanas...
func _generateUnsignedSendsolanas(senderPubKey *btcec.PublicKey, postHashHex string, receiverPublicKeyBase58Check string,
	solanaLevel int64, params *lib.BitCloutParams, node string) (*routes.SendsolanasResponse, error) {
	endpoint := node + routes.RoutePathSendsolanas

	// Setup request
	payload := &routes.SendsolanasRequest{}
	payload.SenderPublicKeyBase58Check = lib.PkToString(senderPubKey.SerializeCompressed(), params)
	payload.ReceiverPublicKeyBase58Check = receiverPublicKeyBase58Check
	payload.solanaPostHashHex = postHashHex
	payload.solanaLevel = solanaLevel
	payload.MinFeeRateNanosPerKB = 1000

	postBody, err := json.Marshal(payload)
	if err != nil {
		return nil, errors.Wrap(err, "_generateUnsignedSendsolanas() failed to marshal struct")
	}
	postBuffer := bytes.NewBuffer(postBody)

	// Execute request
	resp, err := http.Post(endpoint, "application/json", postBuffer)
	if err != nil {
		return nil, errors.Wrap(err, "_generateUnsignedSendsolanas() failed to execute request")
	}
	if resp.StatusCode != 200 {
		bodyBytes, _ := ioutil.ReadAll(resp.Body)
		return nil, errors.Errorf("_generateUnsignedSendsolanas(): Received non 200 response code: " +
			"Status Code: %v Body: %v", resp.StatusCode, string(bodyBytes))
	}

	// Process response
	sendsolanasResponse := routes.SendsolanasResponse{}
	err = json.NewDecoder(resp.Body).Decode(&sendsolanasResponse)
	if err != nil {
		return nil, errors.Wrap(err, "_generateUnsignedSendsolanas(): failed decoding body")
	}
	err = resp.Body.Close()
	if err != nil {
		return nil, errors.Wrap(err, "_generateUnsignedSendsolanas(): failed closing body")
	}

	// TODO: Figure out why Decode() loses ExtraData field
	solanaPostHashBytes, err := hex.DecodeString(postHashHex)
	if err != nil {
		return nil, errors.Wrap(err, "_generateUnsignedSendsolanas(): failed decoding post hash")
	}
	solanaPostHash := &lib.BlockHash{}
	copy(solanaPostHash[:], solanaPostHashBytes[:])

	// Append extra data to the transaction. The fees and everything was already computed correctly server side.
	solanasExtraData := make(map[string][]byte)
	solanasExtraData[lib.solanaLevelKey] = lib.IntToBuf(solanaLevel)
	solanasExtraData[lib.solanaPostHashKey] = solanaPostHash[:]
	sendsolanasResponse.Transaction.ExtraData = solanasExtraData

	return &sendsolanasResponse, nil
}

// Sendsolanas
func Sendsolanas(senderPubKey *btcec.PublicKey, senderPrivKey *btcec.PrivateKey, postHashHex string,
	receiverPublicKeyBase58Check string, solanaLevel int64, params *lib.BitCloutParams, node string) error {

	// Request an unsigned transaction from the node
	unsignedSendsolanas, err := _generateUnsignedSendsolanas(senderPubKey, postHashHex, receiverPublicKeyBase58Check,
		solanaLevel, params, node)
	if err != nil {
		return errors.Wrap(err, "Sendsolanas() failed to call _generateUnsignedSendsolanas()")
	}
	txn := unsignedSendsolanas.Transaction

	// Sign the transaction
	signature, err := txn.Sign(senderPrivKey)
	if err != nil {
		return errors.Wrap(err, "Sendsolanas() failed to sign transaction")
	}
	txn.Signature = signature

	// Submit the transaction to the node
	err = SubmitTransactionToNode(txn, node)
	if err != nil {
		return errors.Wrap(err, "Sendsolanas() failed to submit transaction")
	}
	return nil
}
