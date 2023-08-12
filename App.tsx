import {ActivityIndicator, Button, Text, TextInput, View} from 'react-native';
import {
  Address,
  ChannelId,
  NetAddress,
  PaymentHash,
  PublicKey,
} from 'ldk-node/lib/classes/Bindings';
import {Builder, Config, Node} from 'ldk-node';
import React, {useState} from 'react';

import RNFS from 'react-native-fs';

let docDir = RNFS.DocumentDirectoryPath + '/';
let host = 'http://192.168.8.100';
let port = 30000;
let esploaraServer = new NetAddress(host, port);
console.log('DOCUMENT DIRECTORY===>', docDir);

let connectConfig = {
  pubkey: '03bc9ca485a5e09460bcac68fb7edbc727f54beeb48e468d0c74ce25fd5b0dab15',
  address: `${host}:9735`,
  persist: false,
};

let bytesArr = Array.from({length: 64}, () => Math.floor(Math.random() * 100));
let mnemonicString =
  'cream ecology sniff amazing awful ocean gaze can peanut abandon emotion affair';

const App = (): JSX.Element => {
  const [loading, _loading] = useState(false);
  const [response, _response] = useState<any>();

  const [node, _node] = useState<Node>();
  const [started, _started] = useState<boolean>(false);

  const startLdk = async () => {
    console.log('START()');
    _loading(true);
    try {
      const config = await new Config().create(docDir, 'regtest', null, 144);
      const builder = await new Builder().fromConfig(config);

      await builder.setEsploraServer(esploaraServer);
      // await builder.setEntropySeedPath(docDir + 'seed.txt');
      // await builder.setEntropySeedBytes(bytesArr);
      // await builder.setEntropyBip39Mnemonic(mnemonicString);
      // await builder.setGossipSourceP2p();
      // await builder.setGossipSourceRgs(esploaraServer);
      // await builder.setStorageDirPath(docDir + 'wallet.txt');
      // await builder.setNetwork('regtest');
      // await builder.setListeningAddress(new NetAddress('127.0.0.1', 80));
      const nodeObj: Node = await builder.build();
      _node(nodeObj);

      const st = await nodeObj.start();

      _started(st);
      console.log('Node started:', st);

      let nodeId = await nodeObj?.nodeId();
      console.log('nodeId:', nodeId.keyHex);
      _response(nodeId.keyHex);
    } catch (e) {
      console.log('ERROR=====>', e);
    }
    _loading(false);
  };

  const connectPeer = async () => {
    console.log('ConnectPeer()');
    _loading(true);
    try {
      let connected = await node?.connect(
        connectConfig.pubkey,
        connectConfig.address,
        connectConfig.persist,
      );
      console.log('Connected:', connected);
    } catch (e) {
      console.log('ERROR=====>', e);
    }
    _loading(false);
  };

  const sync = async () => {
    console.log('SYNC()');
    _loading(true);
    try {
      console.log('Synced:', await node?.syncWallets());
      let nodeId = await node?.nodeId();
      console.log('NodeId:', nodeId);
    } catch (e) {
      console.log('ERROR=====>', e);
    }
    _loading(false);
  };

  const getBalance = async () => {
    console.log('invoiceAndBalance()');
    _loading(true);
    try {
      let address = await node?.newOnchainAddress();
      console.log('Address:', address?.addressHex);

      let balance = await node?.spendableOnchainBalanceSats();
      console.log('Spendable Balance:', balance);

      let totalBalance = await node?.totalOnchainBalanceSats();
      console.log('Total Balance:', totalBalance);

      // let stopped = await node?.stop();
      // console.log('Stopped:', stopped);
    } catch (e) {
      console.log('ERROR=====>', e);
    }
    _loading(false);
  };

  const openChannel = async () => {
    console.log('OpenChannel()');
    _loading(true);
    try {
      let openendChannel = await node?.connectOpenChannel(
        connectConfig.pubkey,
        connectConfig.address,
        20000,
        150,
        connectConfig.persist,
      );
      console.log('Openend Channel:', openendChannel);
    } catch (e) {
      console.log('ERROR=====>', e);
    }
    _loading(false);
  };

  const closeChannel = async () => {
    _loading(true);
    try {
      let closed = await node?.closeChannel(
        new ChannelId(
          '2d98ebe60571ef9a13d592af96ebacaef0ad68e10c1e1e9832880af603a89dfb',
        ),
        new PublicKey(
          '02ad94ac26d5b35f23bec4e27044f08c3ec06f4b25f9b4924a8a1130d862efa52a',
        ),
      );
      console.log('Channel closed:', closed);
    } catch (e) {
      console.log('ERROR=====>', e);
    }
    _loading(false);
  };

  const receivePayment = async () => {
    _loading(true);
    try {
      let invoice = await node?.receivePayment(
        10001,
        'Testing invoice from Android',
        1000,
      );
      let invoice1 = await node?.receiveVariableAmountPayment(
        'Testing variable invoice',
        1000,
      );
      console.log('Invoice created', invoice);
    } catch (e) {
      console.log('ERROR=====>', e);
    }
    _loading(false);
  };

  const listPeers = async () => {
    const peers = await node?.listPeers();
    console.log(peers);
  };

  const listChannels = async () => {
    const channels = await node?.listChannels();
    console.log(channels);
  };

  const [invoice, _invoice] = useState('');
  const send = async () => {
    console.log('SEND()');
    _loading(true);
    try {
      // let res = await node?.sendPaymentUsingAmount(invoice, 2000);
      // let res = await node?.sendSpontaneousPayment(
      //   5000,
      //   new PublicKey(connectConfig.pubkey),
      // );

      let res = await node?.sendPayment(invoice);
      console.log('Send', res);
    } catch (e) {
      console.log('Send error', e);
    }
    _loading(false);
  };

  const sendToOnChain = async () => {
    console.log('SEND To Chain()');
    _loading(true);
    try {
      // let res = await node?.sendToOnchainAddress(
      //   new Address('bcrt1qn5ljhz3aaww0s23jkzwlzmy89n70rlcldc7845'),
      //   2000,
      // );

      let res = await node?.sendAllToOnchainAddress(
        new Address('bcrt1qn5ljhz3aaww0s23jkzwlzmy89n70rlcldc7845'),
      );

      console.log('Send', res);
    } catch (e) {
      console.log('Send error', e);
    }
    _loading(false);
  };

  const paymentDetails = async () => {
    try {
      let hash = new PaymentHash(
        'b800ecac003038b383e0529bacd8652caffd7a101576e75149e2050cc48a6c91',
      );
      // let remove = await node?.removePayment(hash);
      let remove = await node?.payment(hash);
      console.log('App level', remove);
    } catch (e) {
      console.log('Error occured::', e);
    }
  };

  const signAndVerify = async () => {
    try {
      let msg = [15, 20, 25, 56];
      let pkey = new PublicKey(connectConfig.pubkey);
      let sig = await node?.signMessage(msg);

      let verify = await node?.verifySignature(msg, sig!, pkey);
      console.log('Sign', sig);
      console.log('Verify', verify);
    } catch (e) {
      console.log('Error occured::', e);
    }
  };

  return (
    <View style={{justifyContent: 'center', alignItems: 'center', flex: 1}}>
      <Button
        title="Start LDK Node"
        onPress={() => !loading && startLdk()}
        color={started ? 'gray' : 'green'}
      />
      <Margin />
      <Button
        title="ConnectPeer"
        onPress={() => !loading && connectPeer()}
        color={loading ? 'gray' : 'green'}
      />
      <Margin />
      <Button
        title="Sync"
        onPress={() => !loading && sync()}
        color={loading ? 'gray' : 'green'}
      />
      <Margin />
      <Button
        title="Get balance"
        onPress={() => !loading && getBalance()}
        color={loading ? 'gray' : 'green'}
      />

      <Margin />
      <Button
        title="Open Channel"
        onPress={() => !loading && openChannel()}
        color={loading ? 'gray' : 'green'}
      />
      <Button
        title="Close Channel"
        onPress={() => !loading && closeChannel()}
        color={loading ? 'gray' : 'green'}
      />

      <Margin />
      <Button
        title="Receive Payment"
        onPress={() => !loading && receivePayment()}
        color={loading ? 'gray' : 'green'}
      />
      <Margin />
      <Button
        title="List Peers"
        onPress={() => !loading && listPeers()}
        color={loading ? 'gray' : 'green'}
      />
      <Margin />
      <Button
        title="List Channels"
        onPress={() => !loading && listChannels()}
        color={loading ? 'gray' : 'green'}
      />
      <Margin />
      {loading && <ActivityIndicator />}
      <TextInput
        value={invoice}
        onChangeText={_invoice}
        style={{borderWidth: 2, width: 300, paddingVertical: 15}}
      />
      <Margin />
      <Button
        title="Send"
        onPress={() => !loading && send()}
        color={loading ? 'gray' : 'green'}
      />
      <Button
        title="send To OnChain"
        onPress={() => !loading && sendToOnChain()}
        color={loading ? 'gray' : 'green'}
      />

      <Button
        title="Payment details"
        onPress={() => !loading && paymentDetails()}
        color={loading ? 'gray' : 'green'}
      />
      <Button
        title="Sign & Verify"
        onPress={() => !loading && signAndVerify()}
        color={loading ? 'gray' : 'green'}
      />

      <Margin />
      <Text selectable>{response}</Text>
      <Text selectable>{invoice}</Text>
    </View>
  );
};

const Margin = () => {
  return <View style={{marginVertical: 2}} />;
};

export default App;
