/* eslint-disable react-native/no-inline-styles */
import {Config, Builder, Node} from 'ldk-node-rn';
import React, {useState} from 'react';
import {ActivityIndicator, Button, Text, TextInput, View} from 'react-native';
import RNFS from 'react-native-fs';

let docDir = RNFS.DocumentDirectoryPath;

let connectConfig = {
  pubkey: '02e72b0c13bccb21847bbcbe6f883668bd5a1928eb1ae7efefb8ad97b775ecdaf3',
  address: '127.0.0.1:9735',
  permanently: false,
};

const App = (): JSX.Element => {
  const [loading, _loading] = useState(false);
  const [response, _response] = useState<any>();

  const [node, _node] = useState<Node>();
  const [started, _started] = useState<boolean>(false);

  const startLdk = async () => {
    _loading(true);
    try {
      const config = await new Config().create(
        docDir,
        'http://127.0.0.1:30000',
        'regtest',
        '0.0.0.0:9735',
        144,
      );

      const builder = await new Builder().fromConfig(config);
      const nodeObj: Node = await builder.build();
      _node(nodeObj);
      const st = await nodeObj.start();
      _started(st);
      console.log('Node started:', st);

      let nodeId = await nodeObj?.nodeId();
      console.log('nodeId:', nodeId);
      _response(nodeId);

      console.log('Synced:', await nodeObj?.syncWallets());
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
    _loading(true);
    try {
      console.log('Synced:', await node?.syncWallets());
      let nodeId = await node?.nodeId();
      _response(nodeId);
      console.log('nodeId:', nodeId);
    } catch (e) {
      console.log('ERROR=====>', e);
    }
    _loading(false);
  };

  const invoinceAndBalance = async () => {
    _loading(true);
    try {
      let invoice = await node?.receivePayment(10001, 'Test invoice', 1000);
      console.log('Invoice created', invoice);

      let openendChannel = await node?.connectOpenChannel(
        connectConfig.pubkey,
        connectConfig.address,
        20000,
        150,
        connectConfig.permanently,
      );
      console.log('Openend Channel:', openendChannel);

      let address = await node?.newFundingAddress();
      console.log('Address:', address);

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
  return (
    <View style={{justifyContent: 'center', alignItems: 'center', flex: 1}}>
      <Button
        title="Start LDK Node"
        onPress={() => !started && startLdk()}
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
        title="Invoice and balance"
        onPress={() => !loading && invoinceAndBalance()}
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
      <Text selectable>{response}</Text>
      <Text selectable>{invoice}</Text>
    </View>
  );
};

export default App;
