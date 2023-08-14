import {Builder, Config, Node} from 'ldk-node';
import {Button, ChannelParams, ChannelsListView, Header, MnemonicView, OpenChannelModal} from './components';
import {ChannelDetails, NetAddress} from 'ldk-node/lib/classes/Bindings';
import {Fragment, useState} from 'react';
import {SafeAreaView, ScrollView, Text, TouchableOpacity, View} from 'react-native';

import RNFS from 'react-native-fs';
import {styles} from './styles';

let docDir = RNFS.DocumentDirectoryPath + '/';
let host = '192.168.8.100';
let port = 30000;
let esploaraServer = `http://${host}:${port}`;

export const App = (): JSX.Element => {
  const [started, setStarted] = useState(false);
  const [node, setNode] = useState<Node>();
  const [nodeInfo, setNodeInfo] = useState({nodeId: '', listeningAddress: ''});
  const [balance, setBalance] = useState<any>('0.0');
  const [onChainAddress, setOnChainAddress] = useState<any>();
  const [showChannelModal, setShowChannelModal] = useState(false);

  const [channels, setChannels] = useState<Array<ChannelDetails>>();

  const buildNode = async (mnemonic: string) => {
    try {
      const config = await new Config().create(docDir + 'rn_node', 'regtest', new NetAddress(host, 50000));
      const builder = await new Builder().fromConfig(config);
      await builder.setEsploraServer(esploaraServer);
      await builder.setEntropyBip39Mnemonic(mnemonic);
      const nodeObj: Node = await builder.build();
      setNode(nodeObj);
      setStarted(await nodeObj.start());

      /*=====Get/Set Node Info*/
      let nodeId = await nodeObj.nodeId();
      let listeningAddr = await nodeObj.listeningAddress();
      setNodeInfo({nodeId: nodeId.keyHex, listeningAddress: `${listeningAddr?.ip}: ${listeningAddr?.port}`});
    } catch (e) {
      console.log('Error in starting and build Node:', e);
    }
  };

  const onChainBalance = async () => {
    try {
      await node?.syncWallets();
      setBalance(await node?.totalOnchainBalanceSats());
    } catch (e) {
      console.log('Error in syncing wallet:', e);
    }
  };

  const newOnchainAddress = async () => {
    try {
      let addr = await node?.newOnchainAddress();
      setOnChainAddress(addr?.addressHex);
    } catch (e) {
      console.log('Error in syncing wallet:', e);
    }
  };

  const openChannelCallback = async (params: ChannelParams) => {
    try {
      let addr = new NetAddress(params.ip, parseInt(params.port));
      await node?.connect(params.nodeId, addr, false);
      let opened = await node?.connectOpenChannel(params.nodeId, addr, parseInt(params.amount), parseInt(params.counterPartyAmount), null, false);
      console.log('Channel opened', opened);
      setShowChannelModal(false);
    } catch (e) {
      console.log('Error in opening channel:', e);
    }
  };

  const listChannels = async () => {
    try {
      const list = await node?.listChannels();
      console.log('Channels', list);
      setChannels(list);
    } catch (e) {
      console.log('Error in syncing wallet:', e);
    }
  };

  return (
    <SafeAreaView>
      <Header />
      <View style={styles.container}>
        {!started ? (
          <MnemonicView buildNodeCallback={buildNode} />
        ) : (
          <ScrollView>
            <Text style={styles.greenText}>Node started successfully....</Text>
            <View style={styles.responseBox}>
              <Text style={styles.balanceText}>{balance / 100000000} BTC</Text>
              <Text>Listening Address: {nodeInfo.listeningAddress}</Text>
              <Text>Node ID:</Text>
              <Text selectable>{nodeInfo.nodeId}</Text>
              {onChainAddress && (
                <Fragment>
                  <Text>New Address:</Text>
                  <Text selectable>{onChainAddress}</Text>
                </Fragment>
              )}
            </View>

            <Button title="On Chain Balance" onPress={onChainBalance} />
            <Button title="New Funding Address" onPress={newOnchainAddress} />
            <Button title="List Channels" onPress={listChannels} />
            <View style={styles.row}>
              <Text style={styles.boldText}>Channels</Text>
              <TouchableOpacity style={{...styles.plusButton}} onPress={() => setShowChannelModal(true)}>
                <Text style={styles.boldText}>+</Text>
              </TouchableOpacity>
            </View>
            <ChannelsListView channels={channels} />
          </ScrollView>
        )}
      </View>
      {showChannelModal && <OpenChannelModal openChannelCallback={openChannelCallback} cancelCallback={() => setShowChannelModal(false)} />}
    </SafeAreaView>
  );
};
