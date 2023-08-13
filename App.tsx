import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  Address,
  ChannelConfig,
  ChannelId,
  LogLevel,
  NetAddress,
  PaymentHash,
  PublicKey,
} from 'ldk-node/lib/classes/Bindings';
import {Builder, Config, Node, generateEntropyMnemonic} from 'ldk-node';
import React, {useState} from 'react';

import {Button} from './components';
import RNFS from 'react-native-fs';

let docDir = RNFS.DocumentDirectoryPath + '/';
let host = '192.168.8.100';
let port = 30000;
let esploaraServer = new NetAddress(host, port);
console.log('DOCUMENT DIRECTORY===>', docDir);

let connectConfig = {
  pubkey: '0255953ab2863bc62b0ccfe59e1c64133aae8514d43263e6f9c1fa80c5088c1d7f',
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

  const mnemonicString = async () => {
    const mnemonicRes = await generateEntropyMnemonic();
    console.log('Mnemong created', mnemonicRes);
  };

  const startLdk = async () => {
    _loading(true);
    try {
      const config = await new Config().create(
        docDir,
        '/tmp/ldk_node/',
        'regtest',
        null,
        144,
        80,
        30,
        60,
        LogLevel.error,
      );
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
    _loading(true);
    try {
      let connected = await node?.connect(
        connectConfig.pubkey,
        connectConfig.address.replace('http://', ''),
        connectConfig.persist,
      );
      console.log('Connected:', connected);
    } catch (e) {
      console.log('ERROR=====>', e);
    }
    _loading(false);
  };

  const stop = async () => {
    _loading(true);
    try {
      let stopped = await node?.stop();
      console.log('Stopped:', stopped);
    } catch (e) {
      console.log('ERROR=====>', e);
    }
    _loading(false);
  };

  const sync = async () => {
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

  const getAddressAndBalance = async () => {
    _loading(true);
    try {
      let address = await node?.newOnchainAddress();
      console.log('Address:', address?.addressHex);

      let balance = await node?.spendableOnchainBalanceSats();
      console.log('Spendable Balance:', balance);

      let totalBalance = await node?.totalOnchainBalanceSats();
      console.log('Total Balance:', totalBalance);
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
        new ChannelConfig(0, 72, 150, 75, 56),
        false,
      );
      console.log('Openend Channel:', openendChannel);
    } catch (e) {
      console.log('ERROR=====>', e);
    }
    _loading(false);
  };

  let newChannelId = new ChannelId(
    '0b039ad903776dc4fc7900fdfc1f1d91a6e5f389b95d84e8dc7dbbeb8172dc2c',
  );

  let newCunterpartyNodeId = new PublicKey(
    '0255953ab2863bc62b0ccfe59e1c64133aae8514d43263e6f9c1fa80c5088c1d7f',
  );

  const closeChannel = async () => {
    _loading(true);
    try {
      let closed = await node?.closeChannel(newChannelId, newCunterpartyNodeId);
      console.log('Channel closed:', closed);
    } catch (e) {
      console.log('ERROR=====>', e);
    }
    _loading(false);
  };

  const updateChannelConfig = async () => {
    _loading(true);
    try {
      let updated = await node?.updateChannelConfig(
        newChannelId,
        newCunterpartyNodeId,
        new ChannelConfig(100, 50, 50, 50, 50),
      );
      console.log('Channel config updated:', updated);
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
    _loading(true);
    try {
      let res = await node?.sendPayment(invoice);
      console.log('Send', res);
    } catch (e) {
      console.log('Send error', e);
    }
    _loading(false);
  };

  const sendToOnChain = async () => {
    _loading(true);
    try {
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
    <ScrollView
      contentContainerStyle={{
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
      }}>
      <SafeAreaView>
        <Button
          title="Start LDK Node"
          onPress={() => !loading && startLdk()}
          color={started ? 'gray' : 'green'}
        />

        <Button
          title="ConnectPeer"
          onPress={() => !loading && connectPeer()}
          color={loading ? 'gray' : 'green'}
        />

        <Button
          title="Sync"
          onPress={() => !loading && sync()}
          color={loading ? 'gray' : 'green'}
        />

        <Button
          title="Get Address and balance"
          onPress={() => !loading && getAddressAndBalance()}
          color={loading ? 'gray' : 'green'}
        />

        <Button
          title="Open Channel"
          onPress={() => !loading && openChannel()}
          color={loading ? 'gray' : 'green'}
        />

        <Button
          title="Update Channel Config"
          onPress={() => !loading && updateChannelConfig()}
          color={loading ? 'gray' : 'green'}
        />

        <Button
          title="Close Channel"
          onPress={() => !loading && closeChannel()}
          color={loading ? 'gray' : 'green'}
        />

        <Button
          title="Receive Payment"
          onPress={() => !loading && receivePayment()}
          color={loading ? 'gray' : 'green'}
        />

        <Button
          title="List Peers"
          onPress={() => !loading && listPeers()}
          color={loading ? 'gray' : 'green'}
        />

        <Button
          title="List Channels"
          onPress={() => !loading && listChannels()}
          color={loading ? 'gray' : 'green'}
        />

        {loading && <ActivityIndicator />}
        <TextInput
          value={invoice}
          onChangeText={_invoice}
          style={{borderWidth: 2, width: 300, paddingVertical: 15}}
        />

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

        <Text selectable>{response}</Text>
        <Text selectable>{invoice}</Text>
      </SafeAreaView>
    </ScrollView>
  );
};
export default App;
