/* eslint-disable react-native/no-inline-styles */
import {Config, Builder, Node} from 'ldk-node';
import {PublicKey, SocketAddr} from 'ldk-node/lib/classes/Bindings';
import React, {useState} from 'react';
import {ActivityIndicator, Button, Text, TextInput, View} from 'react-native';
import RNFS from 'react-native-fs';

let docDir = RNFS.DocumentDirectoryPath;
let host = '192.168.8.100';

let connectConfig = {
  pubkey: '020682c6d7fb645d8589bbe86e483efe14fd82a4c0982ceb6699df805a80215b4e',
  address: `${host}:9735`,
  permanently: false,
};

const App = (): JSX.Element => {
  const [loading, _loading] = useState(false);
  const [response, _response] = useState<any>();

  const [node, _node] = useState<Node>();
  const [started, _started] = useState<boolean>(false);

  const startLdk = async () => {
    console.log('START()');
    _loading(true);
    try {
      const config = await new Config().create(
        docDir,
        `http://${host}:30000`,
        'regtest',
        null,
        144,
      );
      console.log(config);

      const builder = await new Builder().fromConfig(config);
      const nodeObj: Node = await builder.build();
      _node(nodeObj);
      const st = await nodeObj.start();
      _started(st);
      console.log('Node started:', st);

      let nodeId = await nodeObj?.nodeId();
      console.log('nodeId:', nodeId.keyHex);
      _response(nodeId.keyHex);

      // console.log('Synced:', await nodeObj?.syncWallets());
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
        connectConfig.permanently,
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

  const invoiceAndBalance = async () => {
    console.log('invoiceAndBalance()');
    _loading(true);
    try {
      let invoice = await node?.receivePayment(
        10001,
        'Testing invoice from Android',
        1000,
      );
      console.log('Invoice created', invoice);

      let address = await node?.newFundingAddress();
      console.log('Address:', address?.addressHex);

      let balance = await node?.spendableOnchainBalanceSats();
      console.log('Spendable Balance:', balance);

      let totalBalance = await node?.totalOnchainBalanceSats();
      console.log('Total Balance:', totalBalance);

      let openendChannel = await node?.connectOpenChannel(
        connectConfig.pubkey,
        connectConfig.address,
        20000,
        150,
        connectConfig.permanently,
      );
      console.log('Openend Channel:', openendChannel);

      // let stopped = await node?.stop();
      // console.log('Stopped:', stopped);
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
      // let res = await node?.sendPayment(invoice);
      let res = await node?.sendPaymentUsingAmount(invoice, 2000);
      // let res = await node?.sendSpontaneousPayment(
      //   1500,
      //   new PublicKey(connectConfig.pubkey),
      // );
      console.log('Send', res);
    } catch (e) {
      console.log('Send error', e);
    }
    _loading(false);
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
        title="Invoice and balance"
        onPress={() => !loading && invoiceAndBalance()}
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
      <Margin />
      <Text selectable>{response}</Text>
      <Text selectable>{invoice}</Text>
    </View>
  );
};

const Margin = () => {
  return <View style={{marginVertical: 10}} />;
};

export default App;
